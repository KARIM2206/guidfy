import apiClient from '@/lib/apiClient';

// ═══════════════════════════════════════════════════
//  CHAT SERVICES (using apiClient with HttpOnly cookies)
// ═══════════════════════════════════════════════════

export const sendMessageService = (receiverId, content) =>
  apiClient.post('/chat/messages', { receiverId, content });

export const getConversationService = (userId, page = 1) =>
  apiClient.get(`/chat/messages/${userId}`, { params: { page } });

export const getInboxService = () =>
  apiClient.get('/chat/inbox');