'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/app/CONTEXT/AuthProvider';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket, initSocket, connectSocket, disconnectSocket } from '@/app/lib/socket';
import { useNotifications } from '@/app/CONTEXT/NotificationContext';

/**
 * useSocket — Centralized Socket.IO Manager
 * 
 * 1. ONLY place that initializes and connects the socket.
 * 2. Registers the user on the backend.
 * 3. Listens to `new_message` and invalidates React Query caches.
 */
export function useSocket() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { addNotificationRealtime } = useNotifications();
  
  // To track if we've already attached the listeners to prevent duplicates
  const listenersAttached = useRef(false);

  useEffect(() => {
    console.log("USE SOCKET MOUNTED. User:", user);
    
    // We need user to establish a meaningful authenticated connection
    if (!user?.id) {
      console.log("[useSocket] No user.id, returning early.");
      listenersAttached.current = false;
      return;
    }

    console.log("[useSocket] Has user.id, calling initSocket...");
    // 1. Initialize and connect the socket
    const socket = initSocket();
    connectSocket(user.id);

    // 2. Attach Chat Event Listeners (ensure we only attach once per socket instance)
    if (!listenersAttached.current) {
      console.log('🔗 Attaching unified socket listeners for user:', user.id);
      
      const handleNewMessage = (message) => {
        console.log('💬 [useSocket] New message received:', message);
        // Invalidate React Query caches to trigger instant UI updates across all chat pages
        queryClient.invalidateQueries({ queryKey: ['chat-conversation'] });
        queryClient.invalidateQueries({ queryKey: ['chat-inbox'] });
      };

      const handleNewNotification = (data) => {
        console.log('🔔 [useSocket] New notification received:', data);
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
        addNotificationRealtime(normalized);

        if (typeof window !== "undefined" && Notification.permission === "granted") {
          new Notification(normalized.title, { body: normalized.message });
        }
      };

      socket.on('new_message', handleNewMessage);
      socket.on('new_notification', handleNewNotification);
      listenersAttached.current = true;

      // Optional: Clean up specific listeners if the socket reconnects internally
      return () => {
        socket.off('new_message', handleNewMessage);
        socket.off('new_notification', handleNewNotification);
        listenersAttached.current = false;
        // DO NOT DISCONNECT SOCKET ON UNMOUNT (prevents connection drops on navigation/strict mode)
      };
    }
    
    return () => {
      // Don't violently disconnect on every render, let the dependency array handle it.
      // Disconnection happens when user/token changes (e.g. logout) handled at top of effect.
    };
  }, [user?.id, queryClient]);
}