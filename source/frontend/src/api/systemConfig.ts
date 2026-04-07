import { http } from './request'

/**
 * 系统配置
 */
export interface SystemConfig {
  id: number
  configKey: string
  configValue: string
  configType: string
  description: string
  category: string
  isSystem: number
}

/**
 * 系统配置API
 */
export const systemConfigApi = {
  /**
   * 获取分类下的所有配置
   */
  getConfigsByCategory: (category: string): Promise<SystemConfig[]> => {
    return http.get(`/system/config/category/${category}`)
  },

  /**
   * 获取单个配置
   */
  getConfig: (configKey: string): Promise<any> => {
    return http.get(`/system/config/${configKey}`)
  },

  /**
   * 更新配置
   */
  updateConfig: (configKey: string, configValue: string): Promise<void> => {
    return http.put(`/system/config/${configKey}`, { configValue })
  }
}
