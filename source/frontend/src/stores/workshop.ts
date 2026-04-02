import { defineStore } from 'pinia'
import { ref } from 'vue'
import { http } from '@/api/request'

export interface Workshop {
  id: number
  name: string
  code: string
  projectId?: number
  projectName?: string
  description?: string
  sortOrder?: number
  createdAt?: string
  updatedAt?: string
}

export const useWorkshopStore = defineStore('workshop', () => {
  const workshopList = ref<Workshop[]>([])
  const loading = ref(false)

  async function fetchList(params?: any) {
    loading.value = true
    try {
      const response = await http.get<any>('/workshops', {
        params: { pageNum: 1, pageSize: 1000, ...params }
      })
      workshopList.value = response.records || []
      return response
    } finally {
      loading.value = false
    }
  }

  async function getById(id: string) {
    const response = await http.get<Workshop>(`/workshops/${id}`)
    return response
  }

  async function create(data: Partial<Workshop>) {
    const response = await http.post('/workshops', data)
    return response
  }

  async function update(id: string, data: Partial<Workshop>) {
    const response = await http.put(`/workshops/${id}`, data)
    return response
  }

  async function remove(id: string) {
    const response = await http.delete(`/workshops/${id}`)
    return response
  }

  return {
    workshopList,
    loading,
    fetchList,
    getById,
    create,
    update,
    remove
  }
})
