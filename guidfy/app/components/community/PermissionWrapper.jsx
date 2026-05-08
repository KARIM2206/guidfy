'use client';

import { useAuth } from '@/app/CONTEXT/AuthProvider';

// ═══════════════════════════════════════════════════════════════
//  PermissionWrapper - Conditional rendering based on role
// ═══════════════════════════════════════════════════════════════

export default function PermissionWrapper({
  children,
  roles = [],
  permission = null,
  fallback = null,
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return fallback;
  }

  // Check role
  if (roles.length > 0) {
    const hasRole = roles.includes(user?.role);
    if (!hasRole) return fallback;
  }

  // Check permission
  if (permission) {
    const permissionMap = {
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

    const userPermissions = permissionMap[user?.role] || [];
    const hasPermission = userPermissions.includes(permission);

    if (!hasPermission) return fallback;
  }

  return children;
}

// ═══════════════════════════════════════════════════════════════
//  RoleGuard - Client component guard
// ═══════════════════════════════════════════════════════════════

export function RoleGuard({ children, requiredRoles = [], fallback = null }) {
  const { user, loading } = useAuth();

  if (loading) {
    return fallback;
  }

  const hasAccess = requiredRoles.includes(user?.role);

  return hasAccess ? children : fallback;
}
