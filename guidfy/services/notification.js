import api from "./apiCommunity"; // افترض أن api هو instance مهيأ مسبقاً (axios)

// ═══════════════════════════════════════════════════
//  USER NOTIFICATIONS
// ═══════════════════════════════════════════════════

// GET /notifications - جلب إشعارات المستخدم الحالي
export const getNotifications = (params) =>
  api.get("/notifications", { params }).then((r) => r.data);

// PATCH /notifications/read-all - تعيين الكل كمقروء
export const markAllAsRead = () =>
  api.patch("/notifications/read-all").then((r) => r.data);

// PATCH /notifications/:id/read - تعيين إشعار واحد كمقروء
export const markAsRead = (notificationId) =>
  api.patch(`/notifications/${notificationId}/read`).then((r) => r.data);

// DELETE /notifications/:id - حذف إشعار (مالك أو أدمن)
export const deleteNotification = (notificationId) =>
  api.delete(`/notifications/${notificationId}`).then((r) => r.data);

// ═══════════════════════════════════════════════════
//  ADMIN ACTIONS
// ═══════════════════════════════════════════════════

// POST /notifications - إنشاء إشعار (ADMIN / SUPER_ADMIN)
export const createNotification = (payload) =>
  api.post("/notifications", payload).then((r) => r.data);
// payload: { title, message, type?, link?, image?, data? }

// POST /notifications/send-to-role - إرسال لدور معين (ADMIN+)
export const sendToRole = (role, payload) =>
  api.post("/notifications/send-to-role", { role, ...payload }).then((r) => r.data);
// payload: { title, message, type?, link?, ... }

// POST /notifications/broadcast - بث لجميع المستخدمين (SUPER_ADMIN فقط)
export const broadcastNotification = (payload) =>
  api.post("/notifications/broadcast", payload).then((r) => r.data);