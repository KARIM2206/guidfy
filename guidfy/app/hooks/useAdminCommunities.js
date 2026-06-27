import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import {
  getAdminCommunities,
  getAdminCommunity,
  updateAdminCommunity,
  banMember,
  unbanMember,
  removeMemberByAdmin,
  getAdminMembers,
  getAdminPosts,
  deletePostByAdmin,
  getAdminQuestions,
  deleteQuestionByAdmin,
  getAdminReports,
  resolveReportByAdmin,
  dismissReportByAdmin,
  getAdminAnalytics,
  getAdminActionLogs,
  getAdminBannedMembers,
} from '@/services/community/adminCommonutiy.service';

// ═══════════════════════════════════════════════════
// DEBOUNCE
// ═══════════════════════════════════════════════════
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// ═══════════════════════════════════════════════════
// KEYS
// ═══════════════════════════════════════════════════
export const ADMIN_KEYS = {
  communities: (page, search, sort) => ['admin-communities', page, search, sort],
  community:   (slug)              => ['admin-community', slug],
  members:     (slug, page)        => ['admin-members', slug, page],
  posts:       (slug, page)        => ['admin-posts', slug, page],
  questions:   (slug, page)        => ['admin-questions', slug, page],
  reports:     (slug, page)        => ['admin-reports', slug, page],
  analytics:   (slug)              => ['admin-analytics', slug],
  logs:        (slug, page)        => ['admin-logs', slug, page],
  banned: (slug, page) => ['admin-banned', slug, page],

};

// ═══════════════════════════════════════════════════
// COMMUNITIES LIST
// ═══════════════════════════════════════════════════
export function useAdminCommunities(page = 1, search = '', sort = 'newest') {
  const debouncedSearch = useDebounce(search, 400);

  return useQuery({
    queryKey: ADMIN_KEYS.communities(page, debouncedSearch, sort),
    queryFn: () =>
      getAdminCommunities({
        page,
        limit: 10,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(sort && { sort }),
      }),
    placeholderData: (prev) => prev,
    retry: (count, err) => err?.status !== 403 && count < 2,
  });
}

// ═══════════════════════════════════════════════════
// SINGLE COMMUNITY
// ═══════════════════════════════════════════════════
export function useAdminCommunity(slug) {
  return useQuery({
    queryKey: ADMIN_KEYS.community(slug),
    queryFn: () => getAdminCommunity(slug),
    enabled: !!slug,
  });
}

export function useUpdateCommunity(slug) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => updateAdminCommunity(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.community(slug) });
      queryClient.invalidateQueries({ queryKey: ['admin-communities'] });
    },
  });
}

// ═══════════════════════════════════════════════════
// MEMBERS
// ═══════════════════════════════════════════════════
export function useAdminMembers(slug, page = 1) {
  return useQuery({
    queryKey: ADMIN_KEYS.members(slug, page),
    queryFn: () => getAdminMembers(slug, { page, limit: 10 }),
    enabled: !!slug,
    placeholderData: (prev) => prev,
  });
}

export function useMemberActions(slug) {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    // ✅ بيريفرش الـ members والـ banned في نفس الوقت
    queryClient.invalidateQueries({ queryKey: ['admin-members', slug] });
    queryClient.invalidateQueries({ queryKey: ['admin-banned',  slug] });
  };

  const ban = useMutation({
    mutationFn: ({ userId, reason }) => banMember(slug, userId, { reason }),
    onSuccess: invalidateAll,
  });

  const unban = useMutation({
    mutationFn: ({ userId }) => unbanMember(slug, userId),
    onSuccess: invalidateAll,
  });

  const remove = useMutation({
    mutationFn: ({ userId }) => removeMemberByAdmin(slug, userId),
    onSuccess: invalidateAll,  // ✅ Remove كمان بيأثر على الـ members
  });

  return { ban, unban, remove };
}

// ═══════════════════════════════════════════════════
// POSTS
// ═══════════════════════════════════════════════════
export function useAdminPosts(slug, page = 1) {
  return useQuery({
    queryKey: ADMIN_KEYS.posts(slug, page),
    queryFn: () => getAdminPosts(slug, { page, limit: 10 }),
    enabled: !!slug,
    placeholderData: (prev) => prev,
  });
}

export function useDeletePost(slug) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, reason }) => deletePostByAdmin(slug, postId, reason),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin-posts', slug] }),
  });
}

// ═══════════════════════════════════════════════════
// QUESTIONS
// ═══════════════════════════════════════════════════
export function useAdminQuestions(slug, page = 1) {
  return useQuery({
    queryKey: ADMIN_KEYS.questions(slug, page),
    queryFn: () => getAdminQuestions(slug, { page, limit: 10 }),
    enabled: !!slug,
    placeholderData: (prev) => prev,
  });
}

export function useDeleteQuestion(slug) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, reason }) =>
      deleteQuestionByAdmin(slug, questionId, reason),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin-questions', slug] }),
  });
}

// ═══════════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════════
export function useAdminReports(slug, page = 1) {
  return useQuery({
    queryKey: ADMIN_KEYS.reports(slug, page),
    queryFn: () => getAdminReports(slug, { page, limit: 10 }),
    enabled: !!slug,
    placeholderData: (prev) => prev,
  });
}

export function useReportActions() {
  const queryClient = useQueryClient();

  const resolve = useMutation({
    mutationFn: ({ reportId, notes }) =>
      resolveReportByAdmin(reportId, { notes }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] }),
  });

  const dismiss = useMutation({
    mutationFn: ({ reportId }) => dismissReportByAdmin(reportId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] }),
  });

  return { resolve, dismiss };
}

// ═══════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════
export function useAdminAnalytics(slug) {
  return useQuery({
    queryKey: ADMIN_KEYS.analytics(slug),
    queryFn: () => getAdminAnalytics(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
}

// ═══════════════════════════════════════════════════
// ACTION LOGS
// ═══════════════════════════════════════════════════
export function useAdminActionLogs(slug, page = 1) {
  return useQuery({
    queryKey: ADMIN_KEYS.logs(slug, page),
    queryFn: () => getAdminActionLogs(slug, { page, limit: 20 }),
    enabled: !!slug,
    placeholderData: (prev) => prev,
  });
}
// في ADMIN_KEYS:

// Hook:
export function useAdminBannedMembers(slug, page = 1) {
  return useQuery({
    queryKey: ADMIN_KEYS.banned(slug, page),
    queryFn: () => getAdminBannedMembers(slug, { page, limit: 10 }),
    enabled: !!slug,
    placeholderData: (prev) => prev,
  });
}