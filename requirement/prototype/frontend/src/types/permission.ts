/**
 * Permission type definitions for RBAC system
 */

/**
 * Permission codes - organized by resource and action
 */
export enum Permission {
  // Project permissions
  PROJECT_VIEW = 'project:view',
  PROJECT_CREATE = 'project:create',
  PROJECT_EDIT = 'project:edit',
  PROJECT_DELETE = 'project:delete',
  PROJECT_EXPORT = 'project:export',

  // Device permissions
  DEVICE_VIEW = 'device:view',
  DEVICE_CREATE = 'device:create',
  DEVICE_EDIT = 'device:edit',
  DEVICE_DELETE = 'device:delete',
  DEVICE_IMPORT = 'device:import',
  DEVICE_EXPORT = 'device:export',

  // Plan permissions
  PLAN_VIEW = 'plan:view',
  PLAN_EDIT = 'plan:edit',
  PLAN_REPORT = 'plan:report',
  PLAN_APPROVE = 'plan:approve',

  // Issue permissions
  ISSUE_VIEW = 'issue:view',
  ISSUE_CREATE = 'issue:create',
  ISSUE_HANDLE = 'issue:handle',
  ISSUE_DELETE = 'issue:delete',
  ISSUE_ASSIGN = 'issue:assign',
  ISSUE_CLOSE = 'issue:close',

  // Document permissions
  DOCUMENT_VIEW = 'document:view',
  DOCUMENT_UPLOAD = 'document:upload',
  DOCUMENT_EDIT = 'document:edit',
  DOCUMENT_DELETE = 'document:delete',
  DOCUMENT_DOWNLOAD = 'document:download',

  // System permissions
  SYSTEM_USER_VIEW = 'system:user:view',
  SYSTEM_USER_CREATE = 'system:user:create',
  SYSTEM_USER_EDIT = 'system:user:edit',
  SYSTEM_USER_DELETE = 'system:user:delete',

  SYSTEM_ROLE_VIEW = 'system:role:view',
  SYSTEM_ROLE_CREATE = 'system:role:create',
  SYSTEM_ROLE_EDIT = 'system:role:edit',
  SYSTEM_ROLE_DELETE = 'system:role:delete',

  SYSTEM_CONFIG_VIEW = 'system:config:view',
  SYSTEM_CONFIG_EDIT = 'system:config:edit',

  // Dashboard permissions
  DASHBOARD_VIEW = 'dashboard:view',

  // Profile permissions
  PROFILE_VIEW = 'profile:view',
  PROFILE_EDIT = 'profile:edit',
}

/**
 * Resource types
 */
export enum Resource {
  PROJECT = 'project',
  DEVICE = 'device',
  PLAN = 'plan',
  ISSUE = 'issue',
  DOCUMENT = 'document',
  SYSTEM = 'system',
  DASHBOARD = 'dashboard',
  PROFILE = 'profile',
}

/**
 * Action types
 */
export enum Action {
  VIEW = 'view',
  CREATE = 'create',
  EDIT = 'edit',
  DELETE = 'delete',
  EXPORT = 'export',
  IMPORT = 'import',
  UPLOAD = 'upload',
  DOWNLOAD = 'download',
  REPORT = 'report',
  APPROVE = 'approve',
  HANDLE = 'handle',
  ASSIGN = 'assign',
  CLOSE = 'close',
}

/**
 * Permission structure
 */
export interface PermissionStruct {
  resource: Resource;
  action: Action;
  code: string;
  description: string;
}

/**
 * Role interface
 */
export interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  permissions: Permission[];
  userCount: number;
  createTime: string;
  updateTime?: string;
}

/**
 * Permission tree node for UI display
 */
export interface PermissionTreeNode {
  title: string;
  key: string;
  children?: PermissionTreeNode[];
  permissions?: Permission[];
}

/**
 * Get permission code from resource and action
 */
export const getPermissionCode = (resource: Resource, action: Action): string => {
  return `${resource}:${action}`;
};

/**
 * Get all permissions for a resource
 */
export const getResourcePermissions = (resource: Resource): Permission[] => {
  return Object.values(Permission).filter(p => p.startsWith(`${resource}:`));
};

/**
 * Permission groups for tree display
 */
export const PERMISSION_GROUPS: PermissionTreeNode[] = [
  {
    title: '项目管理',
    key: 'project',
    permissions: [
      Permission.PROJECT_VIEW,
      Permission.PROJECT_CREATE,
      Permission.PROJECT_EDIT,
      Permission.PROJECT_DELETE,
      Permission.PROJECT_EXPORT,
    ],
  },
  {
    title: '设备管理',
    key: 'device',
    permissions: [
      Permission.DEVICE_VIEW,
      Permission.DEVICE_CREATE,
      Permission.DEVICE_EDIT,
      Permission.DEVICE_DELETE,
      Permission.DEVICE_IMPORT,
      Permission.DEVICE_EXPORT,
    ],
  },
  {
    title: '计划管理',
    key: 'plan',
    permissions: [
      Permission.PLAN_VIEW,
      Permission.PLAN_EDIT,
      Permission.PLAN_REPORT,
      Permission.PLAN_APPROVE,
    ],
  },
  {
    title: '问题管理',
    key: 'issue',
    permissions: [
      Permission.ISSUE_VIEW,
      Permission.ISSUE_CREATE,
      Permission.ISSUE_HANDLE,
      Permission.ISSUE_DELETE,
      Permission.ISSUE_ASSIGN,
      Permission.ISSUE_CLOSE,
    ],
  },
  {
    title: '文档管理',
    key: 'document',
    permissions: [
      Permission.DOCUMENT_VIEW,
      Permission.DOCUMENT_UPLOAD,
      Permission.DOCUMENT_EDIT,
      Permission.DOCUMENT_DELETE,
      Permission.DOCUMENT_DOWNLOAD,
    ],
  },
  {
    title: '系统管理',
    key: 'system',
    permissions: [
      Permission.SYSTEM_USER_VIEW,
      Permission.SYSTEM_USER_CREATE,
      Permission.SYSTEM_USER_EDIT,
      Permission.SYSTEM_USER_DELETE,
      Permission.SYSTEM_ROLE_VIEW,
      Permission.SYSTEM_ROLE_CREATE,
      Permission.SYSTEM_ROLE_EDIT,
      Permission.SYSTEM_ROLE_DELETE,
      Permission.SYSTEM_CONFIG_VIEW,
      Permission.SYSTEM_CONFIG_EDIT,
    ],
  },
  {
    title: '工作台',
    key: 'dashboard',
    permissions: [
      Permission.DASHBOARD_VIEW,
    ],
  },
  {
    title: '个人中心',
    key: 'profile',
    permissions: [
      Permission.PROFILE_VIEW,
      Permission.PROFILE_EDIT,
    ],
  },
];
