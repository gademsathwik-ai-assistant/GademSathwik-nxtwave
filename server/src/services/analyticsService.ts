import { Complaint } from '../models/Complaint';
import { Department } from '../models/Department';
import { User } from '../models/User';
import { ComplaintLog } from '../models/ComplaintLog';

export class AnalyticsService {
  /**
   * Get comprehensive campus analytics metrics
   */
  public static async getAdminOverview(): Promise<any> {
    const [
      totalComplaints,
      statusBreakdown,
      categoryBreakdown,
      priorityBreakdown,
      departmentStats,
      resolvedComplaints,
      recentActivity,
      userCounts,
    ] = await Promise.all([
      Complaint.countDocuments(),
      // Status breakdown
      Complaint.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      // Category breakdown
      Complaint.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
      // Priority breakdown
      Complaint.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      // Department stats
      Complaint.aggregate([
        {
          $group: {
            _id: '$departmentId',
            total: { $sum: 1 },
            resolved: {
              $sum: {
                $cond: [{ $in: ['$status', ['Resolved', 'Closed']] }, 1, 0],
              },
            },
            open: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['Submitted', 'Under Review', 'Assigned', 'In Progress']] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
      // For average resolution time calculations
      Complaint.find({
        status: { $in: ['Resolved', 'Closed'] },
        resolvedAt: { $exists: true, $ne: null },
      }).select('createdAt resolvedAt feedback'),
      // Recent audit logs
      ComplaintLog.find()
        .populate('actorId', 'name role avatar')
        .populate('complaintId', 'title category priority')
        .sort({ timestamp: -1 })
        .limit(10)
        .lean(),
      // Total counts
      Promise.all([
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'staff' }),
        Department.countDocuments(),
      ]),
    ]);

    // Calculate Average Resolution Time (in hours)
    let totalResolutionHours = 0;
    let totalRatings = 0;
    let ratingSum = 0;

    resolvedComplaints.forEach((c) => {
      if (c.resolvedAt && c.createdAt) {
        const diffMs = new Date(c.resolvedAt).getTime() - new Date(c.createdAt).getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        totalResolutionHours += Math.max(0, diffHours);
      }
      if (c.feedback && c.feedback.rating) {
        ratingSum += c.feedback.rating;
        totalRatings++;
      }
    });

    const avgResolutionHours =
      resolvedComplaints.length > 0
        ? Math.round((totalResolutionHours / resolvedComplaints.length) * 10) / 10
        : 0;

    const avgSatisfactionScore =
      totalRatings > 0 ? Math.round((ratingSum / totalRatings) * 10) / 10 : 0;

    // Format Status map
    const statusMap: Record<string, number> = {
      Submitted: 0,
      'Under Review': 0,
      Assigned: 0,
      'In Progress': 0,
      Resolved: 0,
      Closed: 0,
    };
    statusBreakdown.forEach((s) => {
      if (s._id) statusMap[s._id] = s.count;
    });

    const openCount =
      statusMap['Submitted'] +
      statusMap['Under Review'] +
      statusMap['Assigned'] +
      statusMap['In Progress'];
    const resolvedCount = statusMap['Resolved'] + statusMap['Closed'];
    const resolutionRate =
      totalComplaints > 0 ? Math.round((resolvedCount / totalComplaints) * 100) : 0;

    // Attach department names
    const departments = await Department.find().lean();
    const departmentMap = new Map(departments.map((d) => [d._id.toString(), d.name]));

    const formattedDeptWorkload = departmentStats.map((d) => ({
      departmentId: d._id,
      departmentName: d._id ? departmentMap.get(d._id.toString()) || 'Unknown' : 'Unassigned',
      total: d.total,
      resolved: d.resolved,
      open: d.open,
    }));

    return {
      kpis: {
        totalComplaints,
        openComplaints: openCount,
        resolvedComplaints: resolvedCount,
        resolutionRate,
        avgResolutionHours,
        avgSatisfactionScore,
        studentCount: userCounts[0],
        staffCount: userCounts[1],
        departmentCount: userCounts[2],
      },
      statusDistribution: statusMap,
      categoryDistribution: categoryBreakdown.map((c) => ({
        category: c._id || 'Other',
        count: c.count,
      })),
      priorityDistribution: priorityBreakdown.map((p) => ({
        priority: p._id || 'medium',
        count: p.count,
      })),
      departmentWorkload: formattedDeptWorkload,
      recentActivity,
    };
  }
}
