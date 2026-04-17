'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  getNotifications,
  markAllAsRead,
  markAsRead,
  deleteNotification,
} from "../../services/notification";
import {
  sendMessageService,
  getConversationService,
  getInboxService,
} from "../../services/chat"; // ✅ ملف الـ services الجديد
import { initSocket, connectSocket, disconnectSocket } from "@/app/lib/socket";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  // ── Notification State ───────────────────────────────────
  const [notifications, setNotifications] = useState([]);
  const [pagination,    setPagination]    = useState(null);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);

  // ── Chat State ───────────────────────────────────────────
  const [inbox,         setInbox]         = useState([]);
  const [conversations, setConversations] = useState({}); // { userId: [messages] }
  const [chatLoading,   setChatLoading]   = useState(false);

  // ── Socket Refs ───────────────────────────────────────────
  const socketRef      = useRef(null);
  const userIdRef      = useRef(null);
  const addRealtimeRef = useRef(null);

  // ═══════════════════════════════════════════════════════════
  //  GENERIC RUNNER
  // ═══════════════════════════════════════════════════════════
  const run = useCallback(async (fn) => {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (err) {
      setError(err.message || "Something went wrong");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ═══════════════════════════════════════════════════════════
  //  NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════
  const fetchNotifications = useCallback(
    (page = 1, limit = 10) =>
      run(async () => {
        const data = await getNotifications({ page, limit });
        setNotifications(data.data);
        setPagination(data.pagination);
        setUnreadCount(data.pagination?.unreadCount ?? 0);
        return data;
      }),
    [run]
  );

  const markNotificationAsRead = useCallback(
    (id) =>
      run(async () => {
        await markAsRead(id);
        setNotifications((prev) =>
          prev.map((n) => n.id === id ? { ...n, read: true, isRead: true } : n)
        );
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }),
    [run]
  );

  const markAllNotificationsAsRead = useCallback(
    () =>
      run(async () => {
        await markAllAsRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true, isRead: true })));
        setUnreadCount(0);
      }),
    [run]
  );

  const removeNotification = useCallback(
    (id) =>
      run(async () => {
        await deleteNotification(id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }),
    [run]
  );

  const addNotificationRealtime = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    addRealtimeRef.current = addNotificationRealtime;
  }, [addNotificationRealtime]);

  // ═══════════════════════════════════════════════════════════
  //  CHAT
  // ═══════════════════════════════════════════════════════════
  const fetchInbox = useCallback(async () => {
    setChatLoading(true);
    try {
      const res = await getInboxService();
      setInbox(res.data || []);
    } catch (err) {
      console.error('fetchInbox error:', err);
    } finally {
      setChatLoading(false);
    }
  }, []);

  const fetchConversation = useCallback(async (userId) => {
    setChatLoading(true);
    try {
      const res = await getConversationService(userId);
      setConversations((prev) => ({ ...prev, [userId]: res.data || [] }));
    } catch (err) {
      console.error('fetchConversation error:', err);
    } finally {
      setChatLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (receiverId, content) => {
    try {
      const res = await sendMessageService(receiverId, content);
      const message = res.data;
      // ✅ أضف الرسالة للـ conversation فوراً (optimistic update)
      setConversations((prev) => ({
        ...prev,
        [receiverId]: [...(prev[receiverId] || []), message],
      }));
      // ✅ حدّث الـ inbox
      setInbox((prev) =>
        prev.map((i) =>
          i.user.id === receiverId
            ? { ...i, lastMessage: message }
            : i
        )
      );
      return message;
    } catch (err) {
      console.error('sendMessage error:', err);
      throw err;
    }
  }, []);

  // ═══════════════════════════════════════════════════════════
  //  SOCKET
  // ═══════════════════════════════════════════════════════════
  const initializeSocket = useCallback((token, userId) => {
    if (!token || !userId) return;
    if (socketRef.current && userIdRef.current === userId) return;

    if (socketRef.current) {
      socketRef.current.off();
      disconnectSocket();
      socketRef.current = null;
    }

    const socket = initSocket(token);
    socketRef.current = socket;
    userIdRef.current = userId;

    connectSocket(userId);

    // ✅ Notification listener
    socket.on("new_notification", (data) => {
      console.log("🔔 New notification via socket:", data);
      const normalized = {
        id:        data.id        ?? Date.now(),
        title:     data.title     ?? data.message ?? "New notification",
        message:   data.message   ?? data.content ?? "",
        type:      data.type      ?? "system",
        read:      false,
        isRead:    false,
        createdAt: data.createdAt ?? new Date().toISOString(),
        link:      data.link      ?? null,
        metadata:  data.metadata  ?? null,
      };
      addRealtimeRef.current?.(normalized);

      // Desktop notification
      if (typeof window !== "undefined" && Notification.permission === "granted") {
        new Notification(normalized.title, { body: normalized.message });
      }
    });

    // ✅ Chat message listener
    socket.on("new_message", (message) => {
      console.log("💬 New message via socket:", message);
      const otherId = message.senderId === userIdRef.current
        ? message.receiverId
        : message.senderId;

      // أضف للـ conversation
      setConversations((prev) => ({
        ...prev,
        [otherId]: [...(prev[otherId] || []), message],
      }));

      // حدّث الـ inbox
      setInbox((prev) => {
        const exists = prev.find((i) => i.user.id === otherId);
        if (exists) {
          return prev.map((i) =>
            i.user.id === otherId
              ? { ...i, lastMessage: message, unreadCount: (i.unreadCount || 0) + 1 }
              : i
          );
        }
        // لو مفيش محادثة موجودة في الـ inbox → refetch
        return prev;
      });
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
      setError("Lost connection to server");
    });

    socket.on("disconnect", (reason) => {
      console.warn("⚠️ Socket disconnected:", reason);
    });
  }, []);

  const cleanupSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.off();
      disconnectSocket();
      socketRef.current = null;
      userIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => cleanupSocket();
  }, [cleanupSocket]);

  // ═══════════════════════════════════════════════════════════
  //  VALUE
  // ═══════════════════════════════════════════════════════════
  const value = {
    // Notification state
    notifications,
    pagination,
    unreadCount,
    loading,
    error,

    // Chat state
    inbox,
    conversations,
    chatLoading,

    // Notification actions
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    addNotificationRealtime,

    // Chat actions
    fetchInbox,
    fetchConversation,
    sendMessage,

    // Socket
    initializeSocket,
    cleanupSocket,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};