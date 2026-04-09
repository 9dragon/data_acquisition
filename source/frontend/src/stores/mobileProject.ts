import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { http } from '@/api/request'

export interface MobileProject {
  id: number
  name: string
  code: string
}

export const useMobileProjectStore = defineStore('mobileProject', () => {
  const projectList = ref<MobileProject[]>([])
  const currentProject = ref<MobileProject | null>(null)
  const loading = ref(false)

  const hasProject = computed(() => !!currentProject.value)

  async function fetchProjects() {
    loading.value = true
    try {
      const response = await http.get<any>('/projects', {
        params: { pageNum: 1, pageSize: 100 }
      })
      projectList.value = response.records?.map((item: any) => ({
        id: item.id,
        name: item.name,
        code: item.code
      })) || []
      return projectList.value
    } finally {
      loading.value = false
    }
  }

  async function fetchCurrentProject() {
    const response = await http.get<any>('/users/current-project')
    if (response) {
      currentProject.value = {
        id: response.id,
        name: response.name,
        code: response.code
      }
      localStorage.setItem('mobile_current_project', JSON.stringify(currentProject.value))
    }
    return currentProject.value
  }

  async function setCurrentProject(project: MobileProject) {
    await http.post('/users/current-project', { projectId: project.id })
    currentProject.value = project
    localStorage.setItem('mobile_current_project', JSON.stringify(project))
  }

  function loadCurrentProject() {
    const stored = localStorage.getItem('mobile_current_project')
    if (stored) {
      try {
        currentProject.value = JSON.parse(stored)
      } catch {
        currentProject.value = null
      }
    }
  }

  function clearCurrentProject() {
    currentProject.value = null
    localStorage.removeItem('mobile_current_project')
  }

  return {
    projectList,
    currentProject,
    loading,
    hasProject,
    fetchProjects,
    fetchCurrentProject,
    setCurrentProject,
    loadCurrentProject,
    clearCurrentProject
  }
})