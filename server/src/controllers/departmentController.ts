import { Request, Response, NextFunction } from 'express';
import { DepartmentService } from '../services/departmentService';

export class DepartmentController {
  /**
   * GET /api/departments
   */
  public static async list(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const departments = await DepartmentService.listDepartments();
      res.status(200).json({
        success: true,
        data: { departments },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/departments (Admin only)
   */
  public static async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { name, code, contactEmail, description, staffIds } = req.body;
      const department = await DepartmentService.createDepartment({
        name,
        code,
        contactEmail,
        description,
        staffIds,
      });

      res.status(201).json({
        success: true,
        message: 'Department created successfully.',
        data: { department },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/departments/:id/staff (Admin only)
   */
  public static async updateStaff(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = String(req.params.id);
      const { staffIds } = req.body;

      const department = await DepartmentService.updateStaff(id, staffIds);

      res.status(200).json({
        success: true,
        message: 'Department staff updated successfully.',
        data: { department },
      });
    } catch (err) {
      next(err);
    }
  }
}
