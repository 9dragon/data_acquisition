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
   * 统一返回JSON解析后的对象
   */
  getConfig: async (configKey: string): Promise<any> => {
    const value = await http.get(`/system/config/${configKey}`)
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    }
    return value
  },

  /**
   * 获取JSON配置，统一按JSON解析为对象
   */
  getConfigJson: async (configKey: string): Promise<any> => {
    return systemConfigApi.getConfig(configKey)
  },

  /**
   * 更新配置
   * 统一转换为JSON字符串存储
   */
  updateConfig: (configKey: string, configValue: any): Promise<void> => {
    const valueToSend = typeof configValue === 'string' ? configValue : JSON.stringify(configValue)
    return http.put(`/system/config/${configKey}`, { configValue: valueToSend })
  }
}
