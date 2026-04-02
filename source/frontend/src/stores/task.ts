import { defineStore } from 'pinia'
import { ref } from 'vue'
import { taskApi } from '@/api/task'
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

export const useTaskStore = defineStore('task', () => {
  // 项目任务状态
  const tasks = ref<ProjectPlanTask[]>([])
  const currentTask = ref<ProjectPlanTask | null>(null)
  const loading = ref(false)
  const total = ref(0)

  // 项目级任务列表（跨项目）
  const projectTasks = ref<ProjectTaskListItem[]>([])
  const projectTaskTotal = ref(0)

  // 设备任务状态
  const deviceTasks = ref<DeviceTask[]>([])
  const deviceTaskTotal = ref(0)
  const deviceTaskLoading = ref(false)

  /**
   * 分页查询任务列表
   */
  async function fetchTasks(params: ProjectPlanTaskQueryParams & { projectId: number }) {
    loading.value = true
    try {
      const response = await taskApi.getTaskList(params)
      tasks.value = response.records || []
      total.value = response.total || 0
      return response
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取项目的所有任务（不分页）
   */
  async function fetchTasksByProjectId(projectId: number) {
    loading.value = true
    try {
      const response = await taskApi.getTasksByProjectId(projectId)
      tasks.value = response || []
      return response
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取指定阶段的任务
   */
  async function fetchTasksByStage(projectId: number, stageKey: string) {
    loading.value = true
    try {
      const response = await taskApi.getTasksByStage(projectId, stageKey)
      return response || []
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取任务详情
   */
  async function fetchTaskDetail(id: number) {
    loading.value = true
    try {
      const response = await taskApi.getTaskById(id)
      currentTask.value = response
      return response
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建任务
   */
  async function createTask(data: ProjectPlanTaskFormData) {
    const response = await taskApi.createTask(data)
    return response
  }

  /**
   * 更新任务
   */
  async function updateTask(id: number, data: Partial<ProjectPlanTaskFormData>) {
    const response = await taskApi.updateTask(id, data)
    return response
  }

  /**
   * 更新项目任务进度
   */
  async function updateProjectTaskProgress(id: number, data: ProjectTaskUpdateDTO) {
    const response = await taskApi.updateProjectTaskProgress(id, data)
    return response
  }

  /**
   * 删除任务
   */
  async function deleteTask(id: number) {
    const response = await taskApi.deleteTask(id)
    return response
  }

  /**
   * 批量删除任务
   */
  async function batchDeleteTasks(ids: number[]) {
    const response = await taskApi.batchDeleteTasks(ids)
    return response
  }

  // ==================== 项目级任务（跨项目） ====================

  /**
   * 分页查询所有项目的任务列表
   */
  async function fetchAllProjectTasks(params: ProjectTaskQueryParams) {
    loading.value = true
    try {
      const response = await taskApi.getAllProjectTasks(params)
      projectTasks.value = response.records || []
      projectTaskTotal.value = response.total || 0
      return response
    } finally {
      loading.value = false
    }
  }

  // ==================== 设备任务相关方法 ====================

  /**
   * 分页查询设备任务列表
   */
  async function fetchDeviceTasks(params: DeviceTaskQueryParams) {
    deviceTaskLoading.value = true
    try {
      const response = await taskApi.getDeviceTaskList(params)
      deviceTasks.value = response.records || []
      deviceTaskTotal.value = response.total || 0
      return response
    } finally {
      deviceTaskLoading.value = false
    }
  }

  /**
   * 根据设备ID获取任务列表
   */
  async function fetchTasksByDeviceId(deviceId: number) {
    deviceTaskLoading.value = true
    try {
      const response = await taskApi.getTasksByDeviceId(deviceId)
      return response || []
    } finally {
      deviceTaskLoading.value = false
    }
  }

  /**
   * 根据项目ID获取设备任务列表
   */
  async function fetchDeviceTasksByProjectId(projectId: number) {
    deviceTaskLoading.value = true
    try {
      const response = await taskApi.getDeviceTasksByProjectId(projectId)
      return response || []
    } finally {
      deviceTaskLoading.value = false
    }
  }

  /**
   * 根据项目ID和阶段标识获取设备任务列表
   */
  async function fetchDeviceTasksByProjectIdAndStage(projectId: number, stageKey: string) {
    deviceTaskLoading.value = true
    try {
      const response = await taskApi.getDeviceTasksByProjectIdAndStage(projectId, stageKey)
      return response || []
    } finally {
      deviceTaskLoading.value = false
    }
  }

  /**
   * 获取设备任务详情
   */
  async function fetchDeviceTaskDetail(id: number) {
    deviceTaskLoading.value = true
    try {
      const response = await taskApi.getDeviceTaskById(id)
      return response
    } finally {
      deviceTaskLoading.value = false
    }
  }

  /**
   * 更新设备任务进度
   */
  async function updateDeviceTaskProgress(id: number, data: DeviceTaskUpdateDTO) {
    const response = await taskApi.updateDeviceTaskProgress(id, data)
    return response
  }

  /**
   * 删除设备任务
   */
  async function deleteDeviceTask(id: number) {
    const response = await taskApi.deleteDeviceTask(id)
    return response
  }

  /**
   * 批量删除设备任务
   */
  async function batchDeleteDeviceTasks(ids: number[]) {
    const response = await taskApi.batchDeleteDeviceTasks(ids)
    return response
  }

  /**
   * 初始化设备任务列表
   */
  async function initializeDeviceTasks(deviceId: number, projectId: number) {
    const response = await taskApi.initializeDeviceTasks(deviceId, projectId)
    return response
  }

  /**
   * 创建设备任务
   */
  async function createDeviceTask(data: Partial<DeviceTask>) {
    const response = await taskApi.createDeviceTask(data)
    return response
  }

  return {
    // 项目任务
    tasks,
    currentTask,
    loading,
    total,
    fetchTasks,
    fetchTasksByProjectId,
    fetchTasksByStage,
    fetchTaskDetail,
    createTask,
    updateTask,
    updateProjectTaskProgress,
    deleteTask,
    batchDeleteTasks,

    // 项目级任务（跨项目）
    projectTasks,
    projectTaskTotal,
    fetchAllProjectTasks,

    // 设备任务
    deviceTasks,
    deviceTaskTotal,
    deviceTaskLoading,
    fetchDeviceTasks,
    fetchTasksByDeviceId,
    fetchDeviceTasksByProjectId,
    fetchDeviceTasksByProjectIdAndStage,
    fetchDeviceTaskDetail,
    updateDeviceTaskProgress,
    deleteDeviceTask,
    batchDeleteDeviceTasks,
    initializeDeviceTasks,
    createDeviceTask
  }
})
