import React from 'react';
import { ComplaintStatus } from '../../types';
import { Clock, Eye, UserCheck, Play, CheckCircle, Archive } from 'lucide-react';

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3.5 py-1.5 text-sm font-semibold',
  };

  switch (status) {
    case 'Submitted':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700 ${sizeClasses[size]}`}
        >
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          Submitted
        </span>
      );
    case 'Under Review':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 ${sizeClasses[size]}`}
        >
          <Eye className="w-3.5 h-3.5 text-amber-400" />
          Under Review
        </span>
      );
    case 'Assigned':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 ${sizeClasses[size]}`}
        >
          <UserCheck className="w-3.5 h-3.5 text-blue-400" />
          Assigned
        </span>
      );
    case 'In Progress':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 animate-pulse-slow ${sizeClasses[size]}`}
        >
          <Play className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
          In Progress
        </span>
      );
    case 'Resolved':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-glow-emerald ${sizeClasses[size]}`}
        >
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          Resolved
        </span>
      );
    case 'Closed':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 ${sizeClasses[size]}`}
        >
          <Archive className="w-3.5 h-3.5 text-purple-400" />
          Closed
        </span>
      );
    default:
      return <span className="text-slate-400">{status}</span>;
  }
};
