import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { api } from '../../services/api';
import { useUIStore } from '../../store/uiStore';
import { ComplaintCategory, ComplaintPriority } from '../../types';
import {
  UploadCloud,
  X,
  Sparkles,
  Loader2,
  Send,
  MapPin,
  HelpCircle,
  Flame,
  AlertCircle,
  Wifi,
  Home,
  GraduationCap,
  Wrench,
  Utensils,
  BookOpen,
  Bus,
  Trophy,
} from 'lucide-react';

const CATEGORIES: { label: ComplaintCategory; icon: any }[] = [
  { label: 'IT/Wi-Fi', icon: Wifi },
  { label: 'Hostel', icon: Home },
  { label: 'Infrastructure', icon: Wrench },
  { label: 'Academic', icon: GraduationCap },
  { label: 'Mess/Canteen', icon: Utensils },
  { label: 'Library', icon: BookOpen },
  { label: 'Transport', icon: Bus },
  { label: 'Sports', icon: Trophy },
  { label: 'Other', icon: HelpCircle },
];

export default function NewComplaintPage() {
  const router = useRouter();
  const { addToast } = useUIStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('IT/Wi-Fi');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState<ComplaintPriority>('medium');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const newFiles = [...files, ...selectedFiles].slice(0, 5); // max 5 files
      setFiles(newFiles);

      // Generate previews for images
      const newPreviews = newFiles.map((file) => {
        if (file.type.startsWith('image/')) {
          return URL.createObjectURL(file);
        }
        return '';
      });
      setPreviews(newPreviews);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
  };

  const handleAICategorize = async () => {
    if (!title && !description) {
      addToast({
        type: 'warning',
        title: 'Input needed',
        message: 'Please enter a title or description first.',
      });
      return;
    }

    setAnalyzingAI(true);
    try {
      const res = await api.post('/ai/categorize', { title, description });
      const data = res.data.data;
      setAiSuggestion(data);
      if (data.suggestedCategory) setCategory(data.suggestedCategory);
      if (data.suggestedPriority) setPriority(data.suggestedPriority);

      addToast({
        type: 'info',
        title: 'AI Analysis Complete',
        message: `Suggested category: ${data.suggestedCategory} (${Math.round(data.confidence * 100)}% confidence)`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'AI Analysis Error',
        message: err.message,
      });
    } finally {
      setAnalyzingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !category || !location) {
      addToast({
        type: 'warning',
        title: 'Missing required fields',
        message: 'Please fill in all mandatory fields.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('location', location);
      formData.append('priority', priority);

      files.forEach((file) => {
        formData.append('attachments', file);
      });

      const res = await api.post('/complaints', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      addToast({
        type: 'success',
        title: 'Complaint Registered!',
        message: 'Your complaint has been submitted and assigned a tracking ID.',
      });

      const newId = res.data.data.complaint._id;
      router.push(`/complaints/${newId}`);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Submission Failed',
        message: err.response?.data?.message || err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">File a Campus Complaint</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Submit your grievance with accurate details for rapid triage and department routing.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
          {/* AI Helper Banner */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">AI Smart Classifier</h4>
                <p className="text-[11px] text-slate-400">
                  Auto-detect category & urgency from your problem description
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAICategorize}
              disabled={analyzingAI}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-900/60 hover:bg-indigo-800/80 border border-indigo-500/40 transition-colors disabled:opacity-50"
            >
              {analyzingAI ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Classify with AI
            </button>
          </div>

          {/* AI Suggestion preview */}
          {aiSuggestion && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/40 text-xs space-y-1.5 animate-slide-up">
              <div className="flex items-center justify-between text-indigo-300 font-semibold">
                <span>Recommended Routing: {aiSuggestion.departmentRecommendation}</span>
                <span className="bg-indigo-600/20 px-2 py-0.5 rounded-md text-[10px]">
                  {Math.round(aiSuggestion.confidence * 100)}% Confidence
                </span>
              </div>
              {aiSuggestion.tags && aiSuggestion.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {aiSuggestion.tags.map((tag: string) => (
                    <span key={tag} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Category Selector Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
              Select Category <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {CATEGORIES.map(({ label, icon: Icon }) => {
                const isSelected = category === label;
                return (
                  <button
                    type="button"
                    key={label}
                    onClick={() => setCategory(label)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-glow'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span className="truncate w-full text-center">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Complaint Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              placeholder="e.g. Wi-Fi router flashing red in 3rd floor corridor"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Location & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Specific Location <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  placeholder="e.g. Hostel Block B, Room 304"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Priority Level
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['low', 'medium', 'high', 'urgent'] as ComplaintPriority[]).map((p) => {
                  const active = priority === p;
                  return (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`py-2 px-1 rounded-xl text-xs font-semibold uppercase tracking-wider border capitalize transition-all ${
                        active
                          ? p === 'urgent'
                            ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-glow-rose'
                            : p === 'high'
                            ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                            : 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Detailed Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              placeholder="Describe what happened, when the problem started, steps taken, and any urgent impact..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed"
            />
          </div>

          {/* File Upload / Attachments */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Attachments / Photos (Optional, max 5)
            </label>
            <div className="relative border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-2xl p-6 text-center transition-colors bg-slate-950/40">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                accept="image/*,application/pdf,.doc,.docx,.txt"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-white">Click or drag images/documents here</p>
              <p className="text-[10px] text-slate-500 mt-0.5">JPEG, PNG, WEBP, PDF up to 10MB each</p>
            </div>

            {/* Previews */}
            {files.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                {files.map((file, i) => (
                  <div
                    key={i}
                    className="relative group rounded-xl bg-slate-900 border border-slate-800 p-2 overflow-hidden flex flex-col justify-between"
                  >
                    {previews[i] ? (
                      <img
                        src={previews[i]}
                        alt="preview"
                        className="w-full h-20 object-cover rounded-lg mb-1"
                      />
                    ) : (
                      <div className="w-full h-20 bg-slate-950 rounded-lg flex items-center justify-center text-xs text-slate-500 mb-1">
                        DOC
                      </div>
                    )}
                    <span className="text-[10px] text-slate-400 truncate block">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-rose-400 hover:text-white transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all shadow-glow disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit Complaint
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
