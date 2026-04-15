import { http } from './request'

export interface MyStats {
  attendanceDays: number
  taskCount: number
  issueCount: number
}

export const mobileStatsApi = {
  getMyStats(): Promise<MyStats> {
    return http.get('/mobile/stats/my')
  }
}
