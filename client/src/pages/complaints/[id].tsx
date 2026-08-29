import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { api } from '../../services/api';
import { getSocket } from '../../services/socket';
import { IComplaint, IComplaintLog } from '../../types';
import { StatusBadge } from '../../components/complaints/StatusBadge';
import { PriorityBadge } from '../../components/complaints/PriorityBadge';
import { CategoryBadge } from '../../components/complaints/CategoryBadge';
import { ComplaintTimeline } from '../../components/complaints/ComplaintTimeline';
import { AssignmentModal } from '../../components/complaints/AssignmentModal';
import { StatusModal } from '../../components/complaints/StatusModal';
import { FeedbackModal } from '../../components/complaints/FeedbackModal';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Building,
  User,
  Paperclip,
  Send,
  UserCheck,
  CheckCircle,
  Star,
  Trash2,
  Lock,
  Flame,
  ExternalLink,
} from 'lucide-react';

const STATUS_STEPS = [
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Closed',
];

export default function ComplaintDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, token } = useAuthStore();
  const { addToast } = useUIStore();

  const [complaint, setComplaint] = useState<IComplaint | null>(null);
  const [timeline, setTimeline] = useState<IComplaintLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  // Comment input
  const [commentText, setCommentText] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchComplaintDetails = useCallback(async () => {
    if (!id) return;
    try {
      const res = await api.get(`/complaints/${id}`);
      setComplaint(res.data.data.complaint);
      setTimeline(res.data.data.timeline || []);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Error loading complaint',
        message: err.response?.data?.message || err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [id, addToast]);

  useEffect(() => {
    fetchComplaintDetails();
  }, [fetchComplaintDetails]);

  // Socket room connection
  useEffect(() => {
    if (!id || !token) return;
    const socket = getSocket(token);

    socket.emit('join_complaint_room', id);

    const handleCommentAdded = (data: { log: IComplaintLog }) => {
      setTimeline((prev) => [...prev, data.log]);
    };

    const handleStatusUpdated = () => {
      fetchComplaintDetails();
    };

    socket.on('complaint:comment_added', handleCommentAdded);
    socket.on('complaint:status_updated', handleStatusUpdated);
    socket.on('complaint:updated', handleStatusUpdated);
    socket.on('complaint:escalated', handleStatusUpdated);

    return () => {
      socket.emit('leave_complaint_room', id);
      socket.off('complaint:comment_added', handleCommentAdded);
      socket.off('complaint:status_updated', handleStatusUpdated);
      socket.off('complaint:updated', handleStatusUpdated);
      socket.off('complaint:escalated', handleStatusUpdated);
    };
  }, [id, token, fetchComplaintDetails]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await api.post(`/complaints/${id}/comments`, {
        message: commentText,
        isInternal: isInternalComment,
      });
      setTimeline((prev) => [...prev, res.data.data.log]);
      setCommentText('');
      setIsInternalComment(false);
      addToast({
        type: 'success',
        title: 'Message added to timeline',
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Failed to post comment',
        message: err.response?.data?.message || err.message,
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComplaint = async () => {
    if (!confirm('Are you sure you want to permanently delete this complaint?')) return;
    try {
      await api.delete(`/complaints/${id}`);
      addToast({
        type: 'success',
        title: 'Complaint deleted',
      });
      router.push('/complaints');
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Delete failed',
        message: err.message,
      });
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </ProtectedRoute>
    );
  }

  if (!complaint) {
    return (
      <ProtectedRoute>
        <div className="text-center py-20 space-y-4">
          <h2 className="text-xl font-bold text-white">Complaint Not Found</h2>
          <p className="text-sm text-slate-400">The requested ticket does not exist or has been removed.</p>
          <Link href="/complaints" className="inline-block px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs">
            Back to Complaints
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(complaint.status);
  const isReporter = user?._id === (typeof complaint.reporterId === 'object' ? complaint.reporterId._id : complaint.reporterId);
  const canManage = user?.role === 'admin' || user?.role === 'staff';

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Back Link & Header Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/complaints"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Complaints
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            {canManage && (
              <>
                <button
                  onClick={() => setAssignModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-glow"
                >
                  <UserCheck className="w-4 h-4" />
                  Assign Staff
                </button>

                <button
                  onClick={() => setStatusModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-glow"
                >
                  <CheckCircle className="w-4 h-4" />
                  Change Status
                </button>
              </>
            )}

            {isReporter && (complaint.status === 'Resolved' || complaint.status === 'Closed') && (
              <button
                onClick={() => setFeedbackModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-amber-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-glow-amber"
              >
                <Star className="w-4 h-4 fill-amber-950" />
                {complaint.feedback ? 'Edit Feedback' : 'Rate Resolution'}
              </button>
            )}

            {user?.role === 'admin' && (
              <button
                onClick={handleDeleteComplaint}
                className="p-2 rounded-xl text-rose-400 hover:text-white hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
                title="Delete Complaint"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Main Details Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
          {complaint.escalated && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold uppercase tracking-wider shadow-glow-rose">
              <Flame className="w-4 h-4 animate-pulse" /> Auto-Escalated to Urgent
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={complaint.status} size="lg" />
            <PriorityBadge priority={complaint.priority} />
            <CategoryBadge category={complaint.category} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
            {complaint.title}
          </h1>

          {/* Progress Tracker Stepper */}
          <div className="py-4 border-y border-slate-800">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step} className="flex flex-col items-center text-center space-y-1.5">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-indigo-600 text-white shadow-glow ring-2 ring-indigo-400'
                          : isPassed
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-900 text-slate-600 border border-slate-800'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className={`text-[11px] font-semibold truncate w-full ${
                        isCurrent ? 'text-indigo-300' : isPassed ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Issue Description</h3>
            <p className="text-sm sm:text-base text-slate-200 whitespace-pre-wrap leading-relaxed">
              {complaint.description}
            </p>
          </div>

          {/* Meta Attributes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-500 block mb-1">Campus Location</span>
              <span className="font-semibold text-slate-200 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {complaint.location}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">Assigned Department</span>
              <span className="font-semibold text-indigo-300 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-indigo-400" />
                {complaint.departmentId?.name || 'Unassigned'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">Handling Staff</span>
              <span className="font-semibold text-slate-200 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {complaint.assignedToId?.name || 'Pending assignment'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">Date Submitted</span>
              <span className="font-semibold text-slate-200 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(complaint.createdAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          {/* Attachments Section */}
          {complaint.attachments && complaint.attachments.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5" /> Attachments ({complaint.attachments.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {complaint.attachments.map((file, i) => (
                  <a
                    key={i}
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 group flex flex-col justify-between transition-all"
                  >
                    <div className="text-xs font-semibold text-slate-300 group-hover:text-indigo-400 truncate mb-1">
                      {file.originalName}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{(file.size / 1024).toFixed(1)} KB</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Resolution Notes Box */}
          {complaint.resolutionNotes && (
            <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle className="w-4 h-4" /> Resolution Summary
              </div>
              <p className="text-slate-200 leading-relaxed">{complaint.resolutionNotes}</p>
            </div>
          )}

          {/* Student Feedback Box */}
          {complaint.feedback && (
            <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/40 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  Student Satisfaction Rating: {complaint.feedback.rating}/5 Stars
                </div>
                <span className="text-[10px] text-slate-400">
                  {new Date(complaint.feedback.submittedAt).toLocaleDateString()}
                </span>
              </div>
              {complaint.feedback.comment && (
                <p className="text-slate-300 italic">&ldquo;{complaint.feedback.comment}&rdquo;</p>
              )}
            </div>
          )}
        </div>

        {/* Audit Timeline & Communication Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left / Main: Timeline */}
          <div className="lg:col-span-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Full Audit Timeline</h2>
              <p className="text-xs text-slate-400">
                Immutable event record of all status transitions, assignments, and notes
              </p>
            </div>

            <ComplaintTimeline logs={timeline} />
          </div>

          {/* Right: Add Comment / Note */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass-card rounded-2xl p-5 space-y-4 sticky top-24">
              <h3 className="text-sm font-bold text-white">Post Message / Update</h3>

              <form onSubmit={handlePostComment} className="space-y-3">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  required
                  rows={4}
                  placeholder="Type your message, inquiry, or progress update here..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                />

                {canManage && (
                  <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternalComment}
                      onChange={(e) => setIsInternalComment(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                    />
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Internal note (Visible to staff only)</span>
                  </label>
                )}

                <button
                  type="submit"
                  disabled={submittingComment}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all shadow-glow disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  Post Update
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Modals */}
        <AssignmentModal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          complaintId={complaint._id}
          currentDeptId={typeof complaint.departmentId === 'object' ? complaint.departmentId?._id : ''}
          currentAssigneeId={typeof complaint.assignedToId === 'object' ? complaint.assignedToId?._id : ''}
          onAssigned={fetchComplaintDetails}
        />

        <StatusModal
          isOpen={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          complaintId={complaint._id}
          currentStatus={complaint.status}
          onStatusUpdated={fetchComplaintDetails}
        />

        <FeedbackModal
          isOpen={feedbackModalOpen}
          onClose={() => setFeedbackModalOpen(false)}
          complaintId={complaint._id}
          onFeedbackSubmitted={fetchComplaintDetails}
        />
      </div>
    </ProtectedRoute>
  );
}
