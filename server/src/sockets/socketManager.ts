import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { UserRole } from '../models/User';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  role?: UserRole;
  departmentId?: string;
}

let ioInstance: SocketIOServer | null = null;

export const initSocketServer = (io: SocketIOServer): void => {
  ioInstance = io;

  // Socket authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token =
      socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      // Allow unauthenticated connection or reject
      return next();
    }

    try {
      const decoded: any = jwt.verify(token, config.jwtSecret);
      socket.userId = decoded.id;
      socket.role = decoded.role;
      socket.departmentId = decoded.departmentId;
      next();
    } catch (err) {
      logger.warn('Socket authentication failed:', err);
      next();
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`Socket client connected: ${socket.id} (User: ${socket.userId || 'Guest'}, Role: ${socket.role || 'none'})`);

    // Join user-specific room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
      logger.debug(`Socket ${socket.id} joined room user:${socket.userId}`);
    }

    // Join role-specific rooms
    if (socket.role === 'admin') {
      socket.join('role:admin');
      logger.debug(`Socket ${socket.id} joined room role:admin`);
    } else if (socket.role === 'staff') {
      socket.join('role:staff');
      if (socket.departmentId) {
        socket.join(`dept:${socket.departmentId}`);
      }
    }

    // Explicit join room handler
    socket.on('join_complaint_room', (complaintId: string) => {
      if (complaintId) {
        socket.join(`complaint:${complaintId}`);
        logger.debug(`Socket ${socket.id} joined complaint room: ${complaintId}`);
      }
    });

    socket.on('leave_complaint_room', (complaintId: string) => {
      if (complaintId) {
        socket.leave(`complaint:${complaintId}`);
        logger.debug(`Socket ${socket.id} left complaint room: ${complaintId}`);
      }
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Socket client disconnected: ${socket.id} (Reason: ${reason})`);
    });
  });
};

export const getIO = (): SocketIOServer => {
  if (!ioInstance) {
    throw new Error('Socket.IO is not initialized!');
  }
  return ioInstance;
};
