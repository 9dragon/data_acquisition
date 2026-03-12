import { BaseEntity, StatusType, User } from './common';
import { MediaAttachment } from './device';

// ==================== 资料收集相关类型 ====================

// 文件类型枚举（支持所有常用类型）
export enum MaterialFileType {
  IMAGE = 'image',           // 图片：jpg, png, gif等
  VIDEO = 'video',           // 视频：mp4, mov等
  DOCUMENT = 'document',     // 文档：pdf, doc, docx等
  SPREADSHEET = 'spreadsheet', // 表格：xls, xlsx, csv等
  CAD = 'cad',               // CAD图纸：dwg, dxf等
  OTHER = 'other'            // 其他
}

// 资料需求定义
export interface MaterialRequirement {
  key: string;                    // 资料类型唯一标识，如 'before_install_photo'
  name: string;                   // 资料名称，如 '安装前照片'
  description?: string;           // 资料说明
  fileType: MaterialFileType;     // 文件类型
  required: boolean;              // 是否必填
  minCount?: number;              // 最少数量（用于照片等）
  maxCount?: number;              // 最多数量
  acceptTypes?: string[];         // 接受的文件MIME类型，如 ['image/jpeg', 'image/png']
}

// 已上传的资料信息
export interface TaskMaterial {
  requirementKey: string;         // 对应的资料需求key
  requirementName: string;        // 资料名称
  files: MediaAttachment[];       // 已上传的文件列表（复用现有类型）
  completed: boolean;             // 是否已完成（根据required和minCount判断）
  completedDate?: string;         // 完成日期
}

// 任务模板定义（用于阶段定义中）
export interface StageTaskTemplate {
  id: string;                     // 任务ID
  key: string;                    // 任务唯一标识
  name: string;                   // 任务名称，如 '设备安装'
  description?: string;           // 任务描述
  defaultWeight?: number;         // 默认权重（用于计算任务在阶段中的权重）
  materialRequirements: MaterialRequirement[];  // 该任务需要的资料列表
}

// 设备任务进度（按设备推进时的任务级进度）
export interface DeviceTaskProgress {
  deviceId: string;
  deviceName: string;
  taskId: string;
  taskKey: string;
  taskName: string;
  completed: boolean;
  completedDate?: string;
  remark?: string;
  materials?: TaskMaterial[];     // 资料收集
}

// ==================== 项目阶段相关类型 ====================

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

  // 新增：任务模板配置
  taskTemplates?: StageTaskTemplate[];  // 任务模板列表（用于按设备推进时的任务级填报）

  // 兼容旧字段（标记为废弃，保留以兼容现有数据）
  /** @deprecated 使用 taskTemplates 替代 */
  defaultTasks?: string[];  // 默认任务列表（可选）
  defaultWeight?: number;   // 默认权重（0-100）
}

// 阶段任务完成情况
export interface StageTaskProgress {
  taskId: string;
  taskKey?: string;          // 新增：任务唯一标识（用于关联任务模板）
  taskName: string;
  completed: boolean;
  completedDate?: string;
  remark?: string;
  materials?: TaskMaterial[];  // 新增：资料收集
}

// 阶段设备完成情况
export interface StageDeviceProgress {
  deviceId: string;
  deviceName: string;
  completed: boolean;
  completedDate?: string;
  remark?: string;
  taskProgress?: DeviceTaskProgress[];  // 新增：任务级进度（按设备推进时支持任务级填报）
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
