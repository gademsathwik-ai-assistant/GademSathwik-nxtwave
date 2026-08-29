import { Complaint } from '../models/Complaint';
import { ComplaintLog } from '../models/ComplaintLog';
import { NotificationService } from '../services/notificationService';
import { logger } from '../utils/logger';
import { getIO } from '../sockets/socketManager';

export class EscalationService {
  /**
   * Run escalation check for unassigned or overdue complaints
   */
  public static async runEscalationCheck(): Promise<{ escalatedCount: number }> {
    try {
      logger.info('[Job] Running complaint escalation and reminder scanner...');

      // 1. Find complaints submitted > 48 hours ago (or in dev, older complaints) still unassigned
      const thresholdHours = 48;
      const thresholdDate = new Date(Date.now() - thresholdHours * 60 * 60 * 1000);

      const overdueComplaints = await Complaint.find({
        status: { $in: ['Submitted', 'Under Review'] },
        assignedToId: null,
        escalated: { $ne: true },
        createdAt: { $lte: thresholdDate },
      });

      let escalatedCount = 0;

      for (const complaint of overdueComplaints) {
        complaint.escalated = true;
        complaint.escalatedAt = new Date();
        if (complaint.priority !== 'urgent') {
          complaint.priority = 'urgent'; // Boost priority on escalation
        }
        await complaint.save();

        // Audit trail log
        await ComplaintLog.create({
          complaintId: complaint._id,
          actorId: complaint.reporterId, // system escalation on behalf of reporter
          action: 'escalation',
          fromValue: 'Normal',
          toValue: 'Escalated to Urgent',
          message: `System Auto-Escalation: Complaint remained unassigned for over ${thresholdHours} hours. Priority elevated to URGENT.`,
          timestamp: new Date(),
        });

        // Notify Admins
        await NotificationService.notifyAdmins(
          '⚠️ Escalation Alert: Unassigned Complaint Overdue',
          `Complaint "${complaint.title}" has been unassigned for >${thresholdHours}h and has been escalated to URGENT.`,
          complaint._id
        );

        // Notify Reporter
        await NotificationService.createNotification({
          userId: complaint.reporterId,
          complaintId: complaint._id,
          type: 'escalated',
          title: 'Complaint Auto-Escalated',
          message: `Your complaint "${complaint.title}" has been escalated for immediate administrative attention.`,
          link: `/complaints/${complaint._id}`,
        });

        // Realtime notification
        try {
          const io = getIO();
          io.to(`complaint:${complaint._id}`).emit('complaint:escalated', {
            complaintId: complaint._id,
            priority: 'urgent',
            message: 'Complaint has been auto-escalated to Urgent priority.',
          });
        } catch (socketErr) {
          logger.warn('Socket broadcast failed:', socketErr);
        }

        escalatedCount++;
      }

      logger.info(`[Job] Escalation scan complete. Escalated ${escalatedCount} complaints.`);
      return { escalatedCount };
    } catch (err) {
      logger.error('[Job] Escalation check error:', err);
      return { escalatedCount: 0 };
    }
  }
}
