import type { BaseEntity } from './common';

export type IssueType = 'device' | 'plan' | 'technical' | 'resource' | 'other';

export type IssuePriority = 'low' | 'medium' | 'high' | 'urgent';

export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Issue extends BaseEntity {
  title: string;
  code: string;
  type: IssueType;
  priority: IssuePriority;
  status: IssueStatus;
  description?: string;
  projectId: number;
  projectName?: string;
  deviceId?: number;
  deviceName?: string;
  reporterId: number;
  reporterName?: string;
  assigneeId?: number;
  assigneeName?: string;
  ccUsers?: string;
  dueDate?: string;
  resolvedAt?: string;
  closedAt?: string;
  closedReason?: string;
  attachments?: IssueAttachment[];
}

export interface IssueAttachment {
  id: number;
  name: string;
  url: string;
  size: number;
  fileType?: string;
  uploaderId?: number;
  uploaderName?: string;
  uploadTime?: string;
}

export interface IssueComment {
  id: number;
  issueId: number;
  content: string;
  authorId: number;
  authorName?: string;
  attachments?: IssueAttachment[];
  createTime: string;
  createdAt?: string;
  isInternal?: boolean;
}

export interface IssueStatusHistory {
  id: number;
  issueId: number;
  fromStatus?: IssueStatus;
  toStatus: IssueStatus;
  operatorId: number;
  operatorName?: string;
  remark?: string;
  createTime: string;
  createdAt?: string;
}

export interface IssueStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  avgResolutionTime?: number;
}

export const ISSUE_TYPE_OPTIONS = [
  { label: '设备问题', value: 'device' },
  { label: '计划问题', value: 'plan' },
  { label: '技术问题', value: 'technical' },
  { label: '资源问题', value: 'resource' },
  { label: '其他问题', value: 'other' }
];

export const ISSUE_PRIORITY_OPTIONS = [
  { label: '低', value: 'low' },
  { label: '中', value: 'medium' },
  { label: '高', value: 'high' },
  { label: '紧急', value: 'urgent' }
];

export const ISSUE_STATUS_OPTIONS = [
  { label: '待处理', value: 'open' },
  { label: '处理中', value: 'in_progress' },
  { label: '已解决', value: 'resolved' },
  { label: '已关闭', value: 'closed' }
];
