import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { ComplaintService } from '../services/complaintService';
import { IAttachment } from '../models/Complaint';
import { FileRecord } from '../models/FileRecord';

export class ComplaintController {
  /**
   * POST /api/complaints
   * Supports both multipart/form-data (with file uploads) and application/json
   */
  public static async create(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user!;
      const { title, description, category, location, priority } = req.body;

      const attachments: IAttachment[] = [];

      // Process uploaded files if any
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files as Express.Multer.File[]) {
          const attachmentObj: IAttachment = {
            filename: file.filename,
            originalName: file.originalname,
            url: `/uploads/${file.filename}`,
            mimeType: file.mimetype,
            size: file.size,
            uploadedAt: new Date(),
          };
          attachments.push(attachmentObj);

          // Save File Record
          await FileRecord.create({
            filename: file.filename,
            originalName: file.originalname,
            url: `/uploads/${file.filename}`,
            mimeType: file.mimetype,
            size: file.size,
            uploaderId: user._id,
          });
        }
      }

      const complaint = await ComplaintService.createComplaint(
        {
          title,
          description,
          category,
          location,
          priority,
          attachments,
          reporterId: user._id,
        },
        user
      );

      res.status(201).json({
        success: true,
        message: 'Complaint submitted successfully.',
        data: { complaint },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/complaints
   */
  public static async list(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user!;
      const result = await ComplaintService.listComplaints(req.query, user);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/complaints/:id
   */
  public static async getById(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user!;
      const id = String(req.params.id);
      const result = await ComplaintService.getComplaintById(id, user);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/complaints/:id/assign
   */
  public static async assign(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user!;
      const id = String(req.params.id);
      const { departmentId, assignedToId, note } = req.body;

      const updatedComplaint = await ComplaintService.assignComplaint(
        id,
        departmentId,
        assignedToId || null,
        user,
        note
      );

      res.status(200).json({
        success: true,
        message: 'Complaint assigned successfully.',
        data: { complaint: updatedComplaint },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/complaints/:id/status
   */
  public static async updateStatus(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user!;
      const id = String(req.params.id);
      const { status, comment, resolutionNotes } = req.body;

      const updatedComplaint = await ComplaintService.updateStatus(
        id,
        status,
        user,
        comment,
        resolutionNotes
      );

      res.status(200).json({
        success: true,
        message: `Complaint status updated to ${status}.`,
        data: { complaint: updatedComplaint },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/complaints/:id/comments
   */
  public static async addComment(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user!;
      const id = String(req.params.id);
      const { message, isInternal } = req.body;

      const log = await ComplaintService.addComment(
        id,
        user,
        message,
        isInternal === true
      );

      res.status(201).json({
        success: true,
        message: 'Comment posted successfully.',
        data: { log },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/complaints/:id/feedback
   */
  public static async submitFeedback(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user!;
      const id = String(req.params.id);
      const { rating, comment } = req.body;

      const updatedComplaint = await ComplaintService.submitFeedback(id, user, {
        rating: Number(rating),
        comment,
        submittedAt: new Date(),
      });

      res.status(200).json({
        success: true,
        message: 'Feedback submitted successfully. Thank you!',
        data: { complaint: updatedComplaint },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/complaints/:id
   */
  public static async delete(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = String(req.params.id);
      await ComplaintService.deleteComplaint(id);

      res.status(200).json({
        success: true,
        message: 'Complaint deleted successfully.',
      });
    } catch (err) {
      next(err);
    }
  }
}
