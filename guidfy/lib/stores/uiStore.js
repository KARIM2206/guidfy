/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UI STATE STORE (Zustand)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Zustand is used ONLY for lightweight, client-only UI state:
 * - Theme switching (dark/light mode)
 * - Sidebar/modal toggles
 * - Temporary UI state (filters, sorting, pagination)
 * 
 * ❌ DO NOT use Zustand for:
 * - Server state (use React Query instead)
 * - User authentication (use middleware + cookies)
 * - Notifications (use React Query + WebSocket)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUIStore = create(
  persist(
    (set) => ({
      // ─── Theme State ────────────────────────────────────────────────
      theme: 'light', // 'light' | 'dark' | 'system'
      setTheme: (theme) => set({ theme }),

      // ─── Sidebar State ──────────────────────────────────────────────
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // ─── Modal State ────────────────────────────────────────────────
      modals: {}, // { [modalName]: boolean }
      openModal: (name) =>
        set((state) => ({
          modals: { ...state.modals, [name]: true },
        })),
      closeModal: (name) =>
        set((state) => ({
          modals: { ...state.modals, [name]: false },
        })),
      toggleModal: (name) =>
        set((state) => ({
          modals: { ...state.modals, [name]: !state.modals[name] },
        })),

      // ─── Filter & Pagination State ─────────────────────────────────
      filters: {}, // { [page]: { sortBy, order, search } }
      setFilter: (page, filter) =>
        set((state) => ({
          filters: { ...state.filters, [page]: filter },
        })),

      // ─── Notification Toast State ──────────────────────────────────
      toasts: [],
      addToast: (toast) =>
        set((state) => ({
          toasts: [...state.toasts, { id: Date.now(), ...toast }],
        })),
      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),
    }),
    {
      name: 'guidfy-ui-store', // localStorage key
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }), // Only persist theme and sidebar
    }
  )
);
