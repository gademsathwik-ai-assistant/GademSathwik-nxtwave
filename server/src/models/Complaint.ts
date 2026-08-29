import mongoose, { Document, Schema } from 'mongoose';

export type ComplaintCategory =
  | 'Hostel'
  | 'Academic'
  | 'Infrastructure'
  | 'Mess/Canteen'
  | 'Library'
  | 'Transport'
  | 'IT/Wi-Fi'
  | 'Sports'
  | 'Other';

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Closed';

export interface IAttachment {
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
}

export interface IFeedback {
  rating: number; // 1 to 5
  comment?: string;
  submittedAt: Date;
}

export interface IComplaint extends Document {
  title: string;
  description: string;
  category: ComplaintCategory;
  location: string;
  attachments: IAttachment[];
  priority: ComplaintPriority;
  status: ComplaintStatus;
  reporterId: mongoose.Types.ObjectId;
  assignedToId?: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  closedAt?: Date;
  resolutionNotes?: string;
  feedback?: IFeedback;
  escalated?: boolean;
  escalatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    url: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const FeedbackSchema = new Schema<IFeedback>(
  {
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ComplaintSchema = new Schema<IComplaint>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Hostel',
        'Academic',
        'Infrastructure',
        'Mess/Canteen',
        'Library',
        'Transport',
        'IT/Wi-Fi',
        'Sports',
        'Other',
      ],
      index: true,
    },
    location: {
      type: String,
      required: [true, 'Location details are required (e.g. Block A, Room 204)'],
      trim: true,
    },
    attachments: [AttachmentSchema],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: [
        'Submitted',
        'Under Review',
        'Assigned',
        'In Progress',
        'Resolved',
        'Closed',
      ],
      default: 'Submitted',
      index: true,
    },
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedToId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
      index: true,
    },
    resolvedAt: {
      type: Date,
    },
    closedAt: {
      type: Date,
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
    feedback: FeedbackSchema,
    escalated: {
      type: Boolean,
      default: false,
    },
    escalatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast query performance on dashboards
ComplaintSchema.index({ status: 1, category: 1 });
ComplaintSchema.index({ reporterId: 1, createdAt: -1 });
ComplaintSchema.index({ departmentId: 1, status: 1 });

export const Complaint = mongoose.model<IComplaint>('Complaint', ComplaintSchema);
