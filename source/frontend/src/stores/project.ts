import { defineStore } from 'pinia'
import { ref } from 'vue'
import { http } from '@/api/request'
import type { Project } from '@/types/project'

export const useProjectStore = defineStore('project', () => {
  const projects = ref<Project[]>([])
  const projectList = ref<Project[]>([])
  const currentProject = ref<Project | null>(null)
  const loading = ref(false)

  async function fetchProjects(params?: any) {
    loading.value = true
    try {
      const response = await http.get<any>('/projects', { params })
      projects.value = response.records
      return response
    } finally {
      loading.value = false
    }
  }

  async function fetchProjectList() {
    loading.value = true
    try {
      const response = await http.get<any>('/projects', {
        params: { pageNum: 1, pageSize: 1000 }
      })
      projectList.value = response.records || []
      return response
    } finally {
      loading.value = false
    }
  }

  async function fetchProjectDetail(id: string) {
    loading.value = true
    try {
      const response = await http.get<any>(`/projects/${id}`)
      currentProject.value = response
      return response
    } finally {
      loading.value = false
    }
  }

  async function createProject(data: Partial<Project>) {
    const response = await http.post('/projects', data)
    return response
  }

  async function updateProject(id: string, data: Partial<Project>) {
    const response = await http.put(`/projects/${id}`, data)
    return response
  }

  async function deleteProject(id: string) {
    const response = await http.delete(`/projects/${id}`)
    return response
  }

  return {
    projects,
    projectList,
    currentProject,
    loading,
    fetchProjects,
    fetchProjectList,
    fetchProjectDetail,
    createProject,
    updateProject,
    deleteProject
  }
})
