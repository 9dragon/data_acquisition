import { http } from './request'

/**
 * 用户接口
 */
export interface User {
  id?: number
  username: string
  name: string
  email?: string
  phone?: string
  status?: number
  currentProjectId?: number
  createdAt?: string
  updatedAt?: string
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
 * 用户API
 */
export const userApi = {
  /**
   * 获取用户选项列表（用于下拉选择器）
   */
  getOptions: (params?: { keyword?: string }): Promise<Option[]> => {
    return http.get('/users/options', { params })
  },

  /**
   * 分页查询用户列表
   */
  getPage: (params: {
    pageNum: number
    pageSize: number
    keyword?: string
    status?: number
  }): Promise<PageResponse<User>> => {
    return http.get('/users', { params })
  },

  /**
   * 根据ID获取用户详情
   */
  getById: (id: number): Promise<User> => {
    return http.get(`/users/${id}`)
  },

  /**
   * 新增用户
   */
  create: (data: Omit<User, 'id'>): Promise<void> => {
    return http.post('/users', data)
  },

  /**
   * 更新用户
   */
  update: (id: number, data: Partial<User>): Promise<void> => {
    return http.put(`/users/${id}`, data)
  },

  /**
   * 删除用户
   */
  delete: (id: number): Promise<void> => {
    return http.delete(`/users/${id}`)
  }
}
