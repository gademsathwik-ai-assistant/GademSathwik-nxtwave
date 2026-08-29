import { Request, Response, NextFunction } from 'express';
import { AIService } from '../services/aiService';

export class AIController {
  /**
   * POST /api/ai/categorize
   */
  public static async categorize(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { title, description } = req.body;
      if (!title && !description) {
        res.status(400).json({
          success: false,
          message: 'Title or description is required for AI categorization.',
        });
        return;
      }

      const result = await AIService.categorizeComplaint(
        title || '',
        description || ''
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}
