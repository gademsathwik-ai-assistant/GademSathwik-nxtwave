import React from 'react';
import { IComplaintLog } from '../../types';
import {
  Clock,
  UserCheck,
  MessageSquare,
  Paperclip,
  Flame,
  Star,
  Activity,
} from 'lucide-react';

interface ComplaintTimelineProps {
  logs: IComplaintLog[];
}

export const ComplaintTimeline: React.FC<ComplaintTimelineProps> = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500 text-sm">
        No timeline events recorded yet.
      </div>
    );
  }

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getEventIcon = (action: string) => {
    switch (action) {
      case 'status_change':
        return {
          icon: Clock,
          bg: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
        };
      case 'assign':
        return {
          icon: UserCheck,
          bg: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
        };
      case 'comment':
        return {
          icon: MessageSquare,
          bg: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
        };
      case 'attachment':
        return {
          icon: Paperclip,
          bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        };
      case 'escalation':
        return {
          icon: Flame,
          bg: 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse',
        };
      case 'feedback':
        return {
          icon: Star,
          bg: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
        };
      default:
        return {
          icon: Activity,
          bg: 'bg-slate-700 text-slate-300 border-slate-600',
        };
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
      {logs.map((log) => {
        const { icon: Icon, bg } = getEventIcon(log.action);
        const role = log.actorId?.role || 'user';

        return (
          <div key={log._id} className="relative group">
            {/* Timeline node icon */}
            <div
              className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border shadow-sm ${bg}`}
            >
              <Icon className="w-3 h-3" />
            </div>

            {/* Content card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 ml-2 hover:border-slate-700 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-200">
                    {log.actorId?.name || 'System'}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${
                      role === 'admin'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : role === 'staff'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {role}
                  </span>
                  {log.isInternal && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Internal Note
                    </span>
                  )}
                </div>
                <time className="text-xs text-slate-500">
                  {formatTime(log.timestamp)}
                </time>
              </div>

              <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                {log.message}
              </p>

              {log.action === 'status_change' && log.toValue && (
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                  <span>Transition:</span>
                  {log.fromValue && (
                    <span className="line-through text-slate-500">{log.fromValue}</span>
                  )}
                  <span>→</span>
                  <span className="text-indigo-300 font-semibold">{log.toValue}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
