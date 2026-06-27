'use client';

import { useQuery } from '@tanstack/react-query';
import { getAllUsers } from '@/services/auth';

const ADMIN_USERS_KEY = 'admin-users';

export function useAdminUsersQuery() {
  return useQuery({
    queryKey: [ADMIN_USERS_KEY],
    queryFn: getAllUsers,
    retry: (count, err) => err?.status !== 403 && count < 2,
  });
}