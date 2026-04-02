import { http } from './request'
import type {
  DeviceResearch,
  DeviceResearchBasic,
  DeviceResearchController,
  DeviceResearchCollection
} from '@/types/device'

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
 * 设备调研查询参数
 */
export interface DeviceResearchQueryParams {
  pageNum: number
  pageSize: number
  projectId?: string
  workshop?: string
  deviceType?: string
  keyword?: string
}

/**
 * 导入结果接口
 */
export interface ImportResult {
  total: number
  successCount: number
  failCount: number
  errors?: string[]
}

/**
 * 设备调研API
 */
export const deviceResearchApi = {
  /**
   * 分页查询调研列表
   */
  getPage: (params: DeviceResearchQueryParams): Promise<PageResponse<DeviceResearch>> => {
    return http.get('/device-research', { params })
  },

  /**
   * 获取所有调研列表
   */
  getList: (params?: Partial<DeviceResearchQueryParams>): Promise<DeviceResearch[]> => {
    return http.get('/device-research/list', { params })
  },

  /**
   * 根据ID获取调研详情
   */
  getById: (id: number): Promise<DeviceResearch> => {
    return http.get(`/device-research/${id}`)
  },

  /**
   * 根据设备ID获取调研
   */
  getByDeviceId: (deviceId: number): Promise<DeviceResearch> => {
    return http.get(`/device-research/device/${deviceId}`)
  },

  /**
   * 创建调研（从零）
   */
  create: (data: Partial<DeviceResearch>): Promise<DeviceResearch> => {
    return http.post('/device-research', data)
  },

  /**
   * 更新调研信息
   */
  update: (id: number, data: Partial<DeviceResearch>): Promise<DeviceResearch> => {
    return http.put(`/device-research/${id}`, data)
  },

  /**
   * 更新基础信息
   */
  updateBasic: (id: number, data: DeviceResearchBasic): Promise<void> => {
    return http.put(`/device-research/${id}/basic`, data)
  },

  /**
   * 更新控制器信息
   */
  updateController: (id: number, data: DeviceResearchController): Promise<void> => {
    return http.put(`/device-research/${id}/controller`, data)
  },

  /**
   * 更新采集信息
   */
  updateCollection: (id: number, data: DeviceResearchCollection): Promise<void> => {
    return http.put(`/device-research/${id}/collection`, data)
  },

  /**
   * 删除调研
   */
  delete: (id: number): Promise<void> => {
    return http.delete(`/device-research/${id}`)
  },

  /**
   * 批量导入
   */
  import: (file: File): Promise<ImportResult> => {
    const formData = new FormData()
    formData.append('file', file)
    return http.post('/device-research/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  /**
   * 批量导出
   */
  export: (ids: string[]): Promise<Blob> => {
    return http.post('/device-research/export', { ids }, { responseType: 'blob' })
  },

  /**
   * 下载模板
   */
  downloadTemplate: (): Promise<Blob> => {
    return http.get('/device-research/template', { responseType: 'blob' })
  }
}
