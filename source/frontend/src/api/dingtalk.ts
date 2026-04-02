import { http } from './request'

/**
 * 钉钉免登认证请求
 */
export interface DingTalkAuthRequest {
  authCode: string
}

/**
 * 钉钉认证响应
 */
export interface DingTalkAuthResponse {
  token: string
  user: {
    id: string
    username: string
    name: string
    avatar?: string
  }
}

/**
 * 钉钉API
 */
export const dingtalkApi = {
  /**
   * 钉钉免登认证
   */
  auth: (data: DingTalkAuthRequest): Promise<DingTalkAuthResponse> => {
    return http.post('/dingtalk/auth', data)
  },

  /**
   * 同步用户
   */
  syncUsers: (): Promise<number> => {
    return http.post('/dingtalk/sync-users')
  },

  /**
   * 同步部门
   */
  syncDepartments: (): Promise<number> => {
    return http.post('/dingtalk/sync-depts')
  }
}
