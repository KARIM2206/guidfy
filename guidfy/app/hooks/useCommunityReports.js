import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCommunityReportsSA,
  resolveReportSA,
} from '@/services/community/superAdmin.service';

const REPORTS_KEY = 'community-reports';

export function useCommunityReports(communityId, page = 1) {
  return useQuery({
    queryKey: [REPORTS_KEY, communityId, page],
    queryFn: () => getCommunityReportsSA(communityId, { page, limit: 10 }),
    enabled: !!communityId,
    retry: (count, err) => err?.status !== 403 && count < 2,
    placeholderData: (previousData) => previousData,
  });
}

export function useResolveReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, notes }) => resolveReportSA(reportId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REPORTS_KEY] });
    },
  });
}