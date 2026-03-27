import { http } from './request'

/**
 * 角色信息
 */
export interface Role {
  id: number
  code: string
  name: string
  description?: string
  permissions?: string
  isSystem?: number
  userCount?: number
  permissionCount?: number
  createdAt: string
  updatedAt: string
}

/**
 * 权限信息
 */
export interface Permission {
  id: number
  code: string
  name: string
  type: 'menu' | 'button' | 'api'
  parentId?: number
  path?: string
  method?: string
  description?: string
  sortOrder: number
  status: number
  children?: Permission[]
}

/**
 * 分页响应
 */
export interface PageResponse<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

/**
 * 角色API
 */
export const roleApi = {
  /**
   * 分页查询角色
   */
  getRolePage(params: {
    page: number
    pageSize: number
    name?: string
    code?: string
  }): Promise<PageResponse<Role>> {
    return http.get('/roles', { params })
  },

  /**
   * 获取角色详情
   */
  getRoleById(id: number): Promise<Role> {
    return http.get(`/roles/${id}`)
  },

  /**
   * 创建角色
   */
  createRole(data: {
    code: string
    name: string
    description?: string
    permissionIds?: number[]
  }): Promise<Role> {
    return http.post('/roles', data)
  },

  /**
   * 更新角色
   */
  updateRole(id: number, data: {
    code?: string
    name?: string
    description?: string
    permissionIds?: number[]
  }): Promise<void> {
    return http.put(`/roles/${id}`, data)
  },

  /**
   * 删除角色
   */
  deleteRole(id: number): Promise<void> {
    return http.delete(`/roles/${id}`)
  },

  /**
   * 分配权限
   */
  assignPermissions(id: number, permissionIds: number[]): Promise<void> {
    return http.post(`/roles/${id}/permissions`, { permissionIds })
  },

  /**
   * 获取角色的权限ID列表
   */
  getRolePermissions(id: number): Promise<number[]> {
    return http.get(`/roles/${id}/permissions`)
  },

  /**
   * 获取角色权限详情
   */
  getRolePermissionsDetail(id: number): Promise<Permission[]> {
    return http.get(`/roles/${id}/permissions-detail`)
  },

  /**
   * 获取角色权限数量
   */
  getPermissionCount(id: number): Promise<number> {
    return http.get(`/roles/${id}/permission-count`)
  }
}

/**
 * 权限API
 */
export const permissionApi = {
  /**
   * 获取权限树
   */
  getPermissions(params?: {
    type?: string
    status?: number
  }): Promise<Permission[]> {
    return http.get('/permissions', { params })
  },

  /**
   * 根据角色获取权限
   */
  getPermissionsByRole(roleId: number): Promise<Permission[]> {
    return http.get(`/permissions/role/${roleId}`)
  }
}
