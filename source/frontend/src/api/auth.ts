import { http } from './request'
import type { UserInfo } from '@/stores/user'

/**
 * 登录请求参数
 */
export interface LoginRequest {
  username: string
  password: string
}

/**
 * 登录响应数据
 */
export interface LoginResponse {
  token: string
  user: UserInfo
}

/**
 * 用户信息响应
 */
export interface UserInfoResponse extends UserInfo {
  roles?: Array<{
    id: string
    code: string
    name: string
  }>
  permissions?: string[]
}

/**
 * 认证API
 */
export const authApi = {
  /**
   * 用户登录
   */
  login(data: LoginRequest): Promise<LoginResponse> {
    return http.post('/auth/login', data)
  },

  /**
   * 获取当前用户信息
   */
  getUserInfo(): Promise<UserInfoResponse> {
    return http.get('/auth/user-info')
  },

  /**
   * 用户登出
   */
  logout(): Promise<void> {
    return http.post('/auth/logout')
  }
}
