import { http } from './request'
import type {
  ProjectPlanTask,
  ProjectPlanTaskQueryParams,
  ProjectPlanTaskFormData,
  DeviceTask,
  DeviceTaskQueryParams,
  DeviceTaskUpdateDTO,
  ProjectTaskListItem,
  ProjectTaskQueryParams,
  ProjectTaskUpdateDTO
} from '@/types/task'

/**
 * 项目任务API
 */
export const taskApi = {
  /**
   * 分页查询项目的任务列表
   */
  getTaskList(params: ProjectPlanTaskQueryParams & { projectId: number }) {
    return http.get(`/tasks/project/${params.projectId}`, { params })
  },

  /**
   * 根据项目ID获取所有任务（不分页）
   */
  getTasksByProjectId(projectId: number): Promise<ProjectPlanTask[]> {
    return http.get(`/tasks/project/${projectId}/all`)
  },

  /**
   * 根据项目ID和阶段标识获取任务列表
   */
  getTasksByStage(projectId: number, stageKey: string): Promise<ProjectPlanTask[]> {
    return http.get(`/tasks/project/${projectId}/stage/${stageKey}`)
  },

  /**
   * 根据ID获取任务详情
   */
  getTaskById(id: number): Promise<ProjectPlanTask> {
    return http.get(`/tasks/${id}`)
  },

  /**
   * 创建任务
   */
  createTask(data: ProjectPlanTaskFormData): Promise<void> {
    return http.post('/tasks', data)
  },

  /**
   * 更新任务
   */
  updateTask(id: number, data: Partial<ProjectPlanTaskFormData>): Promise<void> {
    return http.put(`/tasks/${id}`, data)
  },

  /**
   * 删除任务
   */
  deleteTask(id: number): Promise<void> {
    return http.delete(`/tasks/${id}`)
  },

  /**
   * 批量删除任务
   */
  batchDeleteTasks(ids: number[]): Promise<void> {
    return http.delete('/tasks/batch', { data: ids })
  },

  /**
   * 更新项目任务进度
   */
  updateProjectTaskProgress(id: number, data: ProjectTaskUpdateDTO): Promise<void> {
    return http.put(`/tasks/${id}/progress`, data)
  },

  /**
   * 分页查询所有项目的任务列表（跨项目查询）
   */
  getAllProjectTasks(params: ProjectTaskQueryParams): Promise<{ records: ProjectTaskListItem[]; total: number }> {
    return http.get('/tasks/all-projects', { params })
  },

  // ==================== 设备任务相关API ====================

  /**
   * 分页查询设备任务列表
   */
  getDeviceTaskList(params: DeviceTaskQueryParams): Promise<{ records: DeviceTask[]; total: number }> {
    return http.get('/device-tasks/page', { params })
  },

  /**
   * 根据设备ID获取任务列表
   */
  getTasksByDeviceId(deviceId: number): Promise<DeviceTask[]> {
    return http.get(`/device-tasks/device/${deviceId}`)
  },

  /**
   * 根据项目ID获取设备任务列表
   */
  getDeviceTasksByProjectId(projectId: number): Promise<DeviceTask[]> {
    return http.get(`/device-tasks/project/${projectId}`)
  },

  /**
   * 根据项目ID和阶段标识获取设备任务列表
   */
  getDeviceTasksByProjectIdAndStage(projectId: number, stageKey: string): Promise<DeviceTask[]> {
    return http.get(`/device-tasks/project/${projectId}/stage/${stageKey}`)
  },

  /**
   * 根据ID获取设备任务详情
   */
  getDeviceTaskById(id: number): Promise<DeviceTask> {
    return http.get(`/device-tasks/${id}`)
  },

  /**
   * 创建设备任务
   */
  createDeviceTask(data: Partial<DeviceTask>): Promise<void> {
    return http.post('/device-tasks', data)
  },

  /**
   * 更新设备任务进度
   */
  updateDeviceTaskProgress(id: number, data: DeviceTaskUpdateDTO): Promise<void> {
    return http.put(`/device-tasks/${id}/progress`, data)
  },

  /**
   * 删除设备任务
   */
  deleteDeviceTask(id: number): Promise<void> {
    return http.delete(`/device-tasks/${id}`)
  },

  /**
   * 批量删除设备任务
   */
  batchDeleteDeviceTasks(ids: number[]): Promise<void> {
    return http.delete('/device-tasks/batch', { data: ids })
  },

  /**
   * 初始化设备的任务列表
   */
  initializeDeviceTasks(deviceId: number, projectId: number): Promise<void> {
    return http.post('/device-tasks/initialize', null, { params: { deviceId, projectId } })
  }
}

// ==================== 移动端任务API ====================

/**
 * 任务状态
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

/**
 * 任务优先级
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

/**
 * 移动端任务
 */
export interface MobileTask {
  id: number
  code: string
  title: string
  description?: string
  type?: string
  status: TaskStatus
  priority: TaskPriority
  projectId: number
  projectName?: string
  deviceId?: number
  deviceName?: string
  assigneeId?: number
  assigneeName?: string
  creatorId?: number
  creatorName?: string
  plannedStartDate?: string
  plannedEndDate?: string
  actualStartDate?: string
  actualEndDate?: string
  progress: number
  remarks?: string
  createdAt: string
  updatedAt?: string
}

/**
 * 任务填报请求
 */
export interface TaskReportRequest {
  actualHours?: number
  progress: number
  status?: TaskStatus
  remarks?: string
  attachments?: string[]
}

/**
 * 移动端任务API
 */
export const mobileTaskApi = {
  /**
   * 获取我的任务列表
   */
  myTasks: (params: { status?: TaskStatus; pageNum: number; pageSize: number }): Promise<{ records: MobileTask[]; total: number }> => {
    return http.get('/mobile/tasks/my', { params })
  },

  /**
   * 获取任务详情
   */
  detail: (id: number): Promise<MobileTask> => {
    return http.get(`/mobile/tasks/${id}`)
  },

  /**
   * 填报任务
   */
  report: (id: number, data: TaskReportRequest): Promise<MobileTask> => {
    return http.post(`/mobile/tasks/${id}/report`, data)
  },

  /**
   * 上传任务附件
   */
  uploadAttachment: (file: File): Promise<{ url: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    return http.post('/mobile/tasks/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

