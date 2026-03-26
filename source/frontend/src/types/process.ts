import { BaseEntity } from './common';

/**
 * 工序（Process）类型定义
 * 用于售前调研阶段，按项目维护工序信息
 */
export interface Process extends BaseEntity {
  name: string;                      // 工序名称
  projectId: string;                 // 所属项目ID
  projectName?: string;              // 所属项目名称（冗余字段，便于显示）
  code?: string;                     // 工序编号（可选）
  description?: string;              // 工序描述
  sortOrder?: number;                // 排序序号
}
