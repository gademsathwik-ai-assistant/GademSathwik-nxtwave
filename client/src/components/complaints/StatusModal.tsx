import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { ComplaintStatus } from '../../types';
import { api } from '../../services/api';
import { useUIStore } from '../../store/uiStore';
import { CheckCircle, Loader2 } from 'lucide-react';

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaintId: string;
  currentStatus: ComplaintStatus;
  onStatusUpdated: () => void;
}

const ALL_STATUSES: ComplaintStatus[] = [
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Closed',
];

export const StatusModal: React.FC<StatusModalProps> = ({
  isOpen,
  onClose,
  complaintId,
  currentStatus,
  onStatusUpdated,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>(currentStatus);
  const [comment, setComment] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useUIStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post(`/complaints/${complaintId}/status`, {
        status: selectedStatus,
        comment,
        resolutionNotes: selectedStatus === 'Resolved' ? resolutionNotes : undefined,
      });

      addToast({
        type: 'success',
        title: 'Status Updated',
        message: `Complaint marked as ${selectedStatus}`,
      });
      onStatusUpdated();
      onClose();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err.response?.data?.message || err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Complaint Status">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            New Status <span className="text-rose-400">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ALL_STATUSES.map((status) => (
              <button
                type="button"
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`p-3 rounded-xl border text-sm font-medium text-left transition-all ${
                  selectedStatus === status
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-glow'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {selectedStatus === 'Resolved' && (
          <div>
            <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
              Resolution Summary <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              required
              rows={3}
              placeholder="Describe the actions taken to fix and resolve the issue..."
              className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 resize-none"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Progress Note / Timeline Comment
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder="Add note for student and audit trail..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all shadow-glow disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Save Status
          </button>
        </div>
      </form>
    </Modal>
  );
};
