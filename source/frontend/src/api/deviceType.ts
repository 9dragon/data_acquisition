import { http } from './request'

/**
 * 设备类型接口
 */
export interface DeviceType {
  id?: number
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
 * 设备类型查询参数
 */
export interface DeviceTypeQueryParams {
  page: number
  pageSize: number
  projectId?: number
  keyword?: string
}

/**
 * 设备类型API
 */
export const deviceTypeApi = {
  /**
   * 获取设备类型选项列表（用于下拉选择器）
   */
  getOptions: (params?: { projectId?: number; keyword?: string }): Promise<Option[]> => {
    return http.get('/device-types/options', { params })
  },

  /**
   * 分页查询设备类型列表
   */
  getPage: (params: DeviceTypeQueryParams): Promise<PageResponse<DeviceType>> => {
    return http.get('/device-types', { params })
  },

  /**
   * 根据ID查询设备类型详情
   */
  getById: (id: number): Promise<DeviceType> => {
    return http.get(`/device-types/${id}`)
  },

  /**
   * 新增设备类型
   */
  create: (data: Omit<DeviceType, 'id'>): Promise<DeviceType> => {
    return http.post('/device-types', data)
  },

  /**
   * 更新设备类型
   */
  update: (id: number, data: Partial<DeviceType>): Promise<DeviceType> => {
    return http.put(`/device-types/${id}`, data)
  },

  /**
   * 删除设备类型
   */
  delete: (id: number): Promise<void> => {
    return http.delete(`/device-types/${id}`)
  }
}
