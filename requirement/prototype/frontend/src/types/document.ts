import { BaseEntity } from './common';

// 文档类型
export type DocumentCategory = 'requirement' | 'design' | 'manual' | 'test' | 'acceptance' | 'other';

// 文档状态
export type DocumentStatus = 'draft' | 'review' | 'approved' | 'rejected';

export interface Document extends BaseEntity {
  name: string;
  code: string;
  type: DocumentCategory;
  status: DocumentStatus;
  projectId: string;
  projectName?: string;
  deviceId?: string;
  deviceName?: string;
  version: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  tags: string[];
  description?: string;
  uploaderId: string;
  uploader?: string;
  reviewerId?: string;
  reviewer?: string;
  reviewComment?: string;
  downloadCount: number;
}

export interface DocumentTag extends BaseEntity {
  name: string;
  color: string;
  category?: string;
  isSystem: boolean; // 是否系统标签
  usageCount: number; // 使用次数
}

export interface DocumentFolder extends BaseEntity {
  name: string;
  projectId: string;
  parentId?: string;
  path: string;
  level: number;
  documentCount: number;
  children?: DocumentFolder[];
}
