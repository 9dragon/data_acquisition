import axios from 'axios'
import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { ApiResponse } from '@/types/common'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { isDingTalkFullScreen } from '@/utils/routerHelper'

// 401跳转锁，防止并发请求时重复跳转
let isRedirecting = false

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // Blob 类型响应（文件下载）直接返回
    if (response.config.responseType === 'blob') {
      return response.data
    }

    const { code, message, data } = response.data

    // 成功响应 - 直接返回业务数据
    if (code === 200) {
      return data
    }

    // 业务错误
    ElMessage.error(message || '请求失败')
    return Promise.reject(new Error(message || '请求失败'))
  },
  (error: AxiosError<ApiResponse>) => {
    const { response } = error

    if (response) {
      const { status, data } = response

      switch (status) {
        case 401:
          ElMessage.error('登录已过期，请重新登录')
          localStorage.removeItem('token')
          if (isRedirecting) break
          isRedirecting = true
          // 根据当前路径判断设备类型，跳转对应登录页
          if (window.location.pathname.startsWith('/mobile')) {
            const query: Record<string, string> = { redirect: window.location.pathname + window.location.search }
            if (isDingTalkFullScreen()) {
              query.dd_full_screen = 'true'
            }
            router.push({ path: '/mobile/login', query })
          } else {
            router.push({ path: '/login', query: { redirect: window.location.pathname + window.location.search } })
          }
          setTimeout(() => { isRedirecting = false }, 3000)
          break
        case 403:
          ElMessage.error('无权访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error(data?.message || '服务器错误')
          break
        default:
          ElMessage.error(data?.message || '请求失败')
      }
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }

    return Promise.reject(error)
  }
)

// 导出请求方法
export default request

// 通用请求方法封装
export const http = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return request.get(url, config)
  },

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return request.post(url, data, config)
  },

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return request.put(url, data, config)
  },

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return request.delete(url, config)
  }
}
