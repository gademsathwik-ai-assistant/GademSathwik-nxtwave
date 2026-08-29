import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType =
  | 'complaint_created'
  | 'status_changed'
  | 'assigned'
  | 'comment_added'
  | 'escalated'
  | 'feedback_submitted'
  | 'system';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  complaintId?: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    complaintId: {
      type: Schema.Types.ObjectId,
      ref: 'Complaint',
      default: null,
    },
    type: {
      type: String,
      enum: [
        'complaint_created',
        'status_changed',
        'assigned',
        'comment_added',
        'escalated',
        'feedback_submitted',
        'system',
      ],
      default: 'system',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    link: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>(
  'Notification',
  NotificationSchema
);
