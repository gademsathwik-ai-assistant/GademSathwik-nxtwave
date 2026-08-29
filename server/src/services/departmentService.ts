import { Department, IDepartment } from '../models/Department';
import { User, IUser } from '../models/User';
import { Complaint } from '../models/Complaint';

interface CreateDepartmentDTO {
  name: string;
  code: string;
  contactEmail: string;
  description?: string;
  staffIds?: string[];
}

export class DepartmentService {
  /**
   * List all departments with staff populated and complaint stats
   */
  public static async listDepartments(): Promise<any[]> {
    const departments = await Department.find()
      .populate('staffIds', 'name email role phone avatar')
      .sort({ name: 1 })
      .lean();

    // Attach complaint counts for each department
    const enhancedDepartments = await Promise.all(
      departments.map(async (dept) => {
        const [totalComplaints, activeComplaints, resolvedComplaints] = await Promise.all([
          Complaint.countDocuments({ departmentId: dept._id }),
          Complaint.countDocuments({
            departmentId: dept._id,
            status: { $in: ['Assigned', 'In Progress', 'Under Review'] },
          }),
          Complaint.countDocuments({
            departmentId: dept._id,
            status: { $in: ['Resolved', 'Closed'] },
          }),
        ]);

        return {
          ...dept,
          stats: {
            total: totalComplaints,
            active: activeComplaints,
            resolved: resolvedComplaints,
          },
        };
      })
    );

    return enhancedDepartments;
  }

  /**
   * Create a new department
   */
  public static async createDepartment(data: CreateDepartmentDTO): Promise<IDepartment> {
    const existing = await Department.findOne({
      $or: [{ name: data.name }, { code: data.code.toUpperCase() }],
    });

    if (existing) {
      const error: any = new Error('A department with this name or code already exists.');
      error.statusCode = 400;
      throw error;
    }

    return await Department.create({
      name: data.name,
      code: data.code.toUpperCase(),
      contactEmail: data.contactEmail.toLowerCase(),
      description: data.description || '',
      staffIds: data.staffIds || [],
    });
  }

  /**
   * Assign or remove staff to department
   */
  public static async updateStaff(
    departmentId: string,
    staffIds: string[]
  ): Promise<IDepartment | null> {
    const dept = await Department.findByIdAndUpdate(
      departmentId,
      { staffIds },
      { new: true }
    ).populate('staffIds', 'name email role');

    // Also update departmentId on the user documents
    await User.updateMany({ departmentId }, { $unset: { departmentId: 1 } });
    if (staffIds.length > 0) {
      await User.updateMany({ _id: { $in: staffIds } }, { departmentId });
    }

    return dept;
  }
}
