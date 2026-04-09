import { http } from './request'

/**
 * 车间接口
 */
export interface Workshop {
  id: number
  code: string
  name: string
  projectId?: number
  projectName?: string
  description?: string
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
 * 车间API
 */
export const workshopApi = {
  /**
   * 获取车间选项列表（用于下拉选择器）
   */
  getOptions: (params?: { projectId?: number; keyword?: string }): Promise<Option[]> => {
    return http.get('/workshops/options', { params })
  },

  /**
   * 分页查询车间列表
   */
  getPage: (params: { pageNum: number; pageSize: number; keyword?: string; projectId?: number }): Promise<PageResponse<Workshop>> => {
    return http.get('/workshops', { params })
  },

  /**
   * 根据ID获取车间详情
   */
  getById: (id: number): Promise<Workshop> => {
    return http.get(`/workshops/${id}`)
  }
}
