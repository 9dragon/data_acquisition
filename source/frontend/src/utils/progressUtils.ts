/**
 * 进度计算工具函数
 */
import type { ProjectPlanStage, ProjectPlanTask, StageComparison, TaskComparison, PlanStatistics, WarningInfo, Milestone } from '@/types/plan'
import type { TaskStatus } from '@/types/task'
import { daysBetween, formatDate, calculateDelayDays, isTaskDelayed } from './dateUtils'

/**
 * 计算任务进度（基于状态）
 * @param task 任务
 * @returns 进度百分比 0-100
 */
export function calculateTaskProgress(task: ProjectPlanTask): number {
  switch (task.status) {
    case 'completed':
      return 100
    case 'in_progress':
      return task.progress || 50
    case 'cancelled':
      return 0
    case 'pending':
    default:
      return 0
  }
}

/**
 * 计算阶段进度
 * @param stage 阶段
 * @returns 进度百分比 0-100
 */
export function calculateStageProgress(stage: ProjectPlanStage): number {
  const taskCount = stage.taskCount || 0
  if (taskCount === 0) return 0

  // 如果有明确的进度值，直接使用
  if (stage.progress !== undefined) {
    return stage.progress
  }

  // 否则根据任务状态计算
  const tasks = stage.tasks || []
  if (tasks.length === 0) return 0

  const totalProgress = tasks.reduce((sum, task) => sum + calculateTaskProgress(task), 0)
  return Math.round(totalProgress / taskCount)
}

/**
 * 计算整体进度（基于阶段权重）
 * @param stages 阶段列表
 * @returns 进度百分比 0-100
 */
export function calculateOverallProgress(stages: ProjectPlanStage[]): number {
  if (stages.length === 0) return 0

  // 计算总权重
  const totalWeight = stages.reduce((sum, stage) => sum + (stage.defaultWeight || 0), 0)

  if (totalWeight === 0) {
    // 如果没有权重，简单平均
    const totalProgress = stages.reduce((sum, stage) => sum + calculateStageProgress(stage), 0)
    return Math.round(totalProgress / stages.length)
  }

  // 按权重加权平均
  const weightedProgress = stages.reduce((sum, stage) => {
    const weight = stage.defaultWeight || 0
    const progress = calculateStageProgress(stage)
    return sum + (progress * weight / totalWeight)
  }, 0)

  return Math.round(weightedProgress)
}

/**
 * 计算阶段实际起止时间（基于任务）
 * @param stage 阶段
 * @returns 实际起止时间
 */
export function calculateStageActualTime(stage: ProjectPlanStage): {
  actualStart?: string
  actualEnd?: string
} {
  const tasks = stage.tasks || []
  if (tasks.length === 0) {
    return {}
  }

  // 获取有开始时间的任务（非pending状态）
  const startedTasks = tasks.filter(t => t.status !== 'pending')
  if (startedTasks.length === 0) {
    return {}
  }

  // 最早开始时间
  const actualStart = startedTasks
    .map(t => new Date(t.startDate))
    .sort((a, b) => a.getTime() - b.getTime())[0]

  // 最晚结束时间（只统计已完成的任务）
  const completedTasks = tasks.filter(t => t.status === 'completed')
  let actualEnd: Date | null = null

  if (completedTasks.length > 0) {
    actualEnd = completedTasks
      .map(t => new Date(t.endDate))
      .sort((a, b) => b.getTime() - a.getTime())[0]
  }

  return {
    actualStart: formatDate(actualStart),
    actualEnd: actualEnd ? formatDate(actualEnd) : undefined
  }
}

/**
 * 计算任务对比数据
 * @param task 任务
 * @param stageName 阶段名称
 * @returns 任务对比数据
 */
export function calculateTaskComparison(
  task: ProjectPlanTask,
  stageName: string
): TaskComparison {
  const delayDays = calculateDelayDays(task.endDate, undefined, task.status)
  const isDelayed = delayDays > 0

  return {
    id: task.id,
    taskKey: task.taskKey,
    name: task.name,
    stageKey: task.stageKey,
    stageName: stageName || task.stageName || '',
    plannedStart: task.startDate,
    plannedEnd: task.endDate,
    actualStart: task.status !== 'pending' ? task.startDate : undefined,
    actualEnd: task.status === 'completed' ? task.endDate : undefined,
    status: task.status,
    progress: calculateTaskProgress(task),
    delayDays: delayDays > 0 ? delayDays : undefined,
    isDelayed,
    assigneeNames: task.assigneeNames
  }
}

/**
 * 计算阶段对比数据
 * @param stage 阶段
 * @returns 阶段对比数据
 */
export function calculateStageComparison(stage: ProjectPlanStage): StageComparison {
  // 确保 tasks 是数组
  const stageTasks = stage.tasks || []

  // 计算实际时间：优先使用后端提供的字段，否则从任务计算
  let actualStart = stage.actualStartDate
  let actualEnd = stage.actualEndDate
  if (!actualStart || !actualEnd) {
    const calculated = calculateStageActualTime(stage)
    actualStart = actualStart || calculated.actualStart
    actualEnd = actualEnd || calculated.actualEnd
  }

  // 计算任务对比
  const tasks = stageTasks.map(task =>
    calculateTaskComparison(task, stage.stageName)
  )

  // 计算阶段延期
  const delayDays = calculateStageDelayDays(stage, actualEnd)
  const isDelayed = delayDays > 0

  // 判断阶段状态
  const status = calculateStageStatus(stage, delayDays)

  // 任务统计
  const totalTasks = stage.taskCount || 0
  const completedTasks = stage.completedTaskCount || 0
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length
  const pendingTasks = tasks.filter(t => t.status === 'pending').length

  return {
    stageKey: stage.stageKey,
    stageName: stage.stageName,
    description: stage.description,
    color: stage.color,
    icon: stage.icon,
    progressMode: stage.progressMode,
    // 计划日期（从 stagesJson 配置）
    plannedStart: stage.startDate || '',
    plannedEnd: stage.endDate || '',
    // 实际日期（从任务计算）
    actualStart,
    actualEnd,
    status,
    progress: calculateStageProgress(stage),
    delayDays: delayDays > 0 ? delayDays : undefined,
    isDelayed,
    totalTasks,
    completedTasks,
    inProgressTasks,
    pendingTasks,
    tasks
  }
}

/**
 * 计算阶段延期天数
 * @param stage 阶段
 * @param actualEnd 实际结束时间
 * @returns 延期天数
 */
function calculateStageDelayDays(stage: ProjectPlanStage, actualEnd?: string): number {
  if (!stage.endDate) return 0
  if (!actualEnd) return 0

  const plannedEnd = new Date(stage.endDate)
  const actual = new Date(actualEnd)
  return daysBetween(plannedEnd, actual)
}

/**
 * 计算阶段状态
 * @param stage 阶段
 * @param delayDays 延期天数
 * @returns 阶段状态
 */
function calculateStageStatus(
  stage: ProjectPlanStage,
  delayDays: number
): 'pending' | 'in_progress' | 'completed' | 'delayed' {
  const taskCount = stage.taskCount || 0
  const completedCount = stage.completedTaskCount || 0

  if (completedCount === taskCount && taskCount > 0) {
    return 'completed'
  }

  if (delayDays > 0) {
    return 'delayed'
  }

  const tasks = stage.tasks || []
  if (tasks.some(t => t.status === 'in_progress')) {
    return 'in_progress'
  }

  return 'pending'
}

/**
 * 计算计划统计数据
 * @param plan 项目计划
 * @returns 统计数据
 */
export function calculatePlanStatistics(plan: {
  startDate?: string
  endDate?: string
  stages: ProjectPlanStage[]
  tasks: ProjectPlanTask[]
}): PlanStatistics {
  const { startDate, endDate, stages, tasks } = plan

  // 确保数组存在
  const stageList = stages || []
  const taskList = tasks || []

  // 任务统计
  const totalTasks = taskList.length
  const completedTasks = taskList.filter(t => t.status === 'completed').length
  const inProgressTasks = taskList.filter(t => t.status === 'in_progress').length
  const pendingTasks = taskList.filter(t => t.status === 'pending').length
  const cancelledTasks = taskList.filter(t => t.status === 'cancelled').length

  // 阶段统计
  const totalStages = stageList.length
  const completedStages = stageList.filter(s => {
    const taskCount = s.taskCount || 0
    const completedCount = s.completedTaskCount || 0
    return completedCount === taskCount && taskCount > 0
  }).length
  const inProgressStages = stageList.filter(s => {
    const sTasks = s.tasks || []
    return sTasks.some(t => t.status === 'in_progress')
  }).length
  const pendingStages = totalStages - completedStages - inProgressStages

  // 进度
  const overallProgress = calculateOverallProgress(stageList)

  // 时间计算
  const now = new Date()
  const start = startDate ? new Date(startDate) : now
  const end = endDate ? new Date(endDate) : now
  const totalDays = Math.max(0, daysBetween(start, end) + 1)
  const remainingDays = Math.max(0, daysBetween(now, end) + 1)
  const isOverdue = now > end

  // 预警信息
  const warnings = calculateWarnings(taskList, stageList)

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    pendingTasks,
    cancelledTasks,
    totalStages,
    completedStages,
    inProgressStages,
    pendingStages,
    overallProgress,
    startDate: formatDate(start),
    endDate: formatDate(end),
    totalDays,
    remainingDays,
    isOverdue,
    warnings
  }
}

/**
 * 计算预警信息
 * @param tasks 任务列表
 * @param stages 阶段列表
 * @returns 预警信息列表
 */
export function calculateWarnings(
  tasks: ProjectPlanTask[],
  stages: ProjectPlanStage[]
): WarningInfo[] {
  const warnings: WarningInfo[] = []

  if (!tasks || tasks.length === 0) {
    return warnings
  }

  const now = new Date()

  // 任务预警
  tasks.forEach(task => {
    if (!task.endDate) return

    const daysUntilDue = daysBetween(now, new Date(task.endDate))

    // 已延期
    if (daysUntilDue < 0 && task.status !== 'completed') {
      warnings.push({
        id: `task-${task.id}-delayed`,
        type: 'delayed',
        level: 'error',
        message: `任务"${task.name}"已延期${Math.abs(daysUntilDue)}天`,
        taskId: task.id,
        stageKey: task.stageKey,
        days: Math.abs(daysUntilDue)
      })
    }
    // 即将到期（3天内）
    else if (daysUntilDue >= 0 && daysUntilDue <= 3 && task.status !== 'completed') {
      warnings.push({
        id: `task-${task.id}-risk`,
        type: 'risk',
        level: 'warning',
        message: `任务"${task.name}"即将到期（${daysUntilDue}天）`,
        taskId: task.id,
        stageKey: task.stageKey,
        days: daysUntilDue
      })
    }
  })

  return warnings
}

/**
 * 计算阶段权重总和
 * @param stages 阶段列表
 * @returns 权重总和
 */
export function calculateTotalWeight(stages: ProjectPlanStage[]): number {
  return stages.reduce((sum, stage) => sum + (stage.defaultWeight || 0), 0)
}

/**
 * 验证权重总和是否为100
 * @param stages 阶段列表
 * @returns 是否有效
 */
export function validateWeights(stages: ProjectPlanStage[]): boolean {
  const totalWeight = calculateTotalWeight(stages)
  return totalWeight === 100
}
