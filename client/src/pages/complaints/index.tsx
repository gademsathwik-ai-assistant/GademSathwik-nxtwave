import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { IComplaint } from '../../types';
import { ComplaintCard } from '../../components/complaints/ComplaintCard';
import { ComplaintFilterBar } from '../../components/complaints/ComplaintFilterBar';
import { Skeleton } from '../../components/ui/Skeleton';
import { PlusCircle, Layers, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ComplaintsListPage() {
  const { user } = useAuthStore();

  const [complaints, setComplaints] = useState<IComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  // Filter states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: 8,
      };
      if (search.trim()) params.search = search.trim();
      if (selectedCategory) params.category = selectedCategory;
      if (selectedPriority) params.priority = selectedPriority;
      if (selectedStatus) params.status = selectedStatus;

      const res = await api.get('/complaints', { params });
      setComplaints(res.data.data.complaints || []);
      setTotal(res.data.data.total || 0);
      setTotalPages(res.data.data.totalPages || 1);
      setStatusCounts(res.data.data.countsByStatus || {});
    } catch (err) {
      console.error('Error loading complaints:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedCategory, selectedPriority, selectedStatus]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedPriority('');
    setSelectedStatus('');
    setPage(1);
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {user?.role === 'student' ? 'My Complaints' : 'Campus Grievance Registry'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              {user?.role === 'student'
                ? 'Track your submitted issues and responses from campus departments.'
                : 'Manage, assign, and resolve student complaints with audit tracking.'}
            </p>
          </div>

          {user?.role === 'student' && (
            <Link
              href="/complaints/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all shadow-glow"
            >
              <PlusCircle className="w-4 h-4" />
              Submit Complaint
            </Link>
          )}
        </div>

        {/* Filter Bar */}
        <ComplaintFilterBar
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          selectedCategory={selectedCategory}
          onCategoryChange={(val) => {
            setSelectedCategory(val);
            setPage(1);
          }}
          selectedPriority={selectedPriority}
          onPriorityChange={(val) => {
            setSelectedPriority(val);
            setPage(1);
          }}
          selectedStatus={selectedStatus}
          onStatusChange={(val) => {
            setSelectedStatus(val);
            setPage(1);
          }}
          statusCounts={statusCounts}
          onReset={handleResetFilters}
        />

        {/* Content Area */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <Skeleton key={n} className="h-44 w-full" />
            ))}
          </div>
        ) : complaints.length === 0 ? (
          <div className="glass-card rounded-2xl p-16 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No complaints match your filter</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search criteria, category, or status tab filter.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-950/50 border border-indigo-500/30 hover:bg-indigo-900/50 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complaints.map((complaint) => (
              <ComplaintCard key={complaint._id} complaint={complaint} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
            <span>
              Showing {complaints.length} of {total} results
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-white px-2">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
