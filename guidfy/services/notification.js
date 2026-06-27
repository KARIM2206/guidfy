import apiClient from "@/lib/apiClient";

// ═══════════════════════════════════════════════════
//  USER NOTIFICATIONS
// ═══════════════════════════════════════════════════

export const getNotifications = (params) =>
  apiClient.get("/notifications", { params });

export const markAllAsRead = () =>
  apiClient.patch("/notifications/read-all");

export const markAsRead = (notificationId) =>
  apiClient.patch(`/notifications/${notificationId}/read`);

export const deleteNotification = (notificationId) =>
  apiClient.delete(`/notifications/${notificationId}`);

// ═══════════════════════════════════════════════════
//  ADMIN ACTIONS
// ═══════════════════════════════════════════════════

export const createNotification = (payload) =>
  apiClient.post("/notifications", payload);

export const sendToRole = (role, payload) =>
  apiClient.post("/notifications/send-to-role", { role, ...payload });

export const broadcastNotification = (payload) =>
  apiClient.post("/notifications/broadcast", payload);