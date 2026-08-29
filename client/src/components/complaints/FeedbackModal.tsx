import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { api } from '../../services/api';
import { useUIStore } from '../../store/uiStore';
import { Star, Loader2, Heart } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaintId: string;
  onFeedbackSubmitted: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  complaintId,
  onFeedbackSubmitted,
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useUIStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post(`/complaints/${complaintId}/feedback`, {
        rating,
        comment,
      });

      addToast({
        type: 'success',
        title: 'Feedback Received',
        message: 'Thank you for helping us improve campus services!',
      });
      onFeedbackSubmitted();
      onClose();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Feedback Failed',
        message: err.response?.data?.message || err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rate Resolution Quality">
      <form onSubmit={handleSubmit} className="space-y-5 text-center">
        <div className="pt-2">
          <p className="text-sm text-slate-300 mb-4">
            How satisfied are you with how the department resolved your issue?
          </p>

          {/* Star Selector */}
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoverRating || rating) >= star;
              return (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1.5 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      active
                        ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                        : 'text-slate-700'
                    } transition-colors`}
                  />
                </button>
              );
            })}
          </div>
          <div className="text-xs font-semibold text-amber-300 mt-2">
            {rating === 5 && 'Outstanding & Quick'}
            {rating === 4 && 'Very Satisfied'}
            {rating === 3 && 'Acceptable'}
            {rating === 2 && 'Needs Improvement'}
            {rating === 1 && 'Unsatisfactory'}
          </div>
        </div>

        <div className="text-left">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Your Comments or Suggestions (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Share feedback on staff professionalism, timeliness, or fix quality..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 resize-none"
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 active:scale-95 transition-all shadow-glow-amber disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Heart className="w-4 h-4 fill-white" />
            )}
            Submit Feedback
          </button>
        </div>
      </form>
    </Modal>
  );
};
