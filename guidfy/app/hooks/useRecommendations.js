'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

async function fetchRecommendations() {
  // ⚠️ apiClient بيرجع response.data مباشرة من الـ interceptor
  const data = await apiClient.get('/recommendations');
  
  // ✅ تأمين ضد undefined
  return data || { recommendations: [], meta: null };
}

export function useRecommendations() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['recommendations'],
    queryFn: fetchRecommendations,
    staleTime: 1000 * 60 * 5,
  });

  return {
    recommendations: data?.recommendations || [],
    meta: data?.meta || null,
    loading: isLoading,
    error: isError ? (error?.message || 'Failed to fetch recommendations') : null,
    refetch,
  };
}