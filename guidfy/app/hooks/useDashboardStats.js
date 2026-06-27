'use client';

import { useQuery } from '@tanstack/react-query';
import { getAllDashboardStats } from '@/services/auth';

const DASHBOARD_STATS_KEY = 'dashboard-stats';

export function useDashboardStats() {
  return useQuery({
    queryKey: [DASHBOARD_STATS_KEY],
    queryFn: () => getAllDashboardStats().then((res) => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
