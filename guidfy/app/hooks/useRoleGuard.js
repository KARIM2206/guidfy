import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../CONTEXT/AuthProvider';

// ═══════════════════════════════════════════════════════════════
//  useRoleGuard - Protect routes based on user role
// ═══════════════════════════════════════════════════════════════

export function useRoleGuard(requiredRole) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const hasAccess = Array.isArray(requiredRole)
      ? requiredRole.includes(user?.role)
      : user?.role === requiredRole;

    if (!hasAccess) {
      router.push('/');
    }
  }, [user, loading, requiredRole, router]);

  const isAllowed = Array.isArray(requiredRole)
    ? requiredRole.includes(user?.role)
    : user?.role === requiredRole;

  return {
    isAllowed,
    loading,
    user,
  };
}

// ═══════════════════════════════════════════════════════════════
//  usePermission - Check specific permissions
// ═══════════════════════════════════════════════════════════════

export function usePermission(permission) {
  const { user } = useAuth();

  const permissions = {
    ADMIN: [
      'manage_own_community',
      'edit_own_community',
      'manage_members',
      'moderate_content',
      'view_analytics',
      'view_reports',
    ],
    SUPER_ADMIN: [
      'manage_all_communities',
      'suspend_community',
      'delete_community',
      'manage_admins',
      'manage_all_members',
      'moderate_all_content',
      'view_global_analytics',
      'view_all_reports',
      'resolve_reports',
    ],
    STUDENT: ['view_communities', 'join_community', 'create_content', 'vote'],
  };

  const userPermissions = permissions[user?.role] || [];

  return userPermissions.includes(permission);
}

// ═══════════════════════════════════════════════════════════════
//  useIsAdmin - Check if user is admin
// ═══════════════════════════════════════════════════════════════

export function useIsAdmin() {
  const { user } = useAuth();
  return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
}

// ═══════════════════════════════════════════════════════════════
//  useIsSuperAdmin - Check if user is super admin
// ═══════════════════════════════════════════════════════════════

export function useIsSuperAdmin() {
  const { user } = useAuth();
  return user?.role === 'SUPER_ADMIN';
}
