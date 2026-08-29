import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  GraduationCap,
  Wrench,
  Sparkles,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user, isLoading } = useAuthStore();
  const { addToast } = useUIStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirect = (router.query.redirect as string) || (user.role === 'student' ? '/dashboard' : '/admin');
      router.push(redirect);
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setSubmitting(true);
    try {
      await login(email, password);
      addToast({
        type: 'success',
        title: 'Welcome back!',
        message: 'Logged in successfully.',
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Login Failed',
        message: err.response?.data?.message || 'Invalid email or password.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const fillQuickDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[75vh] flex flex-col justify-center items-center py-6 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto shadow-glow">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Sign in to CampusResolve</h1>
          <p className="text-xs text-slate-400">
            Access your student grievance portal or departmental administration
          </p>
        </div>

        {/* 1-Click Quick Demo Login Box */}
        <div className="glass-card rounded-2xl p-4 border-indigo-500/20 bg-indigo-950/20">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>1-Click Test Credentials</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillQuickDemo('student@campus.edu', 'Student@123')}
              className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 text-left transition-all"
            >
              <GraduationCap className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div className="min-w-0">
                <div className="font-semibold text-white truncate">Student</div>
                <div className="text-[10px] text-slate-400">Aarav Sharma</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => fillQuickDemo('admin@campus.edu', 'Admin@123')}
              className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800 text-left transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <div className="min-w-0">
                <div className="font-semibold text-white truncate">Dean (Admin)</div>
                <div className="text-[10px] text-slate-400">Dr. Mitchell</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => fillQuickDemo('staff.it@campus.edu', 'Staff@123')}
              className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800 text-left transition-all"
            >
              <Wrench className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <div className="min-w-0">
                <div className="font-semibold text-white truncate">IT Staff</div>
                <div className="text-[10px] text-slate-400">Alex Rivera</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => fillQuickDemo('staff.hostel@campus.edu', 'Staff@123')}
              className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800 text-left transition-all"
            >
              <Wrench className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div className="min-w-0">
                <div className="font-semibold text-white truncate">Hostel Staff</div>
                <div className="text-[10px] text-slate-400">Rajesh Kumar</div>
              </div>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@campus.edu"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all shadow-glow disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-400 pt-2">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-indigo-400 hover:underline font-semibold">
              Register as Student
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
