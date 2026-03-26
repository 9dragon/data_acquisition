import { MaterialRequirement } from './project';
import { TaskMaterial } from './project';

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
