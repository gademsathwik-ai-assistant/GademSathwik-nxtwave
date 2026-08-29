import mongoose from 'mongoose';
import { Complaint, IComplaint, ComplaintStatus, ComplaintPriority, ComplaintCategory, IAttachment, IFeedback } from '../models/Complaint';
import { ComplaintLog } from '../models/ComplaintLog';
import { NotificationService } from './notificationService';
import { getIO } from '../sockets/socketManager';
import { IUser } from '../models/User';
import { logger } from '../utils/logger';

interface CreateComplaintDTO {
  title: string;
  description: string;
  category: ComplaintCategory;
  location: string;
  priority?: ComplaintPriority;
  attachments?: IAttachment[];
  reporterId: string | mongoose.Types.ObjectId;
}

interface ComplaintFilterQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  priority?: string;
  departmentId?: string;
  assignedToId?: string;
  reporterId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class ComplaintService {
  /**
   * Create a new complaint + initial audit log + notify admins
   */
  public static async createComplaint(data: CreateComplaintDTO, reporter: IUser): Promise<IComplaint> {
    const complaint = await Complaint.create({
      title: data.title,
      description: data.description,
      category: data.category,
      location: data.location,
      priority: data.priority || 'medium',
      status: 'Submitted',
      reporterId: data.reporterId,
      attachments: data.attachments || [],
    });

    // Create initial audit log
    await ComplaintLog.create({
      complaintId: complaint._id,
      actorId: reporter._id,
      action: 'status_change',
      fromValue: '',
      toValue: 'Submitted',
      message: `Complaint submitted under category "${data.category}" with priority "${data.priority || 'medium'}".`,
      timestamp: new Date(),
    });

    // Send in-app notification to student
    await NotificationService.createNotification({
      userId: reporter._id,
      complaintId: complaint._id,
      type: 'complaint_created',
      title: 'Complaint Registered',
      message: `Your complaint "${complaint.title}" has been received and registered under ${complaint.category}.`,
      link: `/complaints/${complaint._id}`,
    });

    // Notify Admins
    await NotificationService.notifyAdmins(
      'New Complaint Registered',
      `New [${complaint.priority.toUpperCase()}] complaint submitted: "${complaint.title}" in ${complaint.category}`,
      complaint._id
    );

    // Broadcast realtime event
    try {
      const io = getIO();
      io.to('role:admin').emit('complaint:created', {
        complaintId: complaint._id,
        title: complaint.title,
        category: complaint.category,
        priority: complaint.priority,
        reporterName: reporter.name,
        createdAt: complaint.createdAt,
      });
    } catch (socketErr) {
      logger.warn('Socket broadcast failed:', socketErr);
    }

    return complaint;
  }

  /**
   * Get filtered, searched, and paginated complaints
   */
  public static async listComplaints(
    filters: ComplaintFilterQuery,
    user: IUser
  ): Promise<{
    complaints: IComplaint[];
    total: number;
    page: number;
    totalPages: number;
    countsByStatus: Record<string, number>;
  }> {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(filters.limit) || 10));
    const skip = (page - 1) * limit;

    const mongoQuery: any = {};

    // Role-based visibility
    if (user.role === 'student') {
      mongoQuery.reporterId = user._id;
    } else if (user.role === 'staff') {
      // Staff sees complaints assigned to them or their department
      const conditions: any[] = [{ assignedToId: user._id }];
      if (user.departmentId) {
        conditions.push({ departmentId: user.departmentId });
      }
      mongoQuery.$or = conditions;
    }
    // Admin sees all complaints

    // Search keyword
    if (filters.search && filters.search.trim()) {
      const searchRegex = new RegExp(filters.search.trim(), 'i');
      mongoQuery.$and = mongoQuery.$and || [];
      mongoQuery.$and.push({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { location: searchRegex },
        ],
      });
    }

    // Specific filters
    if (filters.status) {
      mongoQuery.status = filters.status;
    }
    if (filters.category) {
      mongoQuery.category = filters.category;
    }
    if (filters.priority) {
      mongoQuery.priority = filters.priority;
    }
    if (filters.departmentId) {
      mongoQuery.departmentId = filters.departmentId;
    }
    if (filters.assignedToId) {
      mongoQuery.assignedToId = filters.assignedToId;
    }
    if (filters.reporterId && user.role === 'admin') {
      mongoQuery.reporterId = filters.reporterId;
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      mongoQuery.createdAt = {};
      if (filters.dateFrom) {
        mongoQuery.createdAt.$gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        mongoQuery.createdAt.$lte = new Date(filters.dateTo);
      }
    }

    // Sort order
    const sortField = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
    const sortOptions: any = { [sortField]: sortOrder };

    const [complaints, total] = await Promise.all([
      Complaint.find(mongoQuery)
        .populate('reporterId', 'name email phone avatar studentId hostelBlock roomNumber')
        .populate('assignedToId', 'name email role')
        .populate('departmentId', 'name code')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Complaint.countDocuments(mongoQuery),
    ]);

    // Status counts for convenient tab headers
    const statusAggregationQuery = { ...mongoQuery };
    delete statusAggregationQuery.status;

    const statusCountsAgg = await Complaint.aggregate([
      { $match: statusAggregationQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const countsByStatus: Record<string, number> = {
      all: total,
      Submitted: 0,
      'Under Review': 0,
      Assigned: 0,
      'In Progress': 0,
      Resolved: 0,
      Closed: 0,
    };

    statusCountsAgg.forEach((item) => {
      if (item._id) {
        countsByStatus[item._id] = item.count;
      }
    });

    return {
      complaints: complaints as unknown as IComplaint[],
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      countsByStatus,
    };
  }

  /**
   * Get single complaint by ID with populated references and full audit timeline
   */
  public static async getComplaintById(
    id: string,
    user: IUser
  ): Promise<{ complaint: IComplaint; timeline: any[] }> {
    const complaint = await Complaint.findById(id)
      .populate('reporterId', 'name email phone avatar studentId hostelBlock roomNumber')
      .populate('assignedToId', 'name email role phone avatar')
      .populate('departmentId', 'name code contactEmail description');

    if (!complaint) {
      const error: any = new Error('Complaint not found.');
      error.statusCode = 404;
      throw error;
    }

    // Verify permission
    if (user.role === 'student' && complaint.reporterId._id.toString() !== user._id.toString()) {
      const error: any = new Error('You do not have permission to view this complaint.');
      error.statusCode = 403;
      throw error;
    }

    // Fetch audit timeline
    const timeline = await ComplaintLog.find({ complaintId: complaint._id })
      .populate('actorId', 'name email role avatar')
      .sort({ timestamp: 1 })
      .lean();

    return {
      complaint: complaint.toObject() as IComplaint,
      timeline,
    };
  }

  /**
   * Assign complaint to department and/or specific staff
   */
  public static async assignComplaint(
    complaintId: string,
    departmentId: string,
    assignedToId: string | null,
    actor: IUser,
    note?: string
  ): Promise<IComplaint> {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      const error: any = new Error('Complaint not found.');
      error.statusCode = 404;
      throw error;
    }

    const previousDept = complaint.departmentId;
    const previousAssignee = complaint.assignedToId;

    complaint.departmentId = new mongoose.Types.ObjectId(departmentId);
    if (assignedToId) {
      complaint.assignedToId = new mongoose.Types.ObjectId(assignedToId);
    }
    if (complaint.status === 'Submitted' || complaint.status === 'Under Review') {
      complaint.status = 'Assigned';
    }

    await complaint.save();

    // Populate for log description
    await complaint.populate('departmentId', 'name code');
    if (complaint.assignedToId) {
      await complaint.populate('assignedToId', 'name email');
    }

    const deptName = (complaint.departmentId as any)?.name || 'Department';
    const staffName = (complaint.assignedToId as any)?.name;

    const assignMessage = staffName
      ? `Assigned to ${deptName} (Staff: ${staffName}). ${note || ''}`.trim()
      : `Assigned to ${deptName}. ${note || ''}`.trim();

    // Create Audit Log
    await ComplaintLog.create({
      complaintId: complaint._id,
      actorId: actor._id,
      action: 'assign',
      fromValue: previousDept ? previousDept.toString() : 'None',
      toValue: departmentId,
      message: assignMessage,
      timestamp: new Date(),
    });

    // Notify Student
    await NotificationService.createNotification({
      userId: complaint.reporterId,
      complaintId: complaint._id,
      type: 'assigned',
      title: 'Complaint Assigned',
      message: `Your complaint "${complaint.title}" has been assigned to ${deptName}.`,
      link: `/complaints/${complaint._id}`,
    });

    // Notify Assigned Staff
    if (assignedToId) {
      await NotificationService.createNotification({
        userId: assignedToId,
        complaintId: complaint._id,
        type: 'assigned',
        title: 'New Complaint Assignment',
        message: `You have been assigned to handle complaint: "${complaint.title}"`,
        link: `/complaints/${complaint._id}`,
      });
    }

    // Socket update
    try {
      const io = getIO();
      io.to(`complaint:${complaint._id}`).emit('complaint:updated', {
        action: 'assign',
        complaintId: complaint._id,
        department: (complaint.departmentId as any)?.name,
        assignedTo: staffName,
        status: complaint.status,
      });
    } catch (socketErr) {
      logger.warn('Socket broadcast error:', socketErr);
    }

    return complaint;
  }

  /**
   * Update complaint status with mandatory or optional audit comment
   */
  public static async updateStatus(
    complaintId: string,
    newStatus: ComplaintStatus,
    actor: IUser,
    comment?: string,
    resolutionNotes?: string
  ): Promise<IComplaint> {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      const error: any = new Error('Complaint not found.');
      error.statusCode = 404;
      throw error;
    }

    const oldStatus = complaint.status;
    complaint.status = newStatus;

    if (newStatus === 'Resolved') {
      complaint.resolvedAt = new Date();
      if (resolutionNotes) {
        complaint.resolutionNotes = resolutionNotes;
      }
    } else if (newStatus === 'Closed') {
      complaint.closedAt = new Date();
    }

    await complaint.save();

    // Create Audit Log
    const logMessage = comment || resolutionNotes || `Status transitioned from ${oldStatus} to ${newStatus}.`;
    await ComplaintLog.create({
      complaintId: complaint._id,
      actorId: actor._id,
      action: 'status_change',
      fromValue: oldStatus,
      toValue: newStatus,
      message: logMessage,
      timestamp: new Date(),
    });

    // Notify Student
    await NotificationService.createNotification({
      userId: complaint.reporterId,
      complaintId: complaint._id,
      type: 'status_changed',
      title: `Complaint Status: ${newStatus}`,
      message: `Your complaint "${complaint.title}" is now marked as ${newStatus}. ${resolutionNotes ? `Note: ${resolutionNotes}` : ''}`,
      link: `/complaints/${complaint._id}`,
    });

    // Realtime broadcast to complaint room & student
    try {
      const io = getIO();
      io.to(`complaint:${complaint._id}`).emit('complaint:status_updated', {
        complaintId: complaint._id,
        oldStatus,
        newStatus,
        actor: { name: actor.name, role: actor.role },
        message: logMessage,
        updatedAt: new Date(),
      });
    } catch (socketErr) {
      logger.warn('Socket emit failed:', socketErr);
    }

    return complaint;
  }

  /**
   * Add a comment / message to the complaint audit trail
   */
  public static async addComment(
    complaintId: string,
    actor: IUser,
    message: string,
    isInternal: boolean = false
  ): Promise<any> {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      const error: any = new Error('Complaint not found.');
      error.statusCode = 404;
      throw error;
    }

    const log = await ComplaintLog.create({
      complaintId: complaint._id,
      actorId: actor._id,
      action: 'comment',
      message: message.trim(),
      isInternal,
      timestamp: new Date(),
    });

    await log.populate('actorId', 'name email role avatar');

    // If actor is staff/admin, notify student (unless internal note)
    if (actor._id.toString() !== complaint.reporterId.toString() && !isInternal) {
      await NotificationService.createNotification({
        userId: complaint.reporterId,
        complaintId: complaint._id,
        type: 'comment_added',
        title: 'New Update on Your Complaint',
        message: `${actor.name} (${actor.role}): "${message.slice(0, 100)}${message.length > 100 ? '...' : ''}"`,
        link: `/complaints/${complaint._id}`,
      });
    }

    // If student posted comment, notify assigned staff or admin
    if (actor._id.toString() === complaint.reporterId.toString()) {
      if (complaint.assignedToId) {
        await NotificationService.createNotification({
          userId: complaint.assignedToId,
          complaintId: complaint._id,
          type: 'comment_added',
          title: 'Student Commented on Complaint',
          message: `${actor.name} replied on "${complaint.title}"`,
          link: `/complaints/${complaint._id}`,
        });
      }
    }

    // Broadcast comment via socket
    try {
      const io = getIO();
      io.to(`complaint:${complaint._id}`).emit('complaint:comment_added', {
        log,
      });
    } catch (socketErr) {
      logger.warn('Socket comment broadcast failed:', socketErr);
    }

    return log;
  }

  /**
   * Submit student satisfaction feedback
   */
  public static async submitFeedback(
    complaintId: string,
    actor: IUser,
    feedback: IFeedback
  ): Promise<IComplaint> {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      const error: any = new Error('Complaint not found.');
      error.statusCode = 404;
      throw error;
    }

    if (complaint.reporterId.toString() !== actor._id.toString()) {
      const error: any = new Error('Only the student who submitted this complaint can provide feedback.');
      error.statusCode = 403;
      throw error;
    }

    if (complaint.status !== 'Resolved' && complaint.status !== 'Closed') {
      const error: any = new Error('Feedback can only be submitted after the complaint has been resolved.');
      error.statusCode = 400;
      throw error;
    }

    complaint.feedback = {
      rating: feedback.rating,
      comment: feedback.comment || '',
      submittedAt: new Date(),
    };

    // Auto-close if resolved
    if (complaint.status === 'Resolved') {
      complaint.status = 'Closed';
      complaint.closedAt = new Date();
    }

    await complaint.save();

    // Log feedback
    await ComplaintLog.create({
      complaintId: complaint._id,
      actorId: actor._id,
      action: 'feedback',
      fromValue: '',
      toValue: `${feedback.rating} Stars`,
      message: `Student gave ${feedback.rating}/5 rating: "${feedback.comment || 'No written feedback'}"`,
      timestamp: new Date(),
    });

    return complaint;
  }

  /**
   * Delete complaint (Admin only)
   */
  public static async deleteComplaint(id: string): Promise<void> {
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      const error: any = new Error('Complaint not found.');
      error.statusCode = 404;
      throw error;
    }

    await ComplaintLog.deleteMany({ complaintId: id });
    await Complaint.findByIdAndDelete(id);
  }
}
