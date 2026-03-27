import { defineStore } from 'pinia'
import { ref } from 'vue'
import { http } from '@/api/request'

/**
 * 项目选项接口
 */
export interface ProjectOption {
  id: number
  name: string
  code: string
}

/**
 * 工序选项接口
 */
export interface ProcessOption {
  id: number
  name: string
  code: string
  projectId: number
}

export const useDeviceTypeStore = defineStore('deviceType', () => {
  // 项目列表
  const projectList = ref<ProjectOption[]>([])
  const projectListLoading = ref(false)

  // 工序列表
  const processList = ref<ProcessOption[]>([])
  const processListLoading = ref(false)

  /**
   * 获取项目列表
   */
  async function fetchProjectList() {
    projectListLoading.value = true
    try {
      const response = await http.get<any>('/projects', {
        params: { pageNum: 1, pageSize: 1000, enabled: true }
      })
      projectList.value = response.records || []
      return response
    } finally {
      projectListLoading.value = false
    }
  }

  /**
   * 根据项目ID获取工序列表
   */
  async function fetchProcessListByProject(projectId: number | undefined) {
    if (!projectId) {
      processList.value = []
      return
    }

    processListLoading.value = true
    try {
      const response = await http.get<any>('/processes', {
        params: { pageNum: 1, pageSize: 1000, projectId, enabled: true }
      })
      processList.value = response.records || []
      return response
    } finally {
      processListLoading.value = false
    }
  }

  /**
   * 清空工序列表
   */
  function clearProcessList() {
    processList.value = []
  }

  return {
    projectList,
    projectListLoading,
    processList,
    processListLoading,
    fetchProjectList,
    fetchProcessListByProject,
    clearProcessList
  }
})
