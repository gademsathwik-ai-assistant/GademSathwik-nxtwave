import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { AnalyticsService } from '../services/analyticsService';

export class AnalyticsController {
  /**
   * GET /api/analytics
   */
  public static async getOverview(
    _req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = await AnalyticsService.getAdminOverview();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  }
}
