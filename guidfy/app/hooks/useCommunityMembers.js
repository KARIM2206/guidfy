import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCommunityMembersSA,
  banMemberSA,
  unbanMemberSA,
} from '@/services/community/superAdmin.service';

const MEMBERS_KEY = 'community-members';

export function useCommunityMembers(communityId, page = 1) {
  return useQuery({
    queryKey: [MEMBERS_KEY, communityId, page],
    queryFn: () => getCommunityMembersSA(communityId, { page, limit: 10 }),
    enabled: !!communityId,
    retry: (count, err) => err?.status !== 403 && count < 2,
    placeholderData: (previousData) => previousData,
  });
}

export function useBanMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ communityId, userId, reason }) => banMemberSA(communityId, userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MEMBERS_KEY] });
    },
  });
}

export function useUnbanMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ communityId, userId }) => unbanMemberSA(communityId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MEMBERS_KEY] });
    },
  });
}