/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PROFILE CUSTOM HOOK
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This hook manages all profile-related queries and mutations.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

// ─────────────────────────────────────────────────────────────────────────
// API Functions
// ─────────────────────────────────────────────────────────────────────────

async function fetchProfile(username) {
  const response = await apiClient.get(`/profiles/${username}`);
  return response.data;
}

async function fetchMyProfile() {
  const response = await apiClient.get('/profiles/me');
  return response.data;
}

async function updateProfile(data) {
  const response = await apiClient.put('/profiles/me', data);
  return response.data;
}

async function uploadProfilePicture(file) {
  const formData = new FormData();
  formData.append('avatar', file);
  const response = await apiClient.post('/profiles/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

// ─────────────────────────────────────────────────────────────────────────
// Custom Hooks
// ─────────────────────────────────────────────────────────────────────────

export function useProfileQuery(username) {
  return useQuery({
    queryKey: ['profiles', username],
    queryFn: () => fetchProfile(username),
    enabled: !!username,
    staleTime: 1000 * 60 * 10,
  });
}

export function useMyProfileQuery() {
  return useQuery({
    queryKey: ['profiles', 'me'],
    queryFn: fetchMyProfile,
    staleTime: 1000 * 60 * 30,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['profiles', 'me'], data);
      return data;
    },
  });
}

export function useUploadProfilePicture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadProfilePicture,
    onSuccess: (data) => {
      queryClient.setQueryData(['profiles', 'me'], data);
      return data;
    },
  });
}

export function useGenerateCareerReport() {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/career-report/generate');
      return response.data;
    },
  });
}
