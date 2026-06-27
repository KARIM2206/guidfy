/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CHAT CUSTOM HOOK
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This hook manages all chat-related queries and mutations.
 * Supports:
 * - Fetching inbox
 * - Fetching conversations
 * - Sending messages
 * - Real-time updates via WebSocket
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

// ─────────────────────────────────────────────────────────────────────────
// API Functions
// ─────────────────────────────────────────────────────────────────────────

async function fetchInbox() {
  const response = await apiClient.get('/chat/inbox');
  return response.data;
}

async function fetchConversation(userId) {
  const response = await apiClient.get(`/chat/conversations/${userId}`);
  return response.data;
}

async function sendMessage(receiverId, content) {
  const response = await apiClient.post('/chat/messages', {
    receiverId,
    content,
  });
  return response.data;
}

// ─────────────────────────────────────────────────────────────────────────
// Custom Hooks
// ─────────────────────────────────────────────────────────────────────────

export function useInboxQuery() {
  return useQuery({
    queryKey: ['chat', 'inbox'],
    queryFn: fetchInbox,
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}

export function useConversationQuery(userId) {
  return useQuery({
    queryKey: ['chat', 'conversations', userId],
    queryFn: () => fetchConversation(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ receiverId, content }) => sendMessage(receiverId, content),
    onSuccess: (data, { receiverId }) => {
      // Optimistically update the conversation
      queryClient.setQueryData(['chat', 'conversations', receiverId], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: [...(oldData.data || []), data],
        };
      });

      // Update inbox
      queryClient.setQueryData(['chat', 'inbox'], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((item) =>
            item.user.id === receiverId
              ? { ...item, lastMessage: data }
              : item
          ),
        };
      });
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
    },
  });
}

/**
 * Hook to add a real-time message to the conversation
 * Call this from WebSocket listeners
 */
export function useAddMessageToConversation() {
  const queryClient = useQueryClient();

  return (userId, message) => {
    queryClient.setQueryData(['chat', 'conversations', userId], (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        data: [...(oldData.data || []), message],
      };
    });
  };
}
