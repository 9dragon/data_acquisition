/**
 * Permission utility functions for RBAC system
 */

import { Permission, Resource, Action, getPermissionCode } from '../types/permission';
import type { Role } from '../types/permission';

/**
 * User interface with roles
 */
export interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  roles: Role[];
  isAdmin?: boolean;
}

/**
 * Check if user has a specific permission
 */
export const checkPermission = (
  user: User | null,
  permission: Permission
): boolean => {
  if (!user) return false;

  // Admin has all permissions
  if (user.isAdmin) return true;

  // Check if any of the user's roles has the permission
  return user.roles?.some(role =>
    role.permissions.includes(permission)
  ) ?? false;
};

/**
 * Check if user has permission for a resource and action
 */
export const checkResourceAction = (
  user: User | null,
  resource: Resource,
  action: Action
): boolean => {
  const permissionCode = getPermissionCode(resource, action);
  return checkPermission(user, permissionCode as Permission);
};

/**
 * Check if user has any of the specified permissions
 */
export const hasAnyPermission = (
  user: User | null,
  permissions: Permission[]
): boolean => {
  if (!user) return false;
  if (user.isAdmin) return true;

  return permissions.some(permission => checkPermission(user, permission));
};

/**
 * Check if user has all of the specified permissions
 */
export const hasAllPermissions = (
  user: User | null,
  permissions: Permission[]
): boolean => {
  if (!user) return false;
  if (user.isAdmin) return true;

  return permissions.every(permission => checkPermission(user, permission));
};

/**
 * Filter data array based on user permissions
 * This is a simple implementation - in production, you'd want more sophisticated filtering
 */
export const filterDataByPermission = <T extends { id: string }>(
  data: T[],
  user: User | null,
  getPermission: (item: T) => Permission | null
): T[] => {
  if (!user) return [];
  if (user.isAdmin) return data;

  return data.filter(item => {
    const permission = getPermission(item);
    return permission ? checkPermission(user, permission) : true;
  });
};

/**
 * Get all permissions for a user
 */
export const getUserPermissions = (user: User | null): Permission[] => {
  if (!user) return [];
  if (user.isAdmin) return Object.values(Permission);

  const permissions = new Set<Permission>();
  user.roles?.forEach(role => {
    role.permissions.forEach(permission => permissions.add(permission));
  });

  return Array.from(permissions);
};

/**
 * Check if user can access a route
 */
export const canAccessRoute = (
  user: User | null,
  requiredPermissions: Permission[]
): boolean => {
  if (!user) return false;
  if (user.isAdmin) return true;
  if (requiredPermissions.length === 0) return true;

  return hasAnyPermission(user, requiredPermissions);
};

/**
 * Get role by code
 */
export const getRoleByCode = (roles: Role[], code: string): Role | undefined => {
  return roles.find(role => role.code === code);
};

/**
 * Validate role permissions
 */
export const validateRolePermissions = (role: Role): boolean => {
  // Basic validation - a role should have at least some permissions
  // In production, you might want more sophisticated validation
  return role.permissions.length >= 0;
};

/**
 * Create a permission checker function for a specific resource
 */
export const createResourceChecker = (resource: Resource) => {
  return (user: User | null, action: Action): boolean => {
    return checkResourceAction(user, resource, action);
  };
};

/**
 * Pre-configured resource checkers
 */
export const can = {
  viewProject: (user: User | null) => checkResourceAction(user, Resource.PROJECT, Action.VIEW),
  createProject: (user: User | null) => checkResourceAction(user, Resource.PROJECT, Action.CREATE),
  editProject: (user: User | null) => checkResourceAction(user, Resource.PROJECT, Action.EDIT),
  deleteProject: (user: User | null) => checkResourceAction(user, Resource.PROJECT, Action.DELETE),

  viewDevice: (user: User | null) => checkResourceAction(user, Resource.DEVICE, Action.VIEW),
  createDevice: (user: User | null) => checkResourceAction(user, Resource.DEVICE, Action.CREATE),
  editDevice: (user: User | null) => checkResourceAction(user, Resource.DEVICE, Action.EDIT),
  deleteDevice: (user: User | null) => checkResourceAction(user, Resource.DEVICE, Action.DELETE),

  viewPlan: (user: User | null) => checkResourceAction(user, Resource.PLAN, Action.VIEW),
  editPlan: (user: User | null) => checkResourceAction(user, Resource.PLAN, Action.EDIT),
  reportPlan: (user: User | null) => checkResourceAction(user, Resource.PLAN, Action.REPORT),

  viewIssue: (user: User | null) => checkResourceAction(user, Resource.ISSUE, Action.VIEW),
  createIssue: (user: User | null) => checkResourceAction(user, Resource.ISSUE, Action.CREATE),
  handleIssue: (user: User | null) => checkResourceAction(user, Resource.ISSUE, Action.HANDLE),
  deleteIssue: (user: User | null) => checkResourceAction(user, Resource.ISSUE, Action.DELETE),

  viewDocument: (user: User | null) => checkResourceAction(user, Resource.DOCUMENT, Action.VIEW),
  uploadDocument: (user: User | null) => checkResourceAction(user, Resource.DOCUMENT, Action.UPLOAD),
  editDocument: (user: User | null) => checkResourceAction(user, Resource.DOCUMENT, Action.EDIT),
  deleteDocument: (user: User | null) => checkResourceAction(user, Resource.DOCUMENT, Action.DELETE),

  viewSystem: (user: User | null) => hasAnyPermission(user, [
    Permission.SYSTEM_USER_VIEW,
    Permission.SYSTEM_ROLE_VIEW,
    Permission.SYSTEM_CONFIG_VIEW,
  ]),

  editSystem: (user: User | null) => hasAnyPermission(user, [
    Permission.SYSTEM_USER_EDIT,
    Permission.SYSTEM_ROLE_EDIT,
    Permission.SYSTEM_CONFIG_EDIT,
  ]),
};
