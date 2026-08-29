import React from 'react';
import { ShieldCheck, Heart, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-md py-8 mt-16 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-white text-sm">
            Campus<span className="text-indigo-400">Resolve</span>
          </span>
          <span className="text-slate-600">|</span>
          <span>College Complaint & Grievance Redressal Portal</span>
        </div>

        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1 text-slate-500">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            Full Audit Trail & Auto-Escalation Enabled
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Academic Excellence
          </span>
        </div>
      </div>
    </footer>
  );
};
