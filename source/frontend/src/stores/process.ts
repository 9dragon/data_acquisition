import { defineStore } from 'pinia'
import { ref } from 'vue'
import { http } from '@/api/request'

export interface Process {
  id: string
  name: string
  code?: string
  projectId?: string
  projectName?: string
  description?: string
  sortOrder?: number
  createdAt?: string
  updatedAt?: string
}

export const useProcessStore = defineStore('process', () => {
  const processList = ref<Process[]>([])
  const loading = ref(false)

  async function fetchList(params?: any) {
    loading.value = true
    try {
      const response = await http.get<any>('/processes', { params })
      processList.value = response.records || []
      return response
    } finally {
      loading.value = false
    }
  }

  async function getById(id: string) {
    const response = await http.get<Process>(`/processes/${id}`)
    return response
  }

  async function create(data: Partial<Process>) {
    const response = await http.post('/processes', data)
    return response
  }

  async function update(id: string, data: Partial<Process>) {
    const response = await http.put(`/processes/${id}`, data)
    return response
  }

  async function remove(id: string) {
    const response = await http.delete(`/processes/${id}`)
    return response
  }

  return {
    processList,
    loading,
    fetchList,
    getById,
    create,
    update,
    remove
  }
})
