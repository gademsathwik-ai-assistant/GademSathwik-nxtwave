import mongoose from 'mongoose';
import { Notification, INotification, NotificationType } from '../models/Notification';
import { getIO } from '../sockets/socketManager';
import { logger } from '../utils/logger';

interface CreateNotificationParams {
  userId: string | mongoose.Types.ObjectId;
  complaintId?: string | mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export class NotificationService {
  /**
   * Create notification in database and emit via Socket.IO
   */
  public static async createNotification(
    params: CreateNotificationParams
  ): Promise<INotification> {
    try {
      const notification = await Notification.create({
        userId: params.userId,
        complaintId: params.complaintId || null,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link || '',
      });

      // Emit to user's personal socket room
      try {
        const io = getIO();
        io.to(`user:${params.userId.toString()}`).emit('notification:new', {
          _id: notification._id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          complaintId: notification.complaintId,
          link: notification.link,
          createdAt: notification.createdAt,
          isRead: false,
        });
      } catch (socketErr) {
        logger.warn('Socket emission failed for notification:', socketErr);
      }

      return notification;
    } catch (err) {
      logger.error('Failed to create notification:', err);
      throw err;
    }
  }

  /**
   * Notify admins of critical campus events (e.g. new complaint, escalation)
   */
  public static async notifyAdmins(
    title: string,
    message: string,
    complaintId?: string | mongoose.Types.ObjectId
  ): Promise<void> {
    try {
      const io = getIO();
      io.to('role:admin').emit('notification:admin', {
        title,
        message,
        complaintId,
        createdAt: new Date(),
      });
    } catch (err) {
      logger.warn('Failed to broadcast admin notification:', err);
    }
  }

  /**
   * Get user notifications with pagination
   */
  public static async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ notifications: INotification[]; total: number; unreadCount: number }> {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ userId }),
      Notification.countDocuments({ userId, isRead: false }),
    ]);

    return { notifications, total, unreadCount };
  }

  /**
   * Mark single or multiple notifications as read
   */
  public static async markAsRead(
    userId: string,
    notificationIds?: string[]
  ): Promise<{ modifiedCount: number }> {
    const filter: any = { userId };
    if (notificationIds && notificationIds.length > 0) {
      filter._id = { $in: notificationIds };
    }

    const result = await Notification.updateMany(filter, { isRead: true });
    return { modifiedCount: result.modifiedCount };
  }
}
