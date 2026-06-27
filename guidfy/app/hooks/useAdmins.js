'use client';

import { useQuery } from '@tanstack/react-query';
import { getAllUsers } from '@/services/auth';

export const adminKeys = {
  all: () => ['admins'],
  list: () => [...adminKeys.all(), 'list'],
};

export function useAdmins() {
  return useQuery({
    queryKey: adminKeys.list(),
    queryFn: async () => {
      const response = await getAllUsers({ role: 'ADMIN' });
      // تأمين ضد أي شكل response
      const data = response?.data?.data ?? response?.data ?? response ?? [];
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 60 * 5,
  });
}