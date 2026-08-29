import React from 'react';
import Link from 'next/link';
import { useUIStore } from '../../store/uiStore';
import {
  Bell,
  CheckCheck,
  X,
  Clock,
  UserCheck,
  CheckCircle,
  MessageSquare,
  Flame,
} from 'lucide-react';

export const NotificationDrawer: React.FC = () => {
  const {
    isNotificationDrawerOpen,
    setNotificationDrawerOpen,
    notifications,
    unreadNotificationCount,
    markAllNotificationsRead,
  } = useUIStore();

  if (!isNotificationDrawerOpen) return null;

  const formatNotificationTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'assigned':
        return <UserCheck className="w-4 h-4 text-blue-400" />;
      case 'status_changed':
        return <CheckCircle className="w-4 h-4 text-indigo-400" />;
      case 'comment_added':
        return <MessageSquare className="w-4 h-4 text-purple-400" />;
      case 'escalated':
        return <Flame className="w-4 h-4 text-rose-400 animate-pulse" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setNotificationDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-slide-up">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Notifications</h3>
                <p className="text-xs text-slate-400">
                  {unreadNotificationCount} unread update{unreadNotificationCount === 1 ? '' : 's'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadNotificationCount > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold p-1.5 rounded-lg hover:bg-indigo-950/40 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4" /> Mark all read
                </button>
              )}
              <button
                onClick={() => setNotificationDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="py-16 text-center text-slate-500 space-y-2">
                <Bell className="w-8 h-8 mx-auto opacity-40 text-slate-600" />
                <p className="text-sm font-medium">No notifications yet</p>
                <p className="text-xs text-slate-600">
                  Live updates on status changes, assignments, and comments will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-4 rounded-xl border transition-all ${
                    notif.isRead
                      ? 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                      : 'bg-indigo-950/20 border-indigo-500/30 text-slate-200 shadow-glow'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex-shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="text-xs font-bold text-white truncate">{notif.title}</h4>
                        <time className="text-[10px] text-slate-500 whitespace-nowrap">
                          {formatNotificationTime(notif.createdAt)}
                        </time>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-2">
                        {notif.message}
                      </p>
                      {notif.link && (
                        <Link
                          href={notif.link}
                          onClick={() => setNotificationDrawerOpen(false)}
                          className="inline-block text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
                        >
                          View Complaint Details →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
