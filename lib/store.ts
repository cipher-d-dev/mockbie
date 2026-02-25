import { create } from 'zustand';

export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  fullName: string;
  matricNumber: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  login: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));
