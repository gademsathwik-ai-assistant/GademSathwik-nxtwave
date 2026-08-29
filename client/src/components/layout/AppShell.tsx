import React, { useEffect } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { NotificationDrawer } from './NotificationDrawer';
import { ToastContainer } from '../ui/Toast';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { getSocket } from '../../services/socket';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { initializeAuth, token, user } = useAuthStore();
  const { addToast, addNotification } = useUIStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Setup Real-time WebSocket event listeners
  useEffect(() => {
    if (!token) return;

    const socket = getSocket(token);

    const handleNewNotification = (notif: any) => {
      addNotification(notif);
      addToast({
        type: 'info',
        title: notif.title,
        message: notif.message,
      });
    };

    const handleAdminComplaintCreated = (data: any) => {
      if (user?.role === 'admin') {
        addToast({
          type: 'warning',
          title: `New [${data.priority.toUpperCase()}] Complaint`,
          message: `"${data.title}" by ${data.reporterName} in ${data.category}`,
        });
      }
    };

    socket.on('notification:new', handleNewNotification);
    socket.on('complaint:created', handleAdminComplaintCreated);

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('complaint:created', handleAdminComplaintCreated);
    };
  }, [token, user, addToast, addNotification]);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
          {children}
        </main>
      </div>
      <Footer />
      <NotificationDrawer />
      <ToastContainer />
    </div>
  );
};
