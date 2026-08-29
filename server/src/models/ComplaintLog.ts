import mongoose, { Document, Schema } from 'mongoose';

export type AuditAction =
  | 'status_change'
  | 'comment'
  | 'assign'
  | 'attachment'
  | 'priority_change'
  | 'feedback'
  | 'escalation';

export interface IComplaintLog extends Document {
  complaintId: mongoose.Types.ObjectId;
  actorId: mongoose.Types.ObjectId;
  action: AuditAction;
  fromValue?: string;
  toValue?: string;
  message: string;
  isInternal?: boolean; // staff-only internal notes
  timestamp: Date;
}

const ComplaintLogSchema = new Schema<IComplaintLog>(
  {
    complaintId: {
      type: Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: [
        'status_change',
        'comment',
        'assign',
        'attachment',
        'priority_change',
        'feedback',
        'escalation',
      ],
      required: true,
    },
    fromValue: {
      type: String,
      default: '',
    },
    toValue: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isInternal: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

ComplaintLogSchema.index({ complaintId: 1, timestamp: 1 });

export const ComplaintLog = mongoose.model<IComplaintLog>(
  'ComplaintLog',
  ComplaintLogSchema
);
