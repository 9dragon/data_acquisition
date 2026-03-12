import { BaseEntity } from './common';

/**
 * 车间（Workshop）类型定义
 */
export interface Workshop extends BaseEntity {
  name: string;                      // 车间名称
  projectId: string;                 // 所属项目ID
  projectName?: string;              // 所属项目名称（冗余字段，便于显示）
  description?: string;              // 车间描述
  sortOrder?: number;                // 排序序号
}
