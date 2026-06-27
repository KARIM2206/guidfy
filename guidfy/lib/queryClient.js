/**
 * ═══════════════════════════════════════════════════════════════════════════
 * REACT QUERY CONFIGURATION
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * React Query (TanStack Query) is the exclusive engine for:
 * - Server state management
 * - API data fetching
 * - Automatic caching
 * - Background refetching
 * - Optimistic updates
 * - Error handling
 * 
 * Every API call MUST go through React Query hooks.
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ─── Cache Configuration ────────────────────────────────────────
      staleTime: 1000 * 60 * 5, // 5 minutes: Data is fresh for 5 min
      gcTime: 1000 * 60 * 10, // 10 minutes: Keep unused data in cache for 10 min
      retry: 1, // Retry failed requests once
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // ─── Refetch Configuration ──────────────────────────────────────
      refetchOnWindowFocus: true, // Refetch when window regains focus
      refetchOnReconnect: true, // Refetch when connection is restored
      refetchOnMount: 'stale', // Refetch if data is stale on mount

      // ─── Error Handling ─────────────────────────────────────────────
      throwOnError: false, // Don't throw errors, let components handle them
    },
    mutations: {
      // ─── Mutation Configuration ─────────────────────────────────────
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
