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
  address?: string
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
  address?: string
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
  startDate?: string
  endDate?: string
  status?: string
  pageNum: number
  pageSize: number
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
   * 导出签到记录
   */
  export: (params: AttendanceQueryParams): Promise<Blob> => {
    return http.get('/attendance/export', { params, responseType: 'blob' })
  },

  /**
   * 获取今日签到统计
   */
  getTodayStats: (): Promise<TodayCheckInStats> => {
    return http.get('/attendance/today-stats')
  },

  /**
   * 获取签到配置
   */
  getConfig: (): Promise<AttendanceConfig> => {
    return http.get('/attendance/config')
  }
}
