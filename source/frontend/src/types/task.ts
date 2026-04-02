import type { MaterialRequirement } from '@/api/stage';

/**
 * 任务资料
 */
export interface TaskMaterial {
  key: string;
  name: string;
  url?: string;
  type?: string;
  uploadTime?: string;
}

/**
 * 任务卡片数据结构
 * 按任务类型聚合所有项目中相同任务的进度
 */
export interface TaskCardData {
  taskKey: string;              // 任务唯一标识
  taskName: string;             // 任务名称
  totalDeviceCount: number;     // 涉及设备总数
  completedDeviceCount: number; // 已完成设备数
  progress: number;             // 完成率 0-100
  projectGroups: ProjectDeviceGroup[];
  materialRequirements?: MaterialRequirement[];  // 资料需求
}

/**
 * 项目设备分组
 * 同一任务在不同项目中的设备分组
 */
export interface ProjectDeviceGroup {
  projectId: string;
  projectName: string;
  projectCode: string;
  stageKey: string;
  stageName: string;
  devices: DeviceTaskItem[];
}

/**
 * 设备任务项
 * 单个设备的任务完成状态
 */
export interface DeviceTaskItem {
  deviceId: string;
  deviceName: string;
  completed: boolean;
  completedDate?: string;
  remark?: string;
  materials?: any[];  // 资料收集数据
  taskId: string;     // 任务ID
}

/**
 * 任务列表筛选条件
 */
export interface TaskListFilter {
  searchText?: string;    // 搜索文本（设备名称）
  taskType?: string;      // 任务类型筛选
  projectIds?: string[];  // 项目筛选
  status?: 'all' | 'pending' | 'in_progress' | 'completed';  // 状态筛选
}

/**
 * 任务统计概览
 */
export interface TaskStatistics {
  totalTasks: number;       // 任务类型总数
  totalDevices: number;     // 涉及设备总数
  completedDevices: number; // 已完成设备数
  pendingTasks: number;     // 待处理任务数
  inProgressTasks: number;  // 进行中任务数
  completedTasks: number;   // 已完成任务数
}

/**
 * 设备任务列表行数据（每行一个设备的一个任务）
 * 用于列表视图，将项目→阶段→设备→任务扁平化
 */
export interface DeviceTaskListItem {
  key: string;              // 唯一标识: projectId-stageKey-deviceId-taskKey
  projectId: string;
  projectCode: string;
  projectName: string;
  stageKey: string;
  stageName: string;
  deviceId: string;
  deviceName: string;
  taskKey: string;
  taskName: string;
  completed: boolean;
  completedDate?: string;
  remark?: string;
  taskId: string;
  // 用于填报的额外数据
  materialRequirements?: MaterialRequirement[];
}

/**
 * 项目级任务列表项
 * 用于展示按任务推进的阶段任务（与设备无关）
 */
export interface ProjectTaskListItem {
  key: string;              // 唯一标识: projectId-stageKey-taskId
  projectId: string;
  projectCode: string;
  projectName: string;
  stageKey: string;
  stageName: string;
  taskId: string;
  taskName: string;
  taskKey: string;
  completed: boolean;
  completedDate?: string;
  remark?: string;
  materials?: TaskMaterial[];
  // 用于填报的额外数据
  materialRequirements?: MaterialRequirement[];
}

// ==================== 项目计划任务相关类型 ====================

/**
 * 任务状态
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

/**
 * 任务状态映射
 */
export const TaskStatusMap: Record<TaskStatus, { label: string; type: string }> = {
  pending: { label: '未开始', type: 'info' },
  in_progress: { label: '进行中', type: 'warning' },
  completed: { label: '已完成', type: 'success' },
  cancelled: { label: '已取消', type: 'danger' }
}

/**
 * 项目实施阶段
 */
export type ImplementationStage = 'preparation' | 'construction' | 'configuration' | 'verification'

/**
 * 实施阶段映射
 */
export const ImplementationStageMap: Record<ImplementationStage, { label: string; color: string }> = {
  preparation: { label: '准备阶段', color: '#409EFF' },
  construction: { label: '施工阶段', color: '#67C23A' },
  configuration: { label: '配置阶段', color: '#E6A23C' },
  verification: { label: '核对阶段', color: '#909399' }
}

/**
 * 项目计划任务实体
 */
export interface ProjectPlanTask {
  id: number
  projectId: number
  projectName?: string
  stageKey: ImplementationStage
  stageName?: string
  taskKey: string
  name: string
  description?: string
  status: TaskStatus
  startDate: string
  endDate: string
  actualStartDate?: string
  actualEndDate?: string
  progress: number
  assigneeIds?: string
  assigneeNames?: string
  dependencyIds?: string
  createdAt: string
  updatedAt: string
}

/**
 * 任务表单数据
 */
export interface ProjectPlanTaskFormData {
  id?: number
  projectId: number
  stageKey: ImplementationStage
  taskKey: string
  name: string
  description?: string
  status: TaskStatus
  startDate: string
  endDate: string
  progress: number
  assigneeIds?: number[]
  dependencyIds?: number[]
}

/**
 * 任务查询参数
 */
export interface ProjectPlanTaskQueryParams {
  pageNum: number
  pageSize: number
  projectId?: number
  stageKey?: ImplementationStage
  status?: TaskStatus
}

// ==================== 设备任务相关类型 ====================

/**
 * 多媒体附件
 */
export interface MediaAttachment {
  id: string
  name: string
  url: string
  type: 'image' | 'video'
  size?: number
  uploadTime?: string
}

/**
 * 任务资料收集项
 */
export interface TaskMaterialItem {
  requirementKey: string
  requirementName: string
  files: MediaAttachment[]
  completed: boolean
  completedDate?: string
}

/**
 * 设备任务实体
 */
export interface DeviceTask {
  id: number
  deviceId: number
  deviceName: string
  projectId: number
  projectName: string
  stageKey: string
  stageName: string
  taskKey: string
  taskName: string
  completed: boolean
  startDate?: string
  completedDate?: string
  remark?: string
  materials?: string  // JSON字符串
  materialsList?: TaskMaterialItem[]  // 解析后的资料列表
  managerId?: number
  managerName?: string
  participantIds?: string
  participantNames?: string
  createdBy?: number
  createdAt: string
  updatedBy?: number
  updatedAt: string
}

/**
 * 设备任务列表项（用于列表展示）
 */
export interface DeviceTaskListItem {
  key: string
  id: number
  projectId: number
  projectName: string
  stageKey: string
  stageName: string
  deviceId: number
  deviceName: string
  taskKey: string
  taskName: string
  completed: boolean
  completedDate?: string
  remark?: string
}

/**
 * 设备任务查询参数
 */
export interface DeviceTaskQueryParams {
  pageNum: number
  pageSize: number
  keyword?: string
  projectId?: number
  stageKey?: string
  completed?: boolean
  deviceId?: number
}

/**
 * 设备任务更新数据
 */
export interface DeviceTaskUpdateDTO {
  completed?: boolean
  startDate?: string
  completedDate?: string
  remark?: string
  materials?: TaskMaterialItem[]
}

/**
 * 项目任务更新数据
 */
export interface ProjectTaskUpdateDTO {
  status?: TaskStatus
  progress?: number
  actualStartDate?: string
  actualEndDate?: string
  remark?: string
}

/**
 * 项目级任务列表项（跨项目查询）
 */
export interface ProjectTaskListItem {
  key: string
  id: number
  projectId: number
  projectName?: string
  stageKey: string
  stageName?: string
  taskKey: string
  name: string
  status: TaskStatus
  startDate: string
  endDate: string
  progress: number
  completed: boolean
  actualStartDate?: string
  actualEndDate?: string
  managerId?: number
  managerName?: string
  participantIds?: string
  participantNames?: string
}

/**
 * 项目级任务查询参数（跨项目）
 */
export interface ProjectTaskQueryParams {
  pageNum: number
  pageSize: number
  keyword?: string
  status?: TaskStatus
  projectId?: number
}
