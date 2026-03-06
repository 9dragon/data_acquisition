import { BaseEntity, StatusType, User } from './common';

// 项目阶段（包含售前调研和验收）
export type ProjectStage =
  | 'presale'        // 售前调研
  | 'planning'       // 准备阶段（实施）
  | 'construction'   // 施工阶段（实施）
  | 'configuration'  // 配置阶段（实施）
  | 'verification'   // 核对阶段（实施）
  | 'acceptance'     // 验收阶段
  | 'completed';     // 已完成

// 阶段推进方式
export type StageProgressMode = 'by_task' | 'by_device';

// 阶段定义（全局）
export interface StageDefinition extends BaseEntity {
  key: string;              // 阶段唯一标识
  name: string;             // 阶段名称
  description: string;      // 阶段描述
  icon?: string;            // 图标（可选）
  color: string;            // 显示颜色
  progressMode: StageProgressMode;  // 推进方式
  isSystem: boolean;        // 是否系统内置
  defaultTasks?: string[];  // 默认任务列表（可选）
  defaultWeight?: number;   // 默认权重（0-100）
}

// 阶段任务完成情况
export interface StageTaskProgress {
  taskId: string;
  taskName: string;
  completed: boolean;
  completedDate?: string;
  remark?: string;
}

// 阶段设备完成情况
export interface StageDeviceProgress {
  deviceId: string;
  deviceName: string;
  completed: boolean;
  completedDate?: string;
  remark?: string;
}

// 项目采用阶段配置
export interface ProjectStageConfig {
  stageKey: string;         // 阶段定义的 key
  startDate?: string;       // 开始日期
  endDate?: string;         // 结束日期
  managerId?: string;       // 负责人
  participantIds?: string[]; // 参与人
  status?: 'not_started' | 'in_progress' | 'completed';
  weight: number;           // 阶段权重（0-100）
  actualProgress?: number;              // 阶段实际进度 0-100（自动计算）
  taskProgress?: StageTaskProgress[];   // 任务完成情况（by_task阶段）
  deviceProgress?: StageDeviceProgress[]; // 设备完成情况（by_device阶段）
  remark?: string;                      // 阶段说明
  lastReportDate?: string;              // 最后填报日期
}

// 项目状态
export type ProjectStatus = 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';

// 项目优先级
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Project extends BaseEntity {
  name: string;
  code: string;
  description?: string;
  stage: ProjectStage;
  status: ProjectStatus;
  priority: ProjectPriority;
  managerId: string;
  manager?: User;
  teamMembers: string[]; // 用户ID列表
  members?: User[];
  startDate: string;
  endDate?: string;
  plannedEndDate: string;
  progress: number; // 0-100
  deviceCount: number;
  completedDeviceCount: number;
  issueCount: number;
  documentCount: number;
  tags?: string[];
  stageConfigs: ProjectStageConfig[]; // 新增：采用的阶段配置列表
}

// 项目计划阶段配置
export interface ProjectPlanStage {
  stage: ProjectStage;      // 阶段类型
  startDate: string;        // 阶段开始日期
  endDate: string;          // 阶段结束日期
  managerId: string;        // 阶段负责人
  participantIds: string[]; // 阶段参与人
}

export interface ProjectPlan extends BaseEntity {
  projectId: string;
  name: string;              // 计划名称
  description?: string;      // 计划描述
  startDate: string;         // 计划开始日期
  endDate: string;           // 计划结束日期
  stages: ProjectPlanStage[]; // 包含的阶段列表
  tasks: ProjectTask[];      // 任务列表
}

export interface ProjectTask {
  id: string;
  name: string;
  description?: string;
  stage: ProjectStage;
  status: StatusType;
  startDate: string;
  endDate: string;
  progress: number;
  assignees: string[];
  dependencies?: string[]; // 依赖的任务ID
}

export interface ProjectStats {
  totalProjects: number;
  inProgressProjects: number;
  completedProjects: number;
  overdueProjects: number;
  totalDevices: number;
  completedDevices: number;
  totalIssues: number;
  resolvedIssues: number;
  criticalIssues: number;
}
