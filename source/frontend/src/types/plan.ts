import type { ProjectPlanTask } from './task'

/**
 * 项目计划
 * 包含项目的完整实施计划信息
 */
export interface ProjectPlan {
  id?: number
  projectId: number
  projectName: string
  projectCode: string
  name: string
  description?: string
  startDate?: string
  endDate?: string
  stages: ProjectPlanStage[]
  tasks: ProjectPlanTask[]
  stagesJson?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * 阶段任务配置
 */
export interface StageTaskConfig {
  key: string                  // 任务唯一标识
  name: string                 // 任务名称
  description?: string         // 任务描述
  enabled: boolean             // 是否启用
  startDate?: string           // 任务开始日期
  endDate?: string             // 任务结束日期
  managerId?: number           // 任务负责人ID
  participantIds?: number[]    // 任务参与人ID列表
}

/**
 * 项目计划阶段配置
 */
export interface StageConfig {
  stageKey: string
  startDate: string
  endDate: string
  managerId?: number
  participantIds?: number[]
  // 新增字段
  weight?: number              // 阶段权重
  tasks?: StageTaskConfig[]    // 任务配置列表
  deviceIds?: number[]         // 设备ID列表（仅by_device阶段）
}

/**
 * 项目计划表单数据
 */
export interface ProjectPlanFormData {
  id?: number
  projectId: number
  name: string
  description?: string
  startDate: string
  endDate: string
  stages: StageConfig[]
}

/**
 * 项目计划阶段
 * 项目实施阶段的计划配置
 */
export interface ProjectPlanStage {
  stageKey: string
  stageName: string
  description?: string
  color: string
  icon?: string
  // 计划日期
  startDate?: string
  endDate?: string
  // 实际日期（从任务计算）
  actualStartDate?: string
  actualEndDate?: string
  progressMode: 'by_task' | 'by_device'
  defaultWeight?: number
  taskCount: number
  completedTaskCount: number
  progress: number
  tasks: ProjectPlanTask[]
}

/**
 * 项目计划视图模式
 */
export type PlanViewMode = 'timeline' | 'gantt'

/**
 * 阶段任务统计
 */
export interface StageTaskStats {
  stageKey: string
  stageName: string
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  pendingTasks: number
  progress: number
}

/**
 * 项目计划查询参数
 */
export interface ProjectPlanQueryParams {
  projectId: number
  includeStages?: boolean
  includeTasks?: boolean
}

// ==================== 计划vs实际对比相关类型 ====================

/**
 * 任务对比数据
 */
export interface TaskComparison {
  id: number
  taskKey: string
  name: string
  stageKey: string
  stageName: string
  // 计划时间
  plannedStart: string
  plannedEnd: string
  // 实际时间
  actualStart?: string
  actualEnd?: string
  // 状态
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  progress: number
  // 延期信息
  delayDays?: number
  isDelayed: boolean
  // 负责人
  assigneeNames?: string
}

/**
 * 阶段对比数据
 */
export interface StageComparison {
  stageKey: string
  stageName: string
  description?: string
  color: string
  icon?: string
  progressMode: 'by_task' | 'by_device'
  // 计划时间
  plannedStart: string
  plannedEnd: string
  // 实际时间（基于任务计算）
  actualStart?: string
  actualEnd?: string
  // 状态
  status: 'pending' | 'in_progress' | 'completed' | 'delayed'
  progress: number
  // 延期信息
  delayDays?: number
  isDelayed: boolean
  // 任务统计
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  pendingTasks: number
  // 任务列表
  tasks: TaskComparison[]
}

/**
 * 预警信息
 */
export interface WarningInfo {
  id: string
  type: 'delayed' | 'risk' | 'resource'
  level: 'error' | 'warning' | 'info'
  message: string
  taskId?: number
  stageKey?: string
  days?: number
}

/**
 * 计划统计数据
 */
export interface PlanStatistics {
  // 任务统计
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  pendingTasks: number
  cancelledTasks: number
  // 阶段统计
  totalStages: number
  completedStages: number
  inProgressStages: number
  pendingStages: number
  // 进度
  overallProgress: number
  // 时间
  startDate: string
  endDate: string
  totalDays: number
  remainingDays: number
  isOverdue: boolean
  // 预警
  warnings: WarningInfo[]
}

// ==================== 甘特图相关类型 ====================

/**
 * 甘特图任务项
 */
export interface GanttTaskItem {
  id: number
  name: string
  taskKey: string
  stageKey: string
  stageName: string
  // 计划时间
  plannedStart: string
  plannedEnd: string
  // 实际时间
  actualStart?: string
  actualEnd?: string
  // 状态
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  progress: number
  // 延期
  delayDays?: number
  isDelayed: boolean
  // 负责人
  assigneeNames?: string
}
