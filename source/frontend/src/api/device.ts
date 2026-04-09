import { http } from './request'

/**
 * 设备接口
 */
export interface Device {
  id?: number
  code: string
  name: string
  projectId?: number
  projectName?: string
  workshopId?: number
  workshopName?: string
  typeId?: number
  typeName?: string
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
 * 设备API
 */
export const deviceApi = {
  /**
   * 获取设备选项列表（用于下拉选择器）
   */
  getOptions: (params?: { projectId?: number; workshopId?: number; keyword?: string }): Promise<Option[]> => {
    return http.get('/devices/options', { params })
  },

  /**
   * 分页查询设备列表
   */
  getPage: (params: {
    pageNum: number
    pageSize: number
    keyword?: string
    projectId?: number
    typeId?: number
  }): Promise<PageResponse<Device>> => {
    return http.get('/devices', { params })
  },

  /**
   * 根据ID获取设备详情
   */
  getById: (id: number): Promise<Device> => {
    return http.get(`/devices/${id}`)
  },

  /**
   * 新增设备
   */
  create: (data: Omit<Device, 'id'>): Promise<void> => {
    return http.post('/devices', data)
  },

  /**
   * 更新设备
   */
  update: (id: number, data: Partial<Device>): Promise<void> => {
    return http.put(`/devices/${id}`, data)
  },

  /**
   * 删除设备
   */
  delete: (id: number): Promise<void> => {
    return http.delete(`/devices/${id}`)
  }
}
