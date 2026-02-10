// 通用类型定义

export type StatusType = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface BaseEntity {
  id: string;
  createTime: string;
  updateTime: string;
  creator?: string;
  updater?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface FilterOption {
  label: string;
  value: string | number;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  phone?: string;
  role: string;
  avatar?: string;
  status: 'active' | 'inactive';
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createTime: string;
}

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}
