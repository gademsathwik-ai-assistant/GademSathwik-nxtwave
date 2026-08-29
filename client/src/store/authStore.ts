import { create } from 'zustand';
import { IUser } from '../types';
import { api } from '../services/api';
import { disconnectSocket, getSocket } from '../services/socket';

interface AuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  initializeAuth: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('campusresolve_token');
      const userJson = localStorage.getItem('campusresolve_user');
      if (token && userJson) {
        try {
          const user = JSON.parse(userJson);
          set({ user, token, isAuthenticated: true, isLoading: false });
          getSocket(token);
          // Refresh user data in background
          get().fetchCurrentUser().catch(() => {});
          return;
        } catch (e) {
          localStorage.removeItem('campusresolve_user');
        }
      }
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data.data;

      localStorage.setItem('campusresolve_token', token);
      localStorage.setItem('campusresolve_user', JSON.stringify(user));

      set({ user, token, isAuthenticated: true, isLoading: false });
      disconnectSocket();
      getSocket(token);
    } catch (err: any) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/register', data);
      const { user, token } = response.data.data;

      localStorage.setItem('campusresolve_token', token);
      localStorage.setItem('campusresolve_user', JSON.stringify(user));

      set({ user, token, isAuthenticated: true, isLoading: false });
      disconnectSocket();
      getSocket(token);
    } catch (err: any) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('campusresolve_token');
      localStorage.removeItem('campusresolve_user');
    }
    disconnectSocket();
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  fetchCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      const user = response.data.data.user;
      localStorage.setItem('campusresolve_user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch (err) {
      // If token expired, clear
      get().logout();
    }
  },
}));
