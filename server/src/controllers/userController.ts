import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';

export class UserController {
  /**
   * GET /api/users
   */
  public static async list(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { role, departmentId } = req.query;
      const query: any = {};

      if (role) {
        query.role = role;
      }
      if (departmentId) {
        query.departmentId = departmentId;
      }

      const users = await User.find(query)
        .populate('departmentId', 'name code')
        .select('-password')
        .sort({ name: 1 })
        .lean();

      res.status(200).json({
        success: true,
        data: { users },
      });
    } catch (err) {
      next(err);
    }
  }
}
