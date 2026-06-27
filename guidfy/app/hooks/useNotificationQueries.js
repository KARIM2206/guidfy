'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotifications,
  markAllAsRead,
  markAsRead,
  deleteNotification,
} from '@/services/notification';
import { useNotificationStore } from '@/lib/stores/notificationStore';

const NOTIFICATIONS_KEY = 'notifications';

export function useNotificationsQuery(page = 1, limit = 20) {
  const { realtimeNotifications, removeRealtimeNotification } = useNotificationStore();

  const { data, isLoading, error, isPlaceholderData } = useQuery({
    queryKey: [NOTIFICATIONS_KEY, page, limit],
    queryFn: () => getNotifications({ page, limit }),
    placeholderData: (previousData) => previousData, // TanStack Query v5
  });

  // دمج الإشعارات الواردة real-time مع داتا السيرفر
  const serverNotifications = data?.data || [];
  const allNotifications = [
    ...realtimeNotifications.filter(
      (rt) => !serverNotifications.some((sn) => sn.id === rt.id)
    ),
    ...serverNotifications,
  ];

  const unreadCount = allNotifications.filter((n) => !n.read && !n.isRead).length;

  return {
    notifications: allNotifications,
    pagination: data?.pagination,
    unreadCount,
    isLoading,
    isPlaceholderData,
    error,
  };
}

export function useMarkAsReadMutation() {
  const queryClient = useQueryClient();
  const { removeRealtimeNotification } = useNotificationStore();

  return useMutation({
    mutationFn: markAsRead,
    onSuccess: (_, id) => {
      removeRealtimeNotification(id);
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
    },
  });
}

export function useMarkAllAsReadMutation() {
  const queryClient = useQueryClient();
  const { clearRealtimeNotifications } = useNotificationStore();

  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      clearRealtimeNotifications();
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
    },
  });
}

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient();
  const { removeRealtimeNotification } = useNotificationStore();

  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: (_, id) => {
      removeRealtimeNotification(id);
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
    },
  });
}