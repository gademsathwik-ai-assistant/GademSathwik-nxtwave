import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { NotificationService } from '../services/notificationService';

export class NotificationController {
  /**
   * GET /api/notifications
   */
  public static async list(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user!;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;

      const result = await NotificationService.getUserNotifications(
        user._id.toString(),
        page,
        limit
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/notifications/mark-read
   */
  public static async markRead(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user!;
      const { notificationIds } = req.body;

      const result = await NotificationService.markAsRead(
        user._id.toString(),
        notificationIds
      );

      res.status(200).json({
        success: true,
        message: 'Notifications marked as read.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}
