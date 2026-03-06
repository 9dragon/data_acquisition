/**
 * Permission Gate component for conditional rendering based on permissions
 */

import React, { ReactNode } from 'react';
import { Permission } from '../../types/permission';
import { usePermissions } from '../../stores/permissionStore';

interface PermissionGateProps {
  children: ReactNode;
  permissions: Permission[];
  mode?: 'any' | 'all'; // Require any or all permissions
  fallback?: ReactNode;
  requireAuth?: boolean;
}

/**
 * PermissionGate - Conditionally render children based on user permissions
 *
 * @example
 * // Require any of the permissions
 * <PermissionGate permissions={[Permission.PROJECT_VIEW, Permission.PROJECT_EDIT]}>
 *   <Button>Edit Project</Button>
 * </PermissionGate>
 *
 * @example
 * // Require all permissions
 * <PermissionGate
 *   permissions={[Permission.PROJECT_EDIT, Permission.PROJECT_DELETE]}
 *   mode="all"
 * >
 *   <Button>Advanced Options</Button>
 * </PermissionGate>
 *
 * @example
 * // Show fallback when no permission
 * <PermissionGate
 *   permissions={[Permission.PROJECT_DELETE]}
 *   fallback={<span>Insufficient permissions</span>}
 * >
 *   <Button>Delete</Button>
 * </PermissionGate>
 */
const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permissions,
  mode = 'any',
  fallback = null,
  requireAuth = true,
}) => {
  const { user, hasAnyPermission, hasAllPermissions, isAdmin } = usePermissions();

  // Check authentication if required
  if (requireAuth && !user) {
    return <>{fallback}</>;
  }

  // Admin has all permissions
  if (isAdmin) {
    return <>{children}</>;
  }

  // Check permissions based on mode
  const hasAccess = mode === 'any'
    ? hasAnyPermission(permissions)
    : hasAllPermissions(permissions);

  if (hasAccess) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default PermissionGate;
