import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import { IComplaint } from '../types';
import { ComplaintCard } from '../components/complaints/ComplaintCard';
import { Skeleton } from '../components/ui/Skeleton';
import {
  PlusCircle,
  Clock,
  Play,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Layers,
  Star,
  MapPin,
  Building,
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [complaints, setComplaints] = useState<IComplaint[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentDashboardData();
  }, []);

  const loadStudentDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints?limit=6');
      setComplaints(res.data.data.complaints || []);
      setStats(res.data.data.countsByStatus || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pendingFeedback = complaints.filter(
    (c) => c.status === 'Resolved' && !c.feedback
  );

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-gradient-to-r from-indigo-950/40 via-slate-900 to-purple-950/30 border-indigo-500/20">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Student Portal
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Welcome, {user?.name}!
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                {user?.studentId && (
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Building className="w-3.5 h-3.5 text-indigo-400" /> ID: {user.studentId}
                  </span>
                )}
                {user?.hostelBlock && (
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-purple-400" /> {user.hostelBlock}
                    {user.roomNumber ? `, Room ${user.roomNumber}` : ''}
                  </span>
                )}
              </div>
            </div>

            <Link
              href="/complaints/new"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all shadow-glow flex-shrink-0"
            >
              <PlusCircle className="w-5 h-5" />
              File New Complaint
            </Link>
          </div>
        </div>

        {/* Feedback Alert for Resolved Complaints */}
        {pendingFeedback.length > 0 && (
          <div className="glass-card rounded-2xl p-5 border-amber-500/30 bg-amber-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Resolution Feedback Needed</h3>
                <p className="text-xs text-slate-300">
                  You have {pendingFeedback.length} resolved complaint(s) waiting for your rating.
                </p>
              </div>
            </div>
            <Link
              href={`/complaints/${pendingFeedback[0]._id}`}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-amber-950 bg-amber-400 hover:bg-amber-300 transition-colors whitespace-nowrap"
            >
              Rate Resolution Quality →
            </Link>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Filed
              </span>
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {stats['all'] || 0}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                In Review / Submitted
              </span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">
              {(stats['Submitted'] || 0) + (stats['Under Review'] || 0)}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                In Progress / Active
              </span>
              <Play className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400">
              {(stats['Assigned'] || 0) + (stats['In Progress'] || 0)}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Resolved & Closed
              </span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
              {(stats['Resolved'] || 0) + (stats['Closed'] || 0)}
            </div>
          </div>
        </div>

        {/* Recent Complaints Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Your Recent Complaints</h2>
              <p className="text-xs text-slate-400">
                Track status updates and departmental communications
              </p>
            </div>
            <Link
              href="/complaints"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-44 w-full" />
              <Skeleton className="h-44 w-full" />
            </div>
          ) : complaints.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No complaints filed yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Whenever you encounter a Wi-Fi issue, broken hostel fixture, or academic problem, report it here.
              </p>
              <Link
                href="/complaints/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500"
              >
                <PlusCircle className="w-4 h-4" />
                Submit Your First Complaint
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {complaints.map((complaint) => (
                <ComplaintCard key={complaint._id} complaint={complaint} />
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
