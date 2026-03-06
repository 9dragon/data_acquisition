/**
 * Permission store for managing user permissions and roles
 */

import { create } from 'zustand';
import { Permission, Role } from '../types/permission';
import type { User } from '../utils/permissionHelpers';
import { getUserPermissions, checkPermission } from '../utils/permissionHelpers';

interface PermissionState {
  user: User | null;
  roles: Role[];
  userPermissions: Permission[];

  // Actions
  setUser: (user: User | null) => void;
  setRoles: (roles: Role[]) => void;
  updateUserRoles: (userId: string, roleIds: string[]) => void;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  loadUserPermissions: () => void;
  clearUser: () => void;
}

export const usePermissionStore = create<PermissionState>((set, get) => ({
  user: null,
  roles: [],
  userPermissions: [],

  setUser: (user) => {
    set({ user });
    get().loadUserPermissions();
  },

  setRoles: (roles) => {
    set({ roles });
  },

  updateUserRoles: (userId, roleIds) => {
    const { user, roles } = get();
    if (user && user.id === userId) {
      const userRoles = roles.filter(role => roleIds.includes(role.id));
      set({ user: { ...user, roles: userRoles } });
      get().loadUserPermissions();
    }
  },

  hasPermission: (permission) => {
    const { user } = get();
    return checkPermission(user, permission);
  },

  hasAnyPermission: (permissions) => {
    const { user } = get();
    if (!user) return false;
    if (user.isAdmin) return true;

    return permissions.some(permission => checkPermission(user, permission));
  },

  hasAllPermissions: (permissions) => {
    const { user } = get();
    if (!user) return false;
    if (user.isAdmin) return true;

    return permissions.every(permission => checkPermission(user, permission));
  },

  loadUserPermissions: () => {
    const { user } = get();
    const permissions = getUserPermissions(user);
    set({ userPermissions: permissions });
  },

  clearUser: () => {
    set({ user: null, userPermissions: [] });
  },
}));

// Hook for convenience
export const usePermissions = () => {
  const { user, userPermissions, hasPermission, hasAnyPermission, hasAllPermissions } = usePermissionStore();

  return {
    user,
    userPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin: user?.isAdmin ?? false,
  };
};
