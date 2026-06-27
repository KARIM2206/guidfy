import { create } from 'zustand';

export const useNotificationStore = create((set, get) => ({
  // ── Socket ──
  socket: null,
  userId: null,

  // ── Real-time notifications (merged later with server data) ──
  realtimeNotifications: [],

  // ── Chat ──
  conversations: {},
  inbox: [],

  setSocket: (socket) => set({ socket }),
  setUserId: (userId) => set({ userId }),

  addRealtimeNotification: (notification) =>
    set((state) => ({
      realtimeNotifications: [notification, ...state.realtimeNotifications],
    })),

  removeRealtimeNotification: (id) =>
    set((state) => ({
      realtimeNotifications: state.realtimeNotifications.filter((n) => n.id !== id),
    })),

  clearRealtimeNotifications: () => set({ realtimeNotifications: [] }),

  // ── Chat actions ──
  setInbox: (inbox) => set({ inbox }),

  updateInboxWithMessage: (message, currentUserId) => {
    const otherId = message.senderId === currentUserId ? message.receiverId : message.senderId;
    set((state) => {
      const exists = state.inbox.find((i) => i.user?.id === otherId);
      if (exists) {
        return {
          inbox: state.inbox.map((i) =>
            i.user?.id === otherId
              ? { ...i, lastMessage: message, unreadCount: (i.unreadCount || 0) + 1 }
              : i
          ),
        };
      }
      return state;
    });
  },

  addMessageToConversation: (message, currentUserId) => {
    const otherId = message.senderId === currentUserId ? message.receiverId : message.senderId;
    set((state) => {
      const existing = state.conversations[otherId] || [];
      // Prevent duplicate messages
      if (existing.some((m) => m.id === message.id)) {
        return state;
      }
      return {
        conversations: {
          ...state.conversations,
          [otherId]: [...existing, message],
        },
      };
    });
  },

  setConversation: (userId, messages) =>
    set((state) => ({
      conversations: { ...state.conversations, [userId]: messages },
    })),

  clearSocket: () =>
    set({
      socket: null,
      userId: null,
      conversations: {},
      inbox: [],
      realtimeNotifications: [],
    }),
}));