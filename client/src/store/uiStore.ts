import { create } from 'zustand';
import { INotification } from '../types';
import { api } from '../services/api';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface UIState {
  isNotificationDrawerOpen: boolean;
  notifications: INotification[];
  unreadNotificationCount: number;
  toasts: ToastMessage[];
  toggleNotificationDrawer: () => void;
  setNotificationDrawerOpen: (open: boolean) => void;
  fetchNotifications: () => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  addNotification: (notification: INotification) => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  isNotificationDrawerOpen: false,
  notifications: [],
  unreadNotificationCount: 0,
  toasts: [],

  toggleNotificationDrawer: () => {
    const nextState = !get().isNotificationDrawerOpen;
    set({ isNotificationDrawerOpen: nextState });
    if (nextState) {
      get().fetchNotifications();
    }
  },

  setNotificationDrawerOpen: (open) => {
    set({ isNotificationDrawerOpen: open });
    if (open) {
      get().fetchNotifications();
    }
  },

  fetchNotifications: async () => {
    try {
      const res = await api.get('/notifications?limit=25');
      set({
        notifications: res.data.data.notifications,
        unreadNotificationCount: res.data.data.unreadCount,
      });
    } catch (e) {
      // ignore in unauthenticated state
    }
  },

  markAllNotificationsRead: async () => {
    try {
      await api.post('/notifications/mark-read', {});
      set((state) => ({
        unreadNotificationCount: 0,
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      }));
    } catch (e) {
      console.error(e);
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadNotificationCount: state.unreadNotificationCount + 1,
    }));
  },

  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    set((state) => ({ toasts: [...state.toasts, newToast] }));

    setTimeout(() => {
      get().removeToast(id);
    }, 4500);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));
