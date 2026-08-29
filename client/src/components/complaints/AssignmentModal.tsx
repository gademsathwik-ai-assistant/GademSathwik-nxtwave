import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { IDepartment, IUser } from '../../types';
import { api } from '../../services/api';
import { useUIStore } from '../../store/uiStore';
import { UserCheck, Loader2 } from 'lucide-react';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaintId: string;
  currentDeptId?: string;
  currentAssigneeId?: string;
  onAssigned: () => void;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen,
  onClose,
  complaintId,
  currentDeptId = '',
  currentAssigneeId = '',
  onAssigned,
}) => {
  const [departments, setDepartments] = useState<IDepartment[]>([]);
  const [staffMembers, setStaffMembers] = useState<IUser[]>([]);
  const [selectedDept, setSelectedDept] = useState(currentDeptId);
  const [selectedStaff, setSelectedStaff] = useState(currentAssigneeId);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useUIStore();

  useEffect(() => {
    if (isOpen) {
      setSelectedDept(currentDeptId);
      setSelectedStaff(currentAssigneeId);
      loadDepartmentsAndStaff();
    }
  }, [isOpen, currentDeptId, currentAssigneeId]);

  const loadDepartmentsAndStaff = async () => {
    setLoading(true);
    try {
      const [deptRes, staffRes] = await Promise.all([
        api.get('/departments'),
        api.get('/users?role=staff'),
      ]);
      setDepartments(deptRes.data.data.departments || []);
      setStaffMembers(staffRes.data.data.users || []);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Failed to load assignment options',
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept) {
      addToast({ type: 'warning', title: 'Please select a department' });
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/complaints/${complaintId}/assign`, {
        departmentId: selectedDept,
        assignedToId: selectedStaff || null,
        note,
      });

      addToast({
        type: 'success',
        title: 'Assignment Complete',
        message: 'Complaint successfully routed to department and staff.',
      });
      onAssigned();
      onClose();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Assignment Failed',
        message: err.response?.data?.message || err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStaff = staffMembers.filter((s) => {
    if (!selectedDept) return true;
    const deptId = typeof s.departmentId === 'object' ? s.departmentId?._id : s.departmentId;
    return !deptId || deptId === selectedDept;
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Complaint">
      <form onSubmit={handleAssign} className="space-y-4">
        {loading ? (
          <div className="py-6 text-center text-slate-400">Loading departments...</div>
        ) : (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Target Department <span className="text-rose-400">*</span>
              </label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Select Department...</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Assign Specific Staff Member (Optional)
              </label>
              <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Any available staff member</option>
                {filteredStaff.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Assignment Note / Instructions
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Add special instructions or SLA expectations for the assignee..."
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
                  <UserCheck className="w-4 h-4" />
                )}
                Confirm Assignment
              </button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
};
