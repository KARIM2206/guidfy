'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getInboxService,
  getConversationService,
  sendMessageService,
} from '@/services/chat';
import { useNotificationStore } from '@/lib/stores/notificationStore';

const INBOX_KEY = 'chat-inbox';
const CONVERSATION_KEY = 'chat-conversation';

// ═══════════════════════════════════════════════════
// INBOX
// ═══════════════════════════════════════════════════
export function useInboxQuery() {
  return useQuery({
    queryKey: [INBOX_KEY],
    queryFn: getInboxService,
    retry: (count, err) => err?.status !== 403 && count < 2,
  });
}

// ═══════════════════════════════════════════════════
// CONVERSATION
// ═══════════════════════════════════════════════════
export function useConversationQuery(userId, page = 1) {
  const { conversations } = useNotificationStore();

  const { data, isLoading } = useQuery({
    queryKey: [CONVERSATION_KEY, userId, page],
    queryFn: () => getConversationService(userId, page),
    enabled: !!userId,
    retry: (count, err) => err?.status !== 403 && count < 2,
  });

  // دمج رسائل السوكت مع رسائل السيرفر
  const socketMessages = conversations[userId] || [];
  const serverMessages = data?.data || data || [];
  const messages = [
    ...socketMessages.filter((sm) => !serverMessages.some((srv) => srv.id === sm.id)),
    ...serverMessages,
  ];

  return { messages, isLoading, data };
}

// ═══════════════════════════════════════════════════
// SEND MESSAGE
// ═══════════════════════════════════════════════════
export function useSendMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ receiverId, content }) => sendMessageService(receiverId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [CONVERSATION_KEY, variables.receiverId] });
      queryClient.invalidateQueries({ queryKey: [INBOX_KEY] });
    },
  });
}