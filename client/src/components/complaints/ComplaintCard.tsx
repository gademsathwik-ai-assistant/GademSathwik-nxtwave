import React from 'react';
import Link from 'next/link';
import { IComplaint } from '../../types';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { CategoryBadge } from './CategoryBadge';
import { MapPin, Calendar, ArrowRight, Paperclip, Building, Flame } from 'lucide-react';

interface ComplaintCardProps {
  complaint: IComplaint;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({ complaint }) => {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const deptName = complaint.departmentId?.name;

  return (
    <Link
      href={`/complaints/${complaint._id}`}
      className="glass-card glass-card-hover rounded-2xl p-5 block group relative overflow-hidden"
    >
      {/* Escalation ribbon */}
      {complaint.escalated && (
        <div className="absolute top-0 right-0 bg-rose-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-lg uppercase tracking-wider flex items-center gap-1 shadow-glow-rose">
          <Flame className="w-3 h-3 animate-pulse" /> Escalated
        </div>
      )}

      {/* Top Header: Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
          <CategoryBadge category={complaint.category} size="sm" />
        </div>
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(complaint.createdAt)}
        </span>
      </div>

      {/* Title & Preview */}
      <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1 mb-2">
        {complaint.title}
      </h3>
      <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-4">
        {complaint.description}
      </p>

      {/* Footer Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span className="truncate max-w-[200px]">{complaint.location}</span>
          </span>

          {deptName && (
            <span className="flex items-center gap-1.5 text-indigo-300">
              <Building className="w-3.5 h-3.5 text-indigo-400" />
              <span className="truncate max-w-[160px]">{deptName}</span>
            </span>
          )}

          {complaint.attachments && complaint.attachments.length > 0 && (
            <span className="flex items-center gap-1 text-slate-400">
              <Paperclip className="w-3.5 h-3.5" />
              {complaint.attachments.length}
            </span>
          )}
        </div>

        <span className="inline-flex items-center gap-1 text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform">
          View details <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
};
