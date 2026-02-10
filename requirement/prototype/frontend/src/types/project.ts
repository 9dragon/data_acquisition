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
}

export interface ProjectPlan extends BaseEntity {
  projectId: string;
  stage: ProjectStage;
  tasks: ProjectTask[];
  startDate: string;
  endDate: string;
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
