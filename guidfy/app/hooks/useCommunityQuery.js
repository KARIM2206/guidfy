/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COMMUNITY CUSTOM HOOK
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This hook manages all community-related queries and mutations.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import * as communityService from '@/services/community/community';

// ─────────────────────────────────────────────────────────────────────────
// API Functions (id-based - legacy)
// ─────────────────────────────────────────────────────────────────────────

async function fetchCommunities(page = 1, limit = 10) {
  return await communityService.getAllCommunities({ page, limit });
}

async function fetchCommunityById(id) {
  const response = await apiClient.get(`/communities/${id}`);
  return response.data;
}

async function fetchCommunityPosts(communityId, page = 1, limit = 10) {
  const response = await apiClient.get(`/communities/${communityId}/posts`, {
    params: { page, limit },
  });
  return response.data;
}

async function createPost(communityId, data) {
  const response = await apiClient.post(`/communities/${communityId}/posts`, data);
  return response.data;
}

async function updatePost(communityId, postId, data) {
  const response = await apiClient.put(
    `/communities/${communityId}/posts/${postId}`,
    data
  );
  return response.data;
}

async function deletePost(communityId, postId) {
  const response = await apiClient.delete(
    `/communities/${communityId}/posts/${postId}`
  );
  return response.data;
}

// ─────────────────────────────────────────────────────────────────────────
// Custom Hooks (id-based - legacy)
// ─────────────────────────────────────────────────────────────────────────

export function useAllCommunitiesQuery() {
  return useQuery({
    queryKey: ['communities', 'all'],
    queryFn: () => communityService.getAllCommunities(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCommunityById(id) {
  return useQuery({
    queryKey: ['communities', id],
    queryFn: () => fetchCommunityById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
}

export function useCommunityPostsQuery(communityId, page = 1, limit = 10) {
  return useQuery({
    queryKey: ['communities', communityId, 'posts', page, limit],
    queryFn: () => fetchCommunityPosts(communityId, page, limit),
    enabled: !!communityId,
    staleTime: 1000 * 60 * 1,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ communityId, data }) => createPost(communityId, data),
    onSuccess: (data, { communityId }) => {
      queryClient.invalidateQueries({
        queryKey: ['community', communityId, 'posts'],
      });
      queryClient.refetchQueries({ queryKey: ['community', 'tags', 'popular'] });
      return data;
    },
  });
}



export function useCreateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ communityId, data }) => communityService.createQuestion(communityId, data),
    onSuccess: (data, { communityId }) => {
      queryClient.invalidateQueries({
        queryKey: ['community', communityId, 'questions'],
      });
      queryClient.refetchQueries({ queryKey: ['community', 'tags', 'popular'] });
      return data;
    },
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ communityId, questionId, data }) => communityService.updateQuestion(communityId, questionId, data),
    onSuccess: (data, { communityId, questionId }) => {
      queryClient.invalidateQueries({ queryKey: ['community', communityId, 'questions'] });
      queryClient.invalidateQueries({ queryKey: ['community', communityId, 'feed'] });
      queryClient.invalidateQueries({ queryKey: ['community', undefined, 'feed'] });
      queryClient.invalidateQueries({ queryKey: ['community', null, 'feed'] });
      queryClient.invalidateQueries({ queryKey: ['question', questionId] });
      queryClient.refetchQueries({ queryKey: ['community', 'tags', 'popular'] });
      return data;
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ communityId, questionId }) => communityService.deleteQuestion(communityId, questionId),
    onSuccess: (_, { communityId, questionId }) => {
      queryClient.invalidateQueries({ queryKey: ['community', communityId, 'questions'] });
      queryClient.invalidateQueries({ queryKey: ['community', communityId, 'feed'] });
      queryClient.removeQueries({ queryKey: ['question', questionId] });
      queryClient.refetchQueries({ queryKey: ['community', 'tags', 'popular'] });
    },
  });
}

export function useAddAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ communityId, questionId, data }) => communityService.addAnswer(communityId, questionId, data),
    onSuccess: (data, { communityId, questionId }) => {
      queryClient.invalidateQueries({ queryKey: ['community', communityId, 'questions'] });
      queryClient.invalidateQueries({ queryKey: ['community', communityId, 'feed'] });
      queryClient.invalidateQueries({ queryKey: ['question', questionId] });
      return data;
    },
  });
}

export function useEditAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ communityId, questionId, answerId, data }) => communityService.editAnswer(communityId, questionId, answerId, data),
    onSuccess: (data, { questionId }) => {
      queryClient.invalidateQueries({ queryKey: ['question', questionId] });
      return data;
    },
  });
}

export function useDeleteAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ communityId, questionId, answerId }) => communityService.deleteAnswer(communityId, questionId, answerId),
    onSuccess: (_, { questionId, communityId }) => {
      queryClient.invalidateQueries({ queryKey: ['question', questionId] });
      queryClient.invalidateQueries({ queryKey: ['community', communityId, 'questions'] });
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────
// Slug-based Hooks (for [domain] page)
// ─────────────────────────────────────────────────────────────────────────

/**
 * جلب بيانات الكميونتى عن طريق الـ slug
 */
export function useCommunityBySlug(slug) {
  return useQuery({
    queryKey: ['community', 'slug', slug],
    queryFn: () => communityService.getCommunityBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * جلب الأسئلة الخاصة بكميونتى معينة عن طريق الـ id
 */
export function useCommunityQuestionsQuery(communityId, page = 1, limit = 10, enabled = true, sort = 'latest', search = '', quickFilter = '') {
  return useQuery({
    queryKey: ['community', communityId, 'questions', page, limit, sort, search, quickFilter],
    queryFn: () => communityService.getCommunityQuestions(communityId, { page, limit, sort, search, quickFilter }),
    enabled: !!communityId && enabled,
    staleTime: 1000 * 60 * 1,
  });
}

/**
 * جلب البوستات الخاصة بكميونتى معينة عن طريق الـ id
 */
export function useCommunityPostsBySlug(communityId, page = 1, limit = 10, enabled = true, sort = 'latest', search = '', quickFilter = '') {
  return useQuery({
    queryKey: ['community', communityId, 'posts', page, limit, sort, search, quickFilter],
    queryFn: () => communityService.getCommunityPosts(communityId, { page, limit, sort, search, quickFilter }),
    enabled: !!communityId && enabled,
    staleTime: 1000 * 60 * 1,
  });
}

/**
 * جلب الكوميونتي فيد (أسئلة + بوستات مجمعة) لكميونتى معينة
 */
export function useCommunityFeedQuery(communityId, page = 1, limit = 5, enabled = true, sort = 'latest', search = '', quickFilter = '') {
  return useQuery({
    queryKey: ['community', communityId, 'feed', page, limit, sort, search, quickFilter],
    queryFn: () => communityService.getGlobalFeed({ communityId, page, limit, sort, search, quickFilter }),
    enabled: !!communityId && enabled,
    staleTime: 1000 * 60 * 1,
  });
}

export function useQuestionById(questionId) {
  return useQuery({
    queryKey: ['question', questionId],
    queryFn: () => communityService.getCommunityQuestionById(questionId),
    enabled: !!questionId,
    staleTime: 1000 * 60 * 1,
  });
}

export function usePostById(postId) {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: () => communityService.getPostById(postId),
    enabled: !!postId,
    staleTime: 1000 * 60 * 1,
  });
}

export function usePostComments(postId) {
  return useQuery({
    queryKey: ['post', postId, 'comments'],
    queryFn: () => communityService.getPostComments(postId),
    enabled: !!postId,
    staleTime: 1000 * 60 * 1,
  });
}

/**
 * Fetch popular tags
 */
export function usePopularTagsQuery() {
  return useQuery({
    queryKey: ['community', 'tags', 'popular'],
    queryFn: () => communityService.getPopularTags(),
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * جلب أعضاء الكميونتي
 */
export function useCommunityMembersQuery(communityId, page = 1, limit = 10, enabled = true) {
  return useQuery({
    queryKey: ['community', communityId, 'members', page, limit],
    queryFn: () => communityService.getCommunityMembers(communityId, { page, limit }),
    enabled: !!communityId && enabled,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Join كميونتى
 */
export function useJoinCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ communityId, slug }) => communityService.joinCommunity(communityId),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: ['community', 'slug', slug] });
      queryClient.invalidateQueries({ queryKey: ['communities', 'all'] });
    },
  });
}

/**
 * Leave كميونتى
 */
export function useLeaveCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ communityId, slug }) => communityService.leaveCommunity(communityId),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: ['community', 'slug', slug] });
      queryClient.invalidateQueries({ queryKey: ['communities', 'all'] });
    },
  });
}

/**
 * Delete Post
 */
export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ communityId, postId }) => communityService.deletePost(communityId, postId),
    onSuccess: (_, { communityId }) => {
      queryClient.invalidateQueries({ queryKey: ['community', communityId, 'posts'] });
      queryClient.invalidateQueries({ queryKey: ['community', communityId, 'feed'] });
      queryClient.refetchQueries({ queryKey: ['community', 'tags', 'popular'] });
    },
  });
}

/**
 * Update Post
 */
export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ communityId, postId, data }) => communityService.updatePost(communityId, postId, data),
    onSuccess: (_, { communityId, postId }) => {
      queryClient.invalidateQueries({ queryKey: ['community', communityId, 'posts'] });
      queryClient.invalidateQueries({ queryKey: ['community', communityId, 'feed'] });
      queryClient.invalidateQueries({ queryKey: ['community', undefined, 'feed'] });
      queryClient.invalidateQueries({ queryKey: ['community', null, 'feed'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.refetchQueries({ queryKey: ['community', 'tags', 'popular'] });
    },
  });
}

export function useCreatePostComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, data }) => communityService.createPostComment(postId, data),
    onSuccess: (data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['post', postId, 'comments'] });
      return data;
    },
  });
}

export function useDeletePostComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, commentId }) => communityService.deletePostComment(postId, commentId),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['post', postId, 'comments'] });
    },
  });
}


