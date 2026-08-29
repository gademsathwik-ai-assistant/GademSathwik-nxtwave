import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'student' | 'admin' | 'staff';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  departmentId?: mongoose.Types.ObjectId;
  phone?: string;
  avatar?: string;
  studentId?: string; // Roll number or student ID
  hostelBlock?: string;
  roomNumber?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // excluded by default in queries
    },
    role: {
      type: String,
      enum: ['student', 'admin', 'staff'],
      default: 'student',
      index: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    studentId: {
      type: String,
      trim: true,
    },
    hostelBlock: {
      type: String,
      trim: true,
    },
    roomNumber: {
      type: String,
      trim: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
