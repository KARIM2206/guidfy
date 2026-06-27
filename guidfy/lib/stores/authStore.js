// lib/stores/authStore.js
import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,

  setUser: (user) => set({
    user,
    isAuthenticated: !!user,
    loading: false,
    error: null,
  }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error, loading: false }),

  clearAuth: () => set({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  }),

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  // Helpers
  isSuperAdmin: () => get().user?.role === 'SUPER_ADMIN',
  isAdmin: () => ['ADMIN', 'SUPER_ADMIN'].includes(get().user?.role),
}));