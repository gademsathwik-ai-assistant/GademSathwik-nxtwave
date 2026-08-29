import React from 'react';
import { ComplaintPriority } from '../../types';
import { Flame, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';

interface PriorityBadgeProps {
  priority: ComplaintPriority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs font-semibold',
  };

  switch (priority) {
    case 'urgent':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-glow-rose uppercase tracking-wider ${sizeClasses[size]}`}
        >
          <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          Urgent
        </span>
      );
    case 'high':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/30 ${sizeClasses[size]}`}
        >
          <ArrowUp className="w-3.5 h-3.5 text-orange-400" />
          High
        </span>
      );
    case 'medium':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 ${sizeClasses[size]}`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-cyan-400" />
          Medium
        </span>
      );
    case 'low':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full bg-slate-700/50 text-slate-300 border border-slate-600 ${sizeClasses[size]}`}
        >
          <ArrowDown className="w-3.5 h-3.5 text-slate-400" />
          Low
        </span>
      );
    default:
      return <span className="text-slate-400">{priority}</span>;
  }
};
