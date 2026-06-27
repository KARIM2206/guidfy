import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCommunityAdminsSA,
  assignAdminToCommunity,
  removeAdminFromCommunity,
} from '@/services/community/superAdmin.service';

const ADMINS_KEY = 'community-admins';

// جلب كل الأدمنز مع pagination
export function useCommunityAdmins(page = 1, communityId = null) {
  return useQuery({
    queryKey: [ADMINS_KEY, page, communityId],
    queryFn: () =>
      getCommunityAdminsSA({
        page,
        limit: 10,
        ...(communityId && { communityId }),
      }),
    placeholderData: (prev) => prev,
    retry: (count, err) => err?.status !== 403 && count < 2,
  });
}

// Mutations
export function useAssignAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ communityId, userId }) =>
      assignAdminToCommunity(communityId, userId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [ADMINS_KEY] }),
  });
}

export function useRemoveAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ communityId, userId }) =>
      removeAdminFromCommunity(communityId, userId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [ADMINS_KEY] }),
  });
}