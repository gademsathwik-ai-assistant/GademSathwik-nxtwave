import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Department } from '../models/Department';
import { Complaint } from '../models/Complaint';
import { ComplaintLog } from '../models/ComplaintLog';
import { Notification } from '../models/Notification';
import { logger } from './logger';

export const seedDatabase = async (): Promise<void> => {
  try {
    logger.info('Checking database seed state...');

    const userCount = await User.countDocuments();
    if (userCount > 0) {
      logger.info('Database already contains data. Skipping seed.');
      return;
    }

    logger.info('Seeding fresh initial departments, users, complaints, and audit logs...');

    // 1. Create Departments
    const itDept = await Department.create({
      name: 'IT & Network Services',
      code: 'IT',
      contactEmail: 'it.support@campus.edu',
      description: 'Campus Wi-Fi, lab workstations, network routing, and university portal infrastructure.',
      staffIds: [],
    });

    const hostelDept = await Department.create({
      name: 'Hostel Administration',
      code: 'HOSTEL',
      contactEmail: 'hostel.admin@campus.edu',
      description: 'Room allocations, warden queries, hostel amenities, furniture, and residential issues.',
      staffIds: [],
    });

    const maintDept = await Department.create({
      name: 'Campus Infrastructure & Maintenance',
      code: 'MAINT',
      contactEmail: 'maint.facility@campus.edu',
      description: 'Electrical, plumbing, air conditioning, elevators, and physical repairs across campus.',
      staffIds: [],
    });

    const academicDept = await Department.create({
      name: 'Academic Affairs & Records',
      code: 'ACAD',
      contactEmail: 'academic@campus.edu',
      description: 'Course registration, timetable disputes, examination schedules, and classroom resources.',
      staffIds: [],
    });

    const messDept = await Department.create({
      name: 'Hospitality & Dining Services',
      code: 'MESS',
      contactEmail: 'mess.committee@campus.edu',
      description: 'Food hygiene, canteen menus, meal timing, and drinking water dispensaries.',
      staffIds: [],
    });

    // 2. Hash Password
    const passwordHash = await bcrypt.hash('Admin@123', 12);
    const staffPasswordHash = await bcrypt.hash('Staff@123', 12);
    const studentPasswordHash = await bcrypt.hash('Student@123', 12);

    // 3. Create Users
    const adminUser = await User.create({
      name: 'Dean Dr. Sarah Mitchell',
      email: 'admin@campus.edu',
      password: passwordHash,
      role: 'admin',
      phone: '+1 (555) 019-2831',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    });

    const staffIt = await User.create({
      name: 'Alex Rivera (IT Lead)',
      email: 'staff.it@campus.edu',
      password: staffPasswordHash,
      role: 'staff',
      departmentId: itDept._id,
      phone: '+1 (555) 018-9941',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });

    const staffHostel = await User.create({
      name: 'Rajesh Kumar (Hostel Warden)',
      email: 'staff.hostel@campus.edu',
      password: staffPasswordHash,
      role: 'staff',
      departmentId: hostelDept._id,
      phone: '+1 (555) 017-8822',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    });

    const staffMaint = await User.create({
      name: 'Marcus Vance (Chief Engineer)',
      email: 'staff.maint@campus.edu',
      password: staffPasswordHash,
      role: 'staff',
      departmentId: maintDept._id,
      phone: '+1 (555) 016-7733',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    });

    // Link staff to departments
    await Department.findByIdAndUpdate(itDept._id, { $push: { staffIds: staffIt._id } });
    await Department.findByIdAndUpdate(hostelDept._id, { $push: { staffIds: staffHostel._id } });
    await Department.findByIdAndUpdate(maintDept._id, { $push: { staffIds: staffMaint._id } });

    // Students
    const student1 = await User.create({
      name: 'Aarav Sharma',
      email: 'student@campus.edu',
      password: studentPasswordHash,
      role: 'student',
      studentId: 'CS-2024-042',
      hostelBlock: 'Block B (Aryabhatta)',
      roomNumber: '304',
      phone: '+1 (555) 012-3456',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    });

    const student2 = await User.create({
      name: 'Priya Patel',
      email: 'student2@campus.edu',
      password: studentPasswordHash,
      role: 'student',
      studentId: 'EC-2024-118',
      hostelBlock: 'Block A (Gargi)',
      roomNumber: '112',
      phone: '+1 (555) 013-9876',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    });

    // 4. Create Complaints with Realistic Timelines & Logs
    const now = Date.now();

    // Complaint 1: Wi-Fi issue (In Progress)
    const complaint1 = await Complaint.create({
      title: 'High latency and frequent disconnection on 5GHz Wi-Fi in Block B',
      description: 'The Wi-Fi access point near Room 304 frequently disconnects during evening study hours (8 PM - 11 PM), causing packet loss over 40% during online lab submissions.',
      category: 'IT/Wi-Fi',
      location: 'Hostel Block B, 3rd Floor Corridor (near Room 304)',
      priority: 'high',
      status: 'In Progress',
      reporterId: student1._id,
      departmentId: itDept._id,
      assignedToId: staffIt._id,
      createdAt: new Date(now - 36 * 60 * 60 * 1000), // 36 hours ago
      updatedAt: new Date(now - 4 * 60 * 60 * 1000),
    });

    await ComplaintLog.create([
      {
        complaintId: complaint1._id,
        actorId: student1._id,
        action: 'status_change',
        fromValue: '',
        toValue: 'Submitted',
        message: 'Complaint submitted with High priority.',
        timestamp: new Date(now - 36 * 60 * 60 * 1000),
      },
      {
        complaintId: complaint1._id,
        actorId: adminUser._id,
        action: 'assign',
        fromValue: 'None',
        toValue: itDept._id.toString(),
        message: `Assigned to ${itDept.name} (Lead: ${staffIt.name}).`,
        timestamp: new Date(now - 28 * 60 * 60 * 1000),
      },
      {
        complaintId: complaint1._id,
        actorId: staffIt._id,
        action: 'status_change',
        fromValue: 'Assigned',
        toValue: 'In Progress',
        message: 'Inspected the Cisco AP in corridor. Firmware update and channel re-balancing scheduled for tonight.',
        timestamp: new Date(now - 4 * 60 * 60 * 1000),
      },
    ]);

    // Complaint 2: Water heater issue (Resolved & Closed with 5-star review)
    const complaint2 = await Complaint.create({
      title: 'Hot water geyser not heating in 2nd Floor common washroom',
      description: 'The instant geyser in Block A second floor wing 2 trips the MCB whenever switched on. Requires heating element inspection.',
      category: 'Infrastructure',
      location: 'Hostel Block A, 2nd Floor Washroom West',
      priority: 'urgent',
      status: 'Closed',
      reporterId: student2._id,
      departmentId: maintDept._id,
      assignedToId: staffMaint._id,
      resolvedAt: new Date(now - 12 * 60 * 60 * 1000),
      closedAt: new Date(now - 6 * 60 * 60 * 1000),
      resolutionNotes: 'Replaced faulty 3kW heating coil and thermostat sensor. Verified safe operation and earth leakage test passed.',
      feedback: {
        rating: 5,
        comment: 'Resolved within a few hours! Maintenance team was very polite and thorough.',
        submittedAt: new Date(now - 6 * 60 * 60 * 1000),
      },
      createdAt: new Date(now - 48 * 60 * 60 * 1000),
      updatedAt: new Date(now - 6 * 60 * 60 * 1000),
    });

    await ComplaintLog.create([
      {
        complaintId: complaint2._id,
        actorId: student2._id,
        action: 'status_change',
        fromValue: '',
        toValue: 'Submitted',
        message: 'Complaint submitted with Urgent priority.',
        timestamp: new Date(now - 48 * 60 * 60 * 1000),
      },
      {
        complaintId: complaint2._id,
        actorId: adminUser._id,
        action: 'assign',
        fromValue: 'None',
        toValue: maintDept._id.toString(),
        message: `Assigned to ${maintDept.name} (Engineer: ${staffMaint.name}).`,
        timestamp: new Date(now - 40 * 60 * 60 * 1000),
      },
      {
        complaintId: complaint2._id,
        actorId: staffMaint._id,
        action: 'status_change',
        fromValue: 'Assigned',
        toValue: 'Resolved',
        message: 'Replaced faulty 3kW heating coil and thermostat sensor. Verified safe operation.',
        timestamp: new Date(now - 12 * 60 * 60 * 1000),
      },
      {
        complaintId: complaint2._id,
        actorId: student2._id,
        action: 'feedback',
        fromValue: '',
        toValue: '5 Stars',
        message: 'Student gave 5/5 rating: "Resolved within a few hours! Maintenance team was very polite and thorough."',
        timestamp: new Date(now - 6 * 60 * 60 * 1000),
      },
    ]);

    // Complaint 3: Mess Canteen Water Cooler (Submitted)
    const complaint3 = await Complaint.create({
      title: 'RO Water dispenser filter cartridge replacement needed in Main Dining Hall',
      description: 'The TDS reading on the central dining hall water cooler is displaying an alert light. Filter membrane service is due.',
      category: 'Mess/Canteen',
      location: 'Central Dining Mess Hall, North Dispenser Station',
      priority: 'medium',
      status: 'Submitted',
      reporterId: student1._id,
      departmentId: messDept._id,
      createdAt: new Date(now - 8 * 60 * 60 * 1000),
      updatedAt: new Date(now - 8 * 60 * 60 * 1000),
    });

    await ComplaintLog.create([
      {
        complaintId: complaint3._id,
        actorId: student1._id,
        action: 'status_change',
        fromValue: '',
        toValue: 'Submitted',
        message: 'Complaint submitted under category Mess/Canteen.',
        timestamp: new Date(now - 8 * 60 * 60 * 1000),
      },
    ]);

    // Complaint 4: Broken projector in Lecture Hall 101 (Assigned)
    const complaint4 = await Complaint.create({
      title: 'HDMI input flickering in Lecture Hall LH-101 projector',
      description: 'During CS301 morning lectures, the ceiling projector cuts signal every 5 minutes when connecting through the podium HDMI cable.',
      category: 'Academic',
      location: 'Academic Complex 1, Lecture Hall LH-101',
      priority: 'medium',
      status: 'Assigned',
      reporterId: student2._id,
      departmentId: itDept._id,
      assignedToId: staffIt._id,
      createdAt: new Date(now - 20 * 60 * 60 * 1000),
      updatedAt: new Date(now - 15 * 60 * 60 * 1000),
    });

    await ComplaintLog.create([
      {
        complaintId: complaint4._id,
        actorId: student2._id,
        action: 'status_change',
        fromValue: '',
        toValue: 'Submitted',
        message: 'Complaint registered for LH-101.',
        timestamp: new Date(now - 20 * 60 * 60 * 1000),
      },
      {
        complaintId: complaint4._id,
        actorId: adminUser._id,
        action: 'assign',
        fromValue: 'None',
        toValue: itDept._id.toString(),
        message: `Assigned to ${itDept.name}.`,
        timestamp: new Date(now - 15 * 60 * 60 * 1000),
      },
    ]);

    // 5. Create Initial Notifications
    await Notification.create([
      {
        userId: student1._id,
        complaintId: complaint1._id,
        type: 'assigned',
        title: 'Complaint Assigned',
        message: `Your complaint "${complaint1.title}" has been assigned to ${itDept.name}.`,
        isRead: false,
        link: `/complaints/${complaint1._id}`,
      },
      {
        userId: student2._id,
        complaintId: complaint2._id,
        type: 'status_changed',
        title: 'Complaint Resolved',
        message: `Your complaint "${complaint2.title}" has been marked as Resolved.`,
        isRead: true,
        link: `/complaints/${complaint2._id}`,
      },
    ]);

    logger.info('Database seeded successfully with realistic test data!');
  } catch (err) {
    logger.error('Error during database seed:', err);
  }
};
