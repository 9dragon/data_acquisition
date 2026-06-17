import { http } from './request'

/**
 * 项目接口
 */
export interface Project {
  id?: number
  code: string
  name: string
  description?: string
  status?: number
  stage?: string
  createdAt?: string
  updatedAt?: string
  managerName?: string
  managerUserId?: number
}

/**
 * 通用选项接口
 */
export interface Option {
  id: number | string
  name: string
}

/**
 * 分页响应接口
 */
export interface PageResponse<T> {
  records: T[]
  total: number
  current: number
  size: number
}

/**
 * 项目API
 */
export const projectApi = {
  /**
   * 获取项目选项列表（用于下拉选择器）
   */
  getOptions: (params?: { keyword?: string }): Promise<Option[]> => {
    return http.get('/projects/options', { params })
  },

  /**
   * 分页查询项目列表
   */
  getPage: (params: {
    pageNum: number
    pageSize: number
    keyword?: string
    status?: number
    stage?: string
  }): Promise<PageResponse<Project>> => {
    return http.get('/projects', { params })
  },

  /**
   * 根据ID获取项目详情
   */
  getById: (id: number): Promise<Project> => {
    return http.get(`/projects/${id}`)
  },

  /**
   * 新增项目
   */
  create: (data: Omit<Project, 'id'>): Promise<number> => {
    return http.post('/projects', data)
  },

  /**
   * 更新项目
   */
  update: (id: number, data: Partial<Project>): Promise<void> => {
    return http.put(`/projects/${id}`, data)
  },

  /**
   * 删除项目
   */
  delete: (id: number): Promise<void> => {
    return http.delete(`/projects/${id}`)
  }
}

/**
 * 项目成员
 */
export interface ProjectMember {
  id?: number
  projectId?: number
  userId: number
  userName?: string
  userPhone?: string
  role: 'MANAGER' | 'MEMBER'
  isActive?: number
  joinedAt?: string
  remark?: string
}

/**
 * 项目成员API
 */
export const projectMemberApi = {
  /**
   * 获取项目成员列表
   */
  list: (projectId: number): Promise<ProjectMember[]> => {
    return http.get(`/projects/${projectId}/members`)
  },

  /**
   * 批量添加项目成员
   */
  add: (projectId: number, userIds: number[], role: 'MANAGER' | 'MEMBER'): Promise<number> => {
    return http.post(`/projects/${projectId}/members`, { userIds, role })
  },

  /**
   * 修改成员角色
   */
  updateRole: (projectId: number, userId: number, role: 'MANAGER' | 'MEMBER'): Promise<void> => {
    return http.put(`/projects/${projectId}/members/${userId}`, { role })
  },

  /**
   * 移除项目成员
   */
  remove: (projectId: number, userId: number): Promise<void> => {
    return http.delete(`/projects/${projectId}/members/${userId}`)
  }
}
