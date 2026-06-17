import type { BaseEntity } from './common';

// ==================== 项目阶段相关类型 ====================

// 项目阶段（包含售前调研和验收）
export type ProjectStage =
  | 'presale'        // 售前调研
  | 'preparation'    // 准备阶段（实施）
  | 'construction'   // 施工阶段（实施）
  | 'configuration'  // 配置阶段（实施）
  | 'verification'   // 核对阶段（实施）
  | 'acceptance'     // 验收阶段
  | 'completed';     // 已完成

// 项目状态：0=未开始, 1=进行中, 2=暂停, 3=已完成, 4=已取消
export type ProjectStatus = 0 | 1 | 2 | 3 | 4;

// 项目优先级：0=低, 1=中, 2=高, 3=紧急
export type ProjectPriority = 0 | 1 | 2 | 3;

// 项目实体（与后端保持一致）
export interface Project extends BaseEntity {
  name: string;
  code: string;
  description?: string;
  stage?: ProjectStage;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  managerId?: number;
  managerName?: string;
  managerUserId?: number;
  teamMembers?: string;
  progress?: number;
  startDate?: string;
  endDate?: string;
  plannedEndDate?: string;
  deviceCount?: number;
  completedDeviceCount?: number;
  issueCount?: number;
  documentCount?: number;
  tags?: string;
  stageConfigs?: string;
}

// 项目查询参数
export interface ProjectQueryParams {
  pageNum: number;
  pageSize: number;
  name?: string;
  code?: string;
  status?: ProjectStatus;
  stage?: ProjectStage;
  keyword?: string;
}
