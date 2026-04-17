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

  getNextStatuses(id: number) {
    return http.get<string[]>(`/issues/${id}/next-statuses`)
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


