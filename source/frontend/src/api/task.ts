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
