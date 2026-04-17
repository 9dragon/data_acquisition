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
  permissions: string[]
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
 * 菜单权限
 */
export interface MenuPermission {
  id: number
  code: string
  name: string
  path?: string
  parentId?: number | null
  type: string
  children?: MenuPermission[]
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
   * 获取当前用户菜单
   */
  getUserMenus(): Promise<MenuPermission[]> {
    return http.get('/auth/menus')
  },

  /**
   * 用户登出
   */
  logout(): Promise<void> {
    return http.post('/auth/logout')
  }
}
