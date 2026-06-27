import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import {
  getAllCommunitiesSA,
  suspendCommunity,
  activateCommunity,
  deleteCommunitySA,
  createCommunity,
  updateCommunity,
  deleteCommunity
} from '@/services/community/superAdmin.service';



// ═══════════════════════════════════════════════════
// DEBOUNCE HOOK
// ═══════════════════════════════════════════════════
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const COMMUNITIES_KEY = 'communities';

export function useCreateCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCommunity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COMMUNITIES_KEY] });
    },
  });
}

export function useUpdateCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateCommunity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COMMUNITIES_KEY] });
    },
  });
}

export function useDeleteCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteCommunity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COMMUNITIES_KEY] });
    },
  });
}
// ═══════════════════════════════════════════════════
// FETCH COMMUNITIES
// ═══════════════════════════════════════════════════
export function useCommunities(page, search, statusFilter) {
  const debouncedSearch = useDebounce(search, 400);

  return useQuery({
    queryKey: [COMMUNITIES_KEY, page, debouncedSearch, statusFilter],
    queryFn: () =>
      getAllCommunitiesSA({
        page,
        limit: 10,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter && { status: statusFilter }),
      }),
    placeholderData: (previousData) => previousData,
    retry: (count, err) => err?.status !== 403 && count < 2,
  });
}

// ═══════════════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════════════
export function useCommunityActions() {
  const queryClient = useQueryClient();

  const suspend = useMutation({
    mutationFn: ({ id, reason }) => suspendCommunity(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COMMUNITIES_KEY] });
    },
  });

  const activate = useMutation({
    mutationFn: (id) => activateCommunity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COMMUNITIES_KEY] });
    },
  });

  const remove = useMutation({
    mutationFn: (id) => deleteCommunitySA(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COMMUNITIES_KEY] });
    },
  });

  return { suspend, activate, remove };
}
// أضف query منفصل للـ stats
export function useCommunitiesStats() {
  const total = useQuery({
    queryKey: ['communities-stats', 'all'],
    queryFn: () => getAllCommunitiesSA({ page: 1, limit: 1 }),
    staleTime: 60 * 1000,
  });

  const active = useQuery({
    queryKey: ['communities-stats', 'active'],
    queryFn: () => getAllCommunitiesSA({ page: 1, limit: 1, status: 'ACTIVE' }),
    staleTime: 60 * 1000,
  });

  const suspended = useQuery({
    queryKey: ['communities-stats', 'suspended'],
    queryFn: () => getAllCommunitiesSA({ page: 1, limit: 1, status: 'SUSPENDED' }),
    staleTime: 60 * 1000,
  });

  return {
    total:     total.data?.pagination?.total     || 0,
    active:    active.data?.pagination?.total    || 0,
    suspended: suspended.data?.pagination?.total || 0,
    isLoading: total.isLoading || active.isLoading || suspended.isLoading,
  };
}