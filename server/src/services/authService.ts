import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser, UserRole } from '../models/User';
import { config } from '../config/env';

interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  departmentId?: string;
  phone?: string;
  studentId?: string;
  hostelBlock?: string;
  roomNumber?: string;
}

interface LoginDTO {
  email: string;
  password: string;
}

export class AuthService {
  /**
   * Register a new user (student or staff)
   * Cost factor: 12 as per specification
   */
  public static async register(data: RegisterDTO): Promise<{ user: IUser; token: string }> {
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      const error: any = new Error('An account with this email already exists.');
      error.statusCode = 400;
      throw error;
    }

    // Hash password with bcrypt cost factor 12
    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      role: data.role || 'student',
      departmentId: data.departmentId || null,
      phone: data.phone,
      studentId: data.studentId,
      hostelBlock: data.hostelBlock,
      roomNumber: data.roomNumber,
      lastLogin: new Date(),
    });

    const token = this.generateToken(user);
    const userObject = user.toObject();
    delete userObject.password;

    return { user: userObject as IUser, token };
  }

  /**
   * Login user with email & password
   */
  public static async login(data: LoginDTO): Promise<{ user: IUser; token: string }> {
    const user = await User.findOne({ email: data.email.toLowerCase() }).select('+password');
    if (!user || !user.password) {
      const error: any = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      const error: any = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    user.lastLogin = new Date();
    await user.save();

    const token = this.generateToken(user);
    const userObject = user.toObject();
    delete userObject.password;

    return { user: userObject as IUser, token };
  }

  /**
   * Sign JWT token
   */
  public static generateToken(user: IUser): string {
    return jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        name: user.name,
        departmentId: user.departmentId,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );
  }
}
