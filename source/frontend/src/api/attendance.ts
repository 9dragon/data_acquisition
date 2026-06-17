import { http } from './request'

/**
 * 签到请求
 */
export interface CheckInRequest {
  projectId: number
  photo?: string
  latitude?: number
  longitude?: number
  location?: string
  remark?: string
}

/**
 * 签到记录
 */
export interface AttendanceRecord {
  id: number
  projectId: number
  userId: number
  userName: string
  checkInTime: string
  photoUrl?: string
  location?: string
  latitude?: number
  longitude?: number
  status: 'NORMAL' | 'LATE'
  remark?: string
  createTime: string
  shiftIndex?: number
  shiftName?: string
  isLate?: number
  originalPhotoUrl?: string
  watermarkPhotoUrl?: string
}

/**
 * 时段信息
 */
export interface ShiftInfo {
  index: number
  name: string
  startTime: string
  endTime: string
  lateTime: string
  checked?: boolean
  checkInTime?: string
  isCurrent?: boolean
}

/**
 * 今日签到统计
 */
export interface TodayCheckInStats {
  totalShifts: number
  checkedShifts: number
  remainingShifts: number
  records: AttendanceRecord[]
  pendingShifts: ShiftInfo[]
  currentShift: ShiftInfo | null
}

/**
 * 签到配置
 */
export interface AttendanceConfig {
  dailyTimes: number
  shifts: ShiftConfig[]
}

/**
 * 时段配置
 */
export interface ShiftConfig {
  name: string
  startTime: string
  endTime: string
  lateTime: string
}

/**
 * 签到查询参数
 */
export interface AttendanceQueryParams {
  projectId?: number
  userId?: number
  userName?: string
  startDate?: string
  endDate?: string
  status?: string
  pageNum: number
  pageSize: number
}

/**
 * 项目经理视角 - 项目概览
 */
export interface ProjectOverview {
  projectId: number
  projectName: string
  projectCode?: string
  totalMembers: number
  checkedInMembers: number
  pendingMembers: number
  lateMembers: number
  checkInRate: number
}

/**
 * 最新签到流水条目
 */
export interface RecentCheckIn {
  recordId: number
  projectId: number
  projectName?: string
  userId: number
  userName: string
  checkInTime: string
  shiftName?: string
  status: 'NORMAL' | 'LATE'
  location?: string
  photoUrl?: string
}

/**
 * 当前班次信息
 */
export interface CurrentShiftInfo {
  index: number
  name: string
  startTime: string
  endTime: string
  lateTime?: string
  isCurrent: boolean
}

/**
 * 项目经理视角 - 总览
 */
export interface ManagerOverview {
  isManager: boolean
  projects: ProjectOverview[]
  recentCheckIns: RecentCheckIn[]
  aggregate: {
    totalProjects: number
    totalMembers: number
    checkedInMembers: number
    pendingMembers: number
    lateMembers: number
  }
  currentShift: CurrentShiftInfo | null
}

/**
 * 成员今日签到状态
 */
export interface MemberStatus {
  userId: number
  userName: string
  phone?: string
  role: 'MANAGER' | 'MEMBER'
  checkedIn: boolean
  hasLate: boolean
  checkedShifts: number
  status: 'CHECKED' | 'PENDING' | 'LATE'
  firstCheckInTime?: string
  lastCheckInTime?: string
  records: Array<{
    id: number
    shiftIndex?: number
    shiftName?: string
    checkInTime: string
    status: 'NORMAL' | 'LATE'
    location?: string
    photoUrl?: string
  }>
}

/**
 * 分页响应
 */
export interface PageResponse<T> {
  records: T[]
  total: number
  current: number
  size: number
}

/**
 * 签到API
 */
export const attendanceApi = {
  /**
   * 签到打卡
   */
  checkIn: (data: CheckInRequest): Promise<AttendanceRecord> => {
    return http.post('/attendance/check-in', data)
  },

  /**
   * 我的签到记录
   */
  myRecords: (params: AttendanceQueryParams): Promise<PageResponse<AttendanceRecord>> => {
    return http.get('/attendance/my-records', { params })
  },

  /**
   * 签到记录列表
   */
  list: (params: AttendanceQueryParams): Promise<PageResponse<AttendanceRecord>> => {
    return http.get('/attendance/list', { params })
  },

  /**
   * 签到详情
   */
  detail: (id: number): Promise<AttendanceRecord> => {
    return http.get(`/attendance/${id}`)
  },

  /**
   * 删除签到记录
   */
  delete: (id: number): Promise<void> => {
    return http.delete(`/attendance/${id}`)
  },

  /**
   * 创建签到记录
   */
  create: (data: Partial<AttendanceRecord>): Promise<AttendanceRecord> => {
    return http.post('/attendance/create', data)
  },

  /**
   * 导出签到记录
   */
  export: (params: AttendanceQueryParams): Promise<Blob> => {
    return http.get('/attendance/export', { params, responseType: 'blob' })
  },

  /**
   * 获取今日签到统计
   */
  getTodayStats: (projectId?: number): Promise<TodayCheckInStats> => {
    return http.get('/attendance/today-stats', { params: { projectId } })
  },

  /**
   * 获取签到配置
   */
  getConfig: (): Promise<AttendanceConfig> => {
    return http.get('/attendance/config')
  },

  /**
   * 判断当前用户是否是任意项目的项目经理
   */
  isManager: (): Promise<boolean> => {
    return http.get('/attendance/manager/has-projects')
  },

  /**
   * 项目经理名下所有项目的今日签到概览
   */
  managerOverview: (): Promise<ManagerOverview> => {
    return http.get('/attendance/manager/overview')
  },

  /**
   * 项目经理名下项目下拉列表
   */
  managerProjects: (): Promise<Array<{ id: number; name: string }>> => {
    return http.get('/attendance/manager/projects')
  },

  /**
   * 项目经理查看指定项目成员的今日签到明细
   */
  managerMembersStatus: (projectId: number): Promise<MemberStatus[]> => {
    return http.get(`/attendance/manager/project/${projectId}/members-status`)
  }
}
