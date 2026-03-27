import { http } from './request'

/**
 * 工序信息
 */
export interface Process {
  id: number
  name: string
  code?: string
  projectId: number
  projectName?: string
  description?: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

/**
 * 分页响应（MyBatis-Plus IPage格式）
 */
export interface PageResponse<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

/**
 * 工序API
 */
export const processApi = {
  /**
   * 分页查询工序
   */
  getProcessPage(params: {
    page: number
    pageSize: number
    projectId?: number
    keyword?: string
  }): Promise<PageResponse<Process>> {
    return http.get('/processes', { params })
  },

  /**
   * 根据项目ID获取工序列表
   */
  getProcessesByProject(projectId: number): Promise<Process[]> {
    return http.get(`/processes/project/${projectId}`)
  },

  /**
   * 获取工序详情
   */
  getProcessById(id: number): Promise<Process> {
    return http.get(`/processes/${id}`)
  },

  /**
   * 创建工序
   */
  createProcess(data: {
    name: string
    code?: string
    projectId: number
    description?: string
    sortOrder?: number
  }): Promise<Process> {
    return http.post('/processes', data)
  },

  /**
   * 更新工序
   */
  updateProcess(id: number, data: {
    name?: string
    code?: string
    description?: string
    sortOrder?: number
  }): Promise<void> {
    return http.put(`/processes/${id}`, data)
  },

  /**
   * 批量更新排序
   */
  updateSortOrder(processes: Process[]): Promise<void> {
    return http.put('/processes/reorder', { processes })
  },

  /**
   * 删除工序
   */
  deleteProcess(id: number): Promise<void> {
    return http.delete(`/processes/${id}`)
  }
}
