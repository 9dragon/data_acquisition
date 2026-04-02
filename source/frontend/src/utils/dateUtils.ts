/**
 * 日期工具函数
 */

/**
 * 计算两个日期之间的天数差
 * @param date1 开始日期
 * @param date2 结束日期
 * @returns 天数差（负数表示date2在date1之前）
 */
export function daysBetween(date1: Date, date2: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24
  // 重置时间为0点，只比较日期
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate())
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate())
  return Math.floor((d2.getTime() - d1.getTime()) / msPerDay)
}

/**
 * 格式化日期为 YYYY-MM-DD 格式
 * @param date 日期对象或日期字符串
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 格式化日期时间为 YYYY-MM-DD HH:mm:ss 格式
 * @param date 日期对象或日期字符串
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * 判断任务是否延期
 * @param endDate 计划结束日期
 * @param status 任务状态
 * @param currentDate 当前日期（可选，默认为系统当前时间）
 * @returns 是否延期
 */
export function isTaskDelayed(
  endDate: string | Date,
  status: string,
  currentDate: Date = new Date()
): boolean {
  // 已完成的任务不算延期
  if (status === 'completed' || status === 'cancelled') {
    return false
  }
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate
  return currentDate > end
}

/**
 * 计算延期天数
 * @param endDate 计划结束日期
 * @param actualEndDate 实际结束日期（可选）
 * @param status 任务状态
 * @param currentDate 当前日期（可选）
 * @returns 延期天数（正数表示延期，0或负数表示未延期）
 */
export function calculateDelayDays(
  endDate: string | Date,
  actualEndDate?: string | Date,
  status?: string,
  currentDate: Date = new Date()
): number {
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate

  // 如果有实际完成时间，比较实际完成时间与计划时间
  if (actualEndDate) {
    const actual = typeof actualEndDate === 'string' ? new Date(actualEndDate) : actualEndDate
    return daysBetween(end, actual)
  }

  // 如果任务已完成但没有实际完成时间，假设按计划完成
  if (status === 'completed' || status === 'cancelled') {
    return 0
  }

  // 未完成的任务，比较当前时间与计划时间
  return daysBetween(end, currentDate)
}

/**
 * 获取日期范围
 * @param dates 日期数组
 * @returns 最早和最晚日期
 */
export function getDateRange(dates: Array<string | Date>): { min: Date; max: Date } {
  if (dates.length === 0) {
    const now = new Date()
    return {
      min: new Date(now.getFullYear(), now.getMonth(), 1),
      max: new Date(now.getFullYear(), now.getMonth() + 3, 0)
    }
  }

  const dateObjects = dates.map(d => typeof d === 'string' ? new Date(d) : d)
  const min = new Date(Math.min(...dateObjects.map(d => d.getTime())))
  const max = new Date(Math.max(...dateObjects.map(d => d.getTime())))

  return { min, max }
}

/**
 * 添加天数到日期
 * @param date 原始日期
 * @param days 要添加的天数
 * @returns 新日期
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * 判断日期是否在范围内
 * @param date 要判断的日期
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 是否在范围内
 */
export function isDateInRange(
  date: Date | string,
  startDate: Date | string,
  endDate: Date | string
): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate
  return d >= start && d <= end
}

/**
 * 计算两个日期区间之间的重叠天数
 * @param start1 第一个区间开始
 * @param end1 第一个区间结束
 * @param start2 第二个区间开始
 * @param end2 第二个区间结束
 * @returns 重叠天数
 */
export function getOverlapDays(
  start1: Date | string,
  end1: Date | string,
  start2: Date | string,
  end2: Date | string
): number {
  const s1 = typeof start1 === 'string' ? new Date(start1) : start1
  const e1 = typeof end1 === 'string' ? new Date(end1) : end1
  const s2 = typeof start2 === 'string' ? new Date(start2) : start2
  const e2 = typeof end2 === 'string' ? new Date(end2) : end2

  const overlapStart = s1 > s2 ? s1 : s2
  const overlapEnd = e1 < e2 ? e1 : e2

  if (overlapStart > overlapEnd) {
    return 0
  }

  return daysBetween(overlapStart, overlapEnd) + 1
}

/**
 * 获取日期的中文星期
 * @param date 日期
 * @returns 中文星期
 */
export function getChineseWeekday(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekdays[d.getDay()]
}

/**
 * 判断是否是工作日
 * @param date 日期
 * @returns 是否是工作日
 */
export function isWeekday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const day = d.getDay()
  return day > 0 && day < 6
}

/**
 * 计算工作日天数
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 工作日天数
 */
export function calculateWorkdays(startDate: Date | string, endDate: Date | string): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate

  let count = 0
  let current = new Date(start)

  while (current <= end) {
    if (isWeekday(current)) {
      count++
    }
    current = addDays(current, 1)
  }

  return count
}
