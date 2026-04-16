import { http } from './request'
import type { Issue, IssueComment, IssueStatusHistory, IssueStats } from '@/types/issue'
import type { PaginationResponse } from '@/types/common'

export interface IssueQueryParams {
  pageNum: number
  pageSize: number
  keyword?: string
  projectId?: number
  deviceId?: number
  type?: string
  priority?: string
  status?: string
  reporterId?: number
  assigneeId?: number
  sortField?: string
  sortOrder?: string
}

export interface IssueCreateParams {
  title: string
  type: string
  priority: string
  description?: string
  projectId: number
  deviceId?: number
  assigneeId?: number
  ccUserIds?: number[]
  dueDate?: string
}

export const issueApi = {
  page(params: IssueQueryParams) {
    return http.get<PaginationResponse<Issue>>('/issues', { params })
  },

  getById(id: number) {
    return http.get<Issue>(`/issues/${id}`)
  },

  create(params: IssueCreateParams, reporterId: number = 1) {
    return http.post<Issue>(`/issues?reporterId=${reporterId}`, params)
  },

  update(id: number, params: Partial<Issue>) {
    return http.put<Issue>(`/issues/${id}`, params)
  },

  delete(id: number) {
    return http.delete<void>(`/issues/${id}`)
  },

  assign(id: number, assigneeId: number, operatorId: number = 1) {
    return http.post<Issue>(`/issues/${id}/assign?assigneeId=${assigneeId}&operatorId=${operatorId}`)
  },

  updateStatus(id: number, status: string, operatorId: number = 1, remark?: string) {
    return http.put<Issue>(`/issues/${id}/status?status=${status}&operatorId=${operatorId}&remark=${remark || ''}`)
  },

  addComment(id: number, content: string, authorId: number = 1, isInternal: boolean = false) {
    return http.post<IssueComment>(`/issues/${id}/comments?content=${encodeURIComponent(content)}&authorId=${authorId}&isInternal=${isInternal}`)
  },

  getComments(id: number) {
    return http.get<IssueComment[]>(`/issues/${id}/comments`)
  },

  getHistory(id: number) {
    return http.get<IssueStatusHistory[]>(`/issues/${id}/history`)
  },

  myTodo(userId: number) {
    return http.get<Issue[]>(`/issues/my/todo?userId=${userId}`)
  },

  myReported(userId: number) {
    return http.get<Issue[]>(`/issues/my/reported?userId=${userId}`)
  },

  myCc(userId: number) {
    return http.get<Issue[]>(`/issues/my/cc?userId=${userId}`)
  },

  getStats() {
    return http.get<IssueStats>('/issues/stats')
  }
}

// ==================== 移动端问题API ====================

/**
 * 问题状态
 */
export type IssueStatus = 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed'

/**
 * 问题优先级
 */
export type IssuePriority = 'low' | 'medium' | 'high' | 'urgent'

/**
 * 移动端问题
 */
export interface MobileIssue {
  id: number
  code: string
  title: string
  type: string
  priority: IssuePriority
  status: IssueStatus
  description?: string
  projectId: number
  projectName?: string
  deviceId?: number
  deviceName?: string
  reporterId: number
  reporterName?: string
  assigneeId?: number
  assigneeName?: string
  dueDate?: string
  resolvedAt?: string
  closedAt?: string
  createdAt: string
  updatedAt?: string
}

/**
 * 问题上报请求
 */
export interface IssueReportRequest {
  title: string
  type: string
  priority: IssuePriority
  description?: string
  projectId: number
  deviceId?: number
  photos?: string[]
  location?: string
  latitude?: number
  longitude?: number
  address?: string
}

/**
 * 移动端问题API
 */
export const mobileIssueApi = {
  /**
   * 获取我的问题列表
   */
  myList: (params: { status?: IssueStatus; projectId?: number; pageNum: number; pageSize: number }): Promise<{ records: MobileIssue[]; total: number }> => {
    return http.get('/mobile/issues/my', { params })
  },

  /**
   * 获取问题详情
   */
  detail: (id: number): Promise<MobileIssue> => {
    return http.get(`/mobile/issues/${id}`)
  },

  /**
   * 上报问题
   */
  report: (data: IssueReportRequest): Promise<MobileIssue> => {
    return http.post('/mobile/issues/report', data)
  },

  /**
   * 上传问题照片
   */
  uploadPhoto: (file: File): Promise<{ url: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    return http.post('/mobile/issues/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

