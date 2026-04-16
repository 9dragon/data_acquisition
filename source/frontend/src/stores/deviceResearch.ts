import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { deviceResearchApi } from '@/api/deviceResearch'
import type { DeviceResearch } from '@/types/device'

const LAST_WORKSHOP_KEY = 'last_selected_workshop'

function loadLastWorkshop() {
  try {
    const saved = localStorage.getItem(LAST_WORKSHOP_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

function saveLastWorkshop(workshop: { workshopId: string; workshopName: string } | null) {
  try {
    if (workshop) {
      localStorage.setItem(LAST_WORKSHOP_KEY, JSON.stringify(workshop))
    } else {
      localStorage.removeItem(LAST_WORKSHOP_KEY)
    }
  } catch {
    // ignore
  }
}

export const useDeviceResearchStore = defineStore('deviceResearch', () => {
  // 状态
  const researchList = ref<DeviceResearch[]>([])
  const currentResearch = ref<DeviceResearch | null>(null)
  const loading = ref(false)
  const lastSelectedWorkshop = ref<{ workshopId: string; workshopName: string } | null>(loadLastWorkshop())

  // 计算属性
  const researchCount = computed(() => researchList.value.length)

  /**
   * 获取调研列表
   */
  async function fetchList(params?: any) {
    loading.value = true
    try {
      const result = await deviceResearchApi.getList(params)
      researchList.value = result
      return result
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取调研详情
   */
  async function fetchById(id: number) {
    loading.value = true
    try {
      currentResearch.value = await deviceResearchApi.getById(id)
      return currentResearch.value
    } finally {
      loading.value = false
    }
  }

  /**
   * 根据设备ID获取调研
   */
  async function fetchByDeviceId(deviceId: number) {
    loading.value = true
    try {
      currentResearch.value = await deviceResearchApi.getByDeviceId(deviceId)
      return currentResearch.value
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建调研
   */
  async function create(data: Partial<DeviceResearch>) {
    const result = await deviceResearchApi.create(data)
    researchList.value.push(result)
    return result
  }

  /**
   * 更新基础信息
   */
  async function updateBasic(id: number, data: any) {
    await deviceResearchApi.updateBasic(id, data)
    if (currentResearch.value?.id === String(id)) {
      currentResearch.value.basic = { ...currentResearch.value.basic, ...data }
      currentResearch.value.basicCompleted = true
      updateProgress()
    }
  }

  /**
   * 更新控制器信息
   */
  async function updateController(id: number, data: any) {
    await deviceResearchApi.updateController(id, data)
    if (currentResearch.value?.id === String(id)) {
      currentResearch.value.controller = { ...currentResearch.value.controller, ...data }
      currentResearch.value.controllerCompleted = true
      updateProgress()
    }
  }

  /**
   * 更新采集信息
   */
  async function updateCollection(id: number, data: any) {
    await deviceResearchApi.updateCollection(id, data)
    if (currentResearch.value?.id === String(id)) {
      currentResearch.value.collection = { ...currentResearch.value.collection, ...data }
      currentResearch.value.collectionCompleted = true
      updateProgress()
    }
  }

  /**
   * 计算调研进度
   */
  function calculateProgress(research: DeviceResearch): number {
    const sections = [
      research.basicCompleted,
      research.controllerCompleted,
      research.collectionCompleted
    ]
    const completed = sections.filter(Boolean).length
    return Math.round((completed / 3) * 100)
  }

  /**
   * 更新当前调研进度
   */
  function updateProgress() {
    if (currentResearch.value) {
      currentResearch.value.researchProgress = calculateProgress(currentResearch.value)
    }
  }

  /**
   * 删除调研
   */
  async function remove(id: number) {
    await deviceResearchApi.delete(id)
    const index = researchList.value.findIndex(r => r.id === String(id))
    if (index > -1) {
      researchList.value.splice(index, 1)
    }
    if (currentResearch.value?.id === String(id)) {
      currentResearch.value = null
    }
  }

  /**
   * 重置当前调研
   */
  function resetCurrent() {
    currentResearch.value = null
  }

  /**
   * 设置当前调研
   */
  function setCurrent(research: DeviceResearch | null) {
    currentResearch.value = research
  }

  function setLastSelectedWorkshop(workshop: { workshopId: string; workshopName: string } | null) {
    lastSelectedWorkshop.value = workshop
    saveLastWorkshop(workshop)
  }

  return {
    researchList,
    currentResearch,
    loading,
    researchCount,
    lastSelectedWorkshop,
    fetchList,
    fetchById,
    fetchByDeviceId,
    create,
    updateBasic,
    updateController,
    updateCollection,
    calculateProgress,
    remove,
    resetCurrent,
    setCurrent,
    setLastSelectedWorkshop
  }
})
