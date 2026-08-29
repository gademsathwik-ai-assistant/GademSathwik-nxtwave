import mongoose, { Document, Schema } from 'mongoose';

export interface IFileRecord extends Document {
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  uploaderId: mongoose.Types.ObjectId;
  complaintId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const FileRecordSchema = new Schema<IFileRecord>(
  {
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    uploaderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    complaintId: {
      type: Schema.Types.ObjectId,
      ref: 'Complaint',
      default: null,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const FileRecord = mongoose.model<IFileRecord>('FileRecord', FileRecordSchema);
