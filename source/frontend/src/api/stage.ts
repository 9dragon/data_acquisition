import { http } from './request'

/**
 * 资料需求
 */
export interface MaterialRequirement {
  key: string
  name: string
  description?: string
  fileType: string
  required: boolean
  minCount: number
  maxCount: number
  acceptTypes?: string[]
}

/**
 * 任务模板
 */
export interface TaskTemplate {
  id: string
  key: string
  name: string
  description?: string
  defaultWeight: number
  materialRequirements?: MaterialRequirement[]
}

/**
 * 阶段信息
 */
export interface Stage {
  id: number
  key: string
  name: string
  description?: string
  icon?: string
  color?: string
  progressMode: 'by_task' | 'by_device'
  isSystem: number
  defaultWeight: number
  taskTemplates?: TaskTemplate[]
  sortOrder: number
  status: number
  createdAt: string
  updatedAt: string
}

/**
 * 阶段API
 */
export const stageApi = {
  /**
   * 获取所有阶段
   */
  getAllStages(): Promise<Stage[]> {
    return http.get('/stages')
  },

  /**
   * 获取阶段详情
   */
  getStageById(id: number): Promise<Stage> {
    return http.get(`/stages/${id}`)
  },

  /**
   * 创建阶段
   */
  createStage(data: {
    key: string
    name: string
    description?: string
    icon?: string
    color?: string
    progressMode: 'by_task' | 'by_device'
    defaultWeight?: number
    taskTemplates?: TaskTemplate[]
    sortOrder?: number
  }): Promise<Stage> {
    return http.post('/stages', data)
  },

  /**
   * 更新阶段
   */
  updateStage(id: number, data: {
    key?: string
    name?: string
    description?: string
    icon?: string
    color?: string
    progressMode?: 'by_task' | 'by_device'
    defaultWeight?: number
    taskTemplates?: TaskTemplate[]
    sortOrder?: number
  }): Promise<void> {
    return http.put(`/stages/${id}`, data)
  },

  /**
   * 删除阶段
   */
  deleteStage(id: number): Promise<void> {
    return http.delete(`/stages/${id}`)
  },

  /**
   * 添加任务模板
   */
  addTaskTemplate(stageId: number, taskTemplate: TaskTemplate): Promise<void> {
    return http.post(`/stages/${stageId}/tasks`, taskTemplate)
  },

  /**
   * 更新任务模板
   */
  updateTaskTemplate(stageId: number, taskId: string, taskTemplate: Partial<TaskTemplate>): Promise<void> {
    return http.put(`/stages/${stageId}/tasks/${taskId}`, taskTemplate)
  },

  /**
   * 删除任务模板
   */
  deleteTaskTemplate(stageId: number, taskId: string): Promise<void> {
    return http.delete(`/stages/${stageId}/tasks/${taskId}`)
  }
}
