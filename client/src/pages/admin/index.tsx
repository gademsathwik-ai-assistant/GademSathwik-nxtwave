import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { api } from '../../services/api';
import { useUIStore } from '../../store/uiStore';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  ShieldCheck,
  TrendingUp,
  Clock,
  CheckCircle,
  Star,
  Users,
  Building,
  Flame,
  Zap,
  Activity,
  ArrowRight,
  Layers,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [triggeringJob, setTriggeringJob] = useState(false);
  const { addToast } = useUIStore();

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics');
      setAnalytics(res.data.data);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Failed to load analytics',
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleTriggerEscalation = async () => {
    setTriggeringJob(true);
    try {
      const res = await api.post('/jobs/trigger-escalation');
      const escalatedCount = res.data.data.escalatedCount;
      addToast({
        type: 'success',
        title: 'Escalation Scanner Run Complete',
        message: `Scanned all open complaints. Escalated ${escalatedCount} overdue tickets to Urgent.`,
      });
      fetchAnalytics();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Escalation trigger failed',
        message: err.message,
      });
    } finally {
      setTriggeringJob(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'staff']}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-purple-500/30">
              <ShieldCheck className="w-3.5 h-3.5" /> Administrative Command Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Campus Resolution Metrics</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Real-time monitoring of campus workload, resolution velocity, and departmental SLAs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTriggerEscalation}
              disabled={triggeringJob}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all shadow-glow-rose disabled:opacity-50"
            >
              <Flame className="w-4 h-4" />
              {triggeringJob ? 'Running Scanner...' : 'Trigger Auto-Escalations'}
            </button>
            <Link
              href="/complaints"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all shadow-glow"
            >
              <Layers className="w-4 h-4" />
              Manage All Complaints
            </Link>
          </div>
        </div>

        {/* Executive KPI Cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <Skeleton key={n} className="h-32 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="glass-card rounded-2xl p-5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Total Complaints
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {analytics?.kpis?.totalComplaints || 0}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Campus wide</div>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Active Open Issues
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">
                {analytics?.kpis?.openComplaints || 0}
              </div>
              <div className="text-[10px] text-amber-500/80 mt-1">In progress & review</div>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Resolution Rate
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                {analytics?.kpis?.resolutionRate || 0}%
              </div>
              <div className="text-[10px] text-emerald-500/80 mt-1">Closed successfully</div>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Avg Resolution SLA
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400">
                {analytics?.kpis?.avgResolutionHours || 0} <span className="text-sm font-normal">hrs</span>
              </div>
              <div className="text-[10px] text-cyan-500/80 mt-1">Turnaround time</div>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Student Satisfaction
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-yellow-400 flex items-center gap-1">
                {analytics?.kpis?.avgSatisfactionScore || '5.0'}
                <Star className="w-5 h-5 fill-yellow-400" />
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Out of 5.0 stars</div>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Registered Students
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-400">
                {analytics?.kpis?.studentCount || 0}
              </div>
              <div className="text-[10px] text-purple-400/80 mt-1">
                {analytics?.kpis?.staffCount || 0} Staff Active
              </div>
            </div>
          </div>
        )}

        {/* Detailed Breakdown Grids */}
        {!loading && analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Status Breakdown & Category Distribution */}
            <div className="lg:col-span-6 space-y-6">
              {/* Status Breakdown */}
              <div className="glass-card rounded-3xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" /> Status Distribution
                </h3>
                <div className="space-y-3">
                  {Object.entries(analytics.statusDistribution || {}).map(([status, count]: any) => {
                    const total = analytics.kpis?.totalComplaints || 1;
                    const percent = Math.round((count / total) * 100);
                    return (
                      <div key={status} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-300">
                          <span>{status}</span>
                          <span>
                            {count} tickets ({percent}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              status === 'Resolved' || status === 'Closed'
                                ? 'bg-emerald-500'
                                : status === 'In Progress'
                                ? 'bg-indigo-500'
                                : status === 'Assigned'
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="glass-card rounded-3xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" /> Complaints by Category
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {(analytics.categoryDistribution || []).map((cat: any) => (
                    <div
                      key={cat.category}
                      className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between"
                    >
                      <span className="text-xs font-semibold text-slate-300 truncate">
                        {cat.category}
                      </span>
                      <span className="text-xs font-bold text-indigo-400 px-2 py-0.5 rounded-md bg-indigo-950/80 border border-indigo-500/30">
                        {cat.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Department Workload & Recent Activity */}
            <div className="lg:col-span-6 space-y-6">
              {/* Department Workload */}
              <div className="glass-card rounded-3xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-cyan-400" /> Departmental Workload
                </h3>
                <div className="space-y-3">
                  {(analytics.departmentWorkload || []).map((dept: any) => (
                    <div
                      key={dept.departmentName}
                      className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-white truncate max-w-[200px]">
                          {dept.departmentName}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {dept.resolved} resolved · {dept.open} pending
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2.5 py-1 rounded-xl bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/30">
                          {dept.total} Total
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity Audit Logs */}
              <div className="glass-card rounded-3xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-400" /> Recent Campus Audit Stream
                </h3>
                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                  {(analytics.recentActivity || []).map((activity: any) => (
                    <div
                      key={activity._id}
                      className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span className="font-semibold text-slate-200">
                          {activity.actorId?.name || 'System'}
                        </span>
                        <time>{new Date(activity.timestamp).toLocaleTimeString()}</time>
                      </div>
                      <p className="text-slate-300 line-clamp-1">{activity.message}</p>
                      {activity.complaintId && (
                        <Link
                          href={`/complaints/${activity.complaintId._id || activity.complaintId}`}
                          className="text-[10px] text-indigo-400 hover:underline inline-block pt-0.5"
                        >
                          View Ticket: {activity.complaintId.title || 'Details'} →
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
