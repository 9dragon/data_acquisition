import { BaseEntity } from './common';

// 问题类型
export type IssueType = 'device' | 'plan' | 'technical' | 'resource' | 'other';

// 问题优先级
export type IssuePriority = 'low' | 'medium' | 'high' | 'urgent';

// 问题状态
export type IssueStatus = 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed' | 'reopened';

export interface Issue extends BaseEntity {
  title: string;
  code: string;
  type: IssueType;
  priority: IssuePriority;
  status: IssueStatus;
  description?: string;
  projectId: string;
  projectName?: string;
  deviceId?: string;
  deviceName?: string;
  reporterId: string;
  reporter?: string;
  assigneeId?: string;
  assignee?: string;
  ccUsers?: string[]; // 抄送人ID列表
  dueDate?: string;
  resolvedAt?: string;
  closedAt?: string;
  attachments?: IssueAttachment[];
  tags?: string[];
}

export interface IssueAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadTime: string;
  uploader: string;
}

export interface IssueComment {
  id: string;
  issueId: string;
  content: string;
  authorId: string;
  author?: string;
  attachments?: IssueAttachment[];
  createTime: string;
  isInternal?: boolean; // 是否内部评论
}

export interface IssueStatusHistory {
  id: string;
  issueId: string;
  fromStatus: IssueStatus;
  toStatus: IssueStatus;
  operatorId: string;
  operator?: string;
  remark?: string;
  createTime: string;
}

export interface IssueStats {
  total: number;
  open: number;
  assigned: number;
  inProgress: number;
  resolved: number;
  closed: number;
  byType: Record<IssueType, number>;
  byPriority: Record<IssuePriority, number>;
  avgResolutionTime: number; // 小时
}
