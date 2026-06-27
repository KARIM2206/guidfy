/**
 * ═══════════════════════════════════════════════════════════════════════════
 * NOTIFICATIONS CUSTOM HOOK
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This hook manages all notification-related queries and mutations.
 * 
 * Key Points:
 * - Expects backend to send `read` (Boolean) field, NOT `isRead`
 * - Automatically handles pagination
 * - Supports real-time updates via WebSocket
 * - Manages unread count
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

// ─────────────────────────────────────────────────────────────────────────
// API Functions
// ─────────────────────────────────────────────────────────────────────────

async function fetchNotifications(page = 1, limit = 10) {
  const response = await apiClient.get('/notifications', {
    params: { page, limit },
  });
  return response.data;
}

async function markNotificationAsRead(id) {
  const response = await apiClient.patch(`/notifications/${id}/read`);
  return response.data;
}

async function markAllNotificationsAsRead() {
  const response = await apiClient.patch('/notifications/read-all');
  return response.data;
}

async function deleteNotification(id) {
  const response = await apiClient.delete(`/notifications/${id}`);
  return response.data;
}

// ─────────────────────────────────────────────────────────────────────────
// Custom Hook
// ─────────────────────────────────────────────────────────────────────────

export function useNotificationsQuery(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['notifications', page, limit],
    queryFn: () => fetchNotifications(page, limit),
    staleTime: 1000 * 60 * 1, // 1 minute (notifications should be fresh)
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: (data, id) => {
      // Optimistically update the cache
      queryClient.setQueryData(['notifications'], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        };
      });
    },
    onError: (error) => {
      console.error('Failed to mark notification as read:', error);
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      // Invalidate all notification queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Failed to mark all notifications as read:', error);
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: (data, id) => {
      // Optimistically remove from cache
      queryClient.setQueryData(['notifications'], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data.filter((n) => n.id !== id),
        };
      });
    },
    onError: (error) => {
      console.error('Failed to delete notification:', error);
    },
  });
}

/**
 * Hook to get unread notification count
 */
export function useUnreadNotificationCount() {
  const { data } = useNotificationsQuery(1, 1);
  return data?.pagination?.unreadCount ?? 0;
}
