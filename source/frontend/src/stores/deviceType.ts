import { defineStore } from 'pinia'
import { ref } from 'vue'
import { http } from '@/api/request'

/**
 * 设备类型接口
 */
export interface DeviceType {
  id: number
  name: string
  code: string
  projectId?: number
  projectName?: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * 项目选项接口
 */
export interface ProjectOption {
  id: number
  name: string
  code: string
}

export const useDeviceTypeStore = defineStore('deviceType', () => {
  // 设备类型列表
  const deviceTypeList = ref<DeviceType[]>([])
  const loading = ref(false)

  // 项目列表
  const projectList = ref<ProjectOption[]>([])
  const projectListLoading = ref(false)

  /**
   * 获取设备类型列表
   */
  async function fetchList(params?: any) {
    loading.value = true
    try {
      const response = await http.get<any>('/device-types', {
        params: { page: 1, pageSize: 1000, ...params }
      })
      deviceTypeList.value = response.records || response.data || []
      return response
    } finally {
      loading.value = false
    }
  }

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

  return {
    deviceTypeList,
    loading,
    fetchList,
    projectList,
    projectListLoading,
    fetchProjectList
  }
})
