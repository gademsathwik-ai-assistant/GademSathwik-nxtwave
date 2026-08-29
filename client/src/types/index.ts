export type UserRole = 'student' | 'admin' | 'staff';

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

export type AuditAction =
  | 'status_change'
  | 'comment'
  | 'assign'
  | 'attachment'
  | 'priority_change'
  | 'feedback'
  | 'escalation';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: {
    _id: string;
    name: string;
    code: string;
  } | string;
  phone?: string;
  avatar?: string;
  studentId?: string;
  hostelBlock?: string;
  roomNumber?: string;
  createdAt: string;
}

export interface IAttachment {
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface IFeedback {
  rating: number;
  comment?: string;
  submittedAt: string;
}

export interface IComplaint {
  _id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  location: string;
  attachments: IAttachment[];
  priority: ComplaintPriority;
  status: ComplaintStatus;
  reporterId: IUser;
  assignedToId?: IUser;
  departmentId?: {
    _id: string;
    name: string;
    code: string;
    contactEmail?: string;
    description?: string;
  };
  resolvedAt?: string;
  closedAt?: string;
  resolutionNotes?: string;
  feedback?: IFeedback;
  escalated?: boolean;
  escalatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IComplaintLog {
  _id: string;
  complaintId: string;
  actorId: {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
  };
  action: AuditAction;
  fromValue?: string;
  toValue?: string;
  message: string;
  isInternal?: boolean;
  timestamp: string;
}

export interface IDepartment {
  _id: string;
  name: string;
  code: string;
  contactEmail: string;
  description?: string;
  staffIds?: IUser[];
  stats?: {
    total: number;
    active: number;
    resolved: number;
  };
  createdAt: string;
}

export interface INotification {
  _id: string;
  userId: string;
  complaintId?: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}
