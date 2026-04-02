import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { planApi } from '@/api/plan'
import type {
  ProjectPlan,
  ProjectPlanFormData,
  PlanViewMode,
  StageComparison,
  GanttTaskItem,
  PlanStatistics,
  WarningInfo
} from '@/types/plan'
import type { ProjectPlanTask } from '@/types/task'
import {
  calculateStageComparison,
  calculatePlanStatistics
} from '@/utils/progressUtils'

export const usePlanStore = defineStore('plan', () => {
  const currentPlan = ref<ProjectPlan | null>(null)
  const plans = ref<ProjectPlan[]>([])
  const loading = ref(false)
  const viewMode = ref<PlanViewMode>('timeline')

  /**
   * 获取所有计划列表
   */
  async function fetchPlanList() {
    loading.value = true
    try {
      const response = await planApi.getPlanList()
      plans.value = response || []
      return response
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取项目完整计划
   */
  async function fetchProjectPlan(projectId: number) {
    loading.value = true
    try {
      // 获取项目完整计划（后端已返回阶段和任务数据）
      const planData = await planApi.getProjectPlan(projectId)

      // 确保 stages 和 tasks 是数组
      const stageList = Array.isArray(planData?.stages) ? planData.stages : []
      const taskList = Array.isArray(planData?.tasks) ? planData.tasks : []

      // 直接使用后端返回的数据
      const plan: ProjectPlan = {
        projectId,
        projectName: planData?.projectName || '',
        projectCode: planData?.projectCode || '',
        name: planData?.name || '',
        description: planData?.description,
        startDate: planData?.startDate,
        endDate: planData?.endDate,
        stages: stageList,
        tasks: taskList,
        id: planData?.id,
        createdAt: planData?.createdAt,
        updatedAt: planData?.updatedAt
      }

      currentPlan.value = plan
      return plan
    } catch (error) {
      console.error('获取项目计划失败:', error)
      // 失败时返回空计划结构
      currentPlan.value = {
        projectId,
        projectName: '未知项目',
        projectCode: '',
        name: '',
        stages: [],
        tasks: []
      }
      return currentPlan.value
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取所有项目计划
   */
  async function fetchProjectPlans() {
    loading.value = true
    try {
      const response = await planApi.getProjectPlans()
      plans.value = response || []
      return response
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建计划
   */
  async function createPlan(data: ProjectPlanFormData) {
    const response = await planApi.createPlan(data)
    return response
  }

  /**
   * 更新计划
   */
  async function updatePlan(id: number, data: Partial<ProjectPlanFormData>) {
    const response = await planApi.updatePlan(id, data)
    return response
  }

  /**
   * 删除计划
   */
  async function deletePlan(id: number) {
    const response = await planApi.deletePlan(id)
    return response
  }

  /**
   * 切换视图模式
   */
  function setViewMode(mode: PlanViewMode) {
    viewMode.value = mode
  }

  // ==================== 计算属性 ====================

  /**
   * 阶段对比数据（计划vs实际）
   */
  const stageComparisons = computed((): StageComparison[] => {
    if (!currentPlan.value) return []
    return currentPlan.value.stages.map(stage => calculateStageComparison(stage))
  })

  /**
   * 甘特图数据
   */
  const ganttData = computed((): GanttTaskItem[] => {
    if (!currentPlan.value) return []
    return currentPlan.value.tasks.map(task => {
      const stage = currentPlan.value!.stages.find(s => s.stageKey === task.stageKey)
      return {
        id: task.id,
        name: task.name,
        taskKey: task.taskKey,
        stageKey: task.stageKey,
        stageName: stage?.stageName || task.stageName || '',
        plannedStart: task.startDate,
        plannedEnd: task.endDate,
        // 使用后端返回的实际时间字段
        actualStart: task.actualStartDate,
        actualEnd: task.actualEndDate,
        status: task.status,
        progress: task.progress,
        delayDays: undefined,
        isDelayed: false,
        assigneeNames: task.assigneeNames
      }
    })
  })

  /**
   * 计划统计数据
   */
  const statistics = computed((): PlanStatistics | null => {
    if (!currentPlan.value) return null
    return calculatePlanStatistics(currentPlan.value)
  })

  /**
   * 预警信息
   */
  const warnings = computed((): WarningInfo[] => {
    return statistics.value?.warnings || []
  })

  /**
   * 按设备推进的阶段
   */
  const byDeviceStages = computed((): ProjectPlanStage[] => {
    if (!currentPlan.value) return []
    return currentPlan.value.stages.filter(s => s.progressMode === 'by_device')
  })

  /**
   * 按任务推进的阶段
   */
  const byTaskStages = computed((): ProjectPlanStage[] => {
    if (!currentPlan.value) return []
    return currentPlan.value.stages.filter(s => s.progressMode === 'by_task')
  })

  /**
   * 当前进行中的阶段
   */
  const currentStage = computed((): ProjectPlanStage | null => {
    if (!currentPlan.value) return null
    return currentPlan.value.stages.find(s =>
      s.tasks.some(t => t.status === 'in_progress')
    ) || null
  })

  return {
    currentPlan,
    plans,
    loading,
    viewMode,
    // 计算属性
    stageComparisons,
    ganttData,
    statistics,
    warnings,
    byDeviceStages,
    byTaskStages,
    currentStage,
    // 方法
    fetchPlanList,
    fetchProjectPlan,
    fetchProjectPlans,
    createPlan,
    updatePlan,
    deletePlan,
    setViewMode
  }
})
