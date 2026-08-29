import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '../store/authStore';
import {
  ShieldCheck,
  Zap,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Users,
  Building,
  Activity,
  ChevronRight,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="space-y-24 py-6">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto pt-8 pb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6 shadow-glow">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Next-Gen Campus Grievance Platform
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight sm:leading-none mb-6">
          Report Campus Issues.{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Track Progress.
          </span>{' '}
          Resolve Instantly.
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
          Replace manual paperwork and delays with a transparent, real-time platform. Route complaints
          directly to departments with full auditability, automated escalations, and live updates.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          {isAuthenticated ? (
            <Link
              href={user?.role === 'student' ? '/dashboard' : '/admin'}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95 transition-all shadow-glow"
            >
              Go to {user?.role === 'student' ? 'Student Dashboard' : 'Admin Portal'}
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95 transition-all shadow-glow"
              >
                Access Portal
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-2xl transition-all"
              >
                Register as Student
              </Link>
            </>
          )}
        </div>

        {/* Quick Demo Credentials Reminder */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 inline-flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
          <span className="font-semibold text-slate-300">⚡ Pre-seeded Demo Logins:</span>
          <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
            Student: <code className="text-indigo-400">student@campus.edu</code> /{' '}
            <code className="text-slate-400">Student@123</code>
          </span>
          <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
            Admin: <code className="text-purple-400">admin@campus.edu</code> /{' '}
            <code className="text-slate-400">Admin@123</code>
          </span>
          <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
            Staff: <code className="text-cyan-400">staff.it@campus.edu</code> /{' '}
            <code className="text-slate-400">Staff@123</code>
          </span>
        </div>
      </section>

      {/* Metrics Ticker */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
        <div className="glass-card rounded-2xl p-6 text-center">
          <div className="text-3xl sm:text-4xl font-extrabold text-indigo-400 mb-1">98.4%</div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Resolution Rate
          </p>
        </div>
        <div className="glass-card rounded-2xl p-6 text-center">
          <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 mb-1">&lt; 18h</div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Avg Turnaround SLA
          </p>
        </div>
        <div className="glass-card rounded-2xl p-6 text-center">
          <div className="text-3xl sm:text-4xl font-extrabold text-purple-400 mb-1">100%</div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Audit Trail Visibility
          </p>
        </div>
        <div className="glass-card rounded-2xl p-6 text-center">
          <div className="text-3xl sm:text-4xl font-extrabold text-cyan-400 mb-1">Real-Time</div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Socket.IO Notifications
          </p>
        </div>
      </section>

      {/* Complaint Lifecycle Stepper */}
      <section className="max-w-6xl mx-auto glass-card rounded-3xl p-8 sm:p-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            End-to-End Complaint Lifecycle
          </h2>
          <p className="text-sm text-slate-400">
            Every complaint moves through strict validation stages with complete accountability.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            {
              step: '1',
              title: 'Submitted',
              desc: 'Student files grievance with photos & room location',
              color: 'text-slate-300 border-slate-700 bg-slate-900',
            },
            {
              step: '2',
              title: 'Under Review',
              desc: 'Admin triage & auto-priority assessment',
              color: 'text-amber-300 border-amber-500/40 bg-amber-950/20',
            },
            {
              step: '3',
              title: 'Assigned',
              desc: 'Routed to specific department engineer or warden',
              color: 'text-blue-300 border-blue-500/40 bg-blue-950/20',
            },
            {
              step: '4',
              title: 'In Progress',
              desc: 'Staff works on site; logs real-time updates',
              color: 'text-indigo-300 border-indigo-500/40 bg-indigo-950/20',
            },
            {
              step: '5',
              title: 'Resolved',
              desc: 'Fix applied with detailed resolution notes',
              color: 'text-emerald-300 border-emerald-500/40 bg-emerald-950/20 shadow-glow-emerald',
            },
            {
              step: '6',
              title: 'Closed',
              desc: 'Student reviews & submits 5-star rating',
              color: 'text-purple-300 border-purple-500/40 bg-purple-950/20',
            },
          ].map((item) => (
            <div key={item.step} className={`rounded-2xl border p-4 ${item.color}`}>
              <div className="text-xs font-bold opacity-60 mb-1">STAGE {item.step}</div>
              <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Why CampusResolve?
          </h2>
          <p className="text-sm text-slate-400">
            Engineered specifically for university dorms, IT networks, academic buildings, and mess facilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card glass-card-hover rounded-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-5">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Instant Categorization</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Auto-detects complaint categories (Hostel, IT/Wi-Fi, Academic, Mess) and suggests SLA priority levels.
            </p>
          </div>

          <div className="glass-card glass-card-hover rounded-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Automated Escalations</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Background workers continuously check unassigned or overdue tickets and escalate directly to college administration.
            </p>
          </div>

          <div className="glass-card glass-card-hover rounded-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Actionable Analytics</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Dean and department heads gain real-time visibility into workload, resolution speed, and student satisfaction ratings.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto glass-card rounded-3xl p-10 text-center relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to streamline campus grievances?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Join students and staff across the campus in creating a more responsive, accountable university environment.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all shadow-glow"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
