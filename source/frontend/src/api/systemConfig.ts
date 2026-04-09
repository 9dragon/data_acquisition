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
   * @returns 配置值，可能是字符串或解析后的对象（如果是JSON且成功解析）
   */
  getConfig: (configKey: string): Promise<any> => {
    return http.get(`/system/config/${configKey}`)
  },

  /**
   * 获取JSON配置，自动解析为对象
   */
  getConfigJson: async (configKey: string): Promise<any> => {
    const value = await http.get(`/system/config/${configKey}`)
    // 如果是字符串，尝试解析JSON
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch (error) {
        console.error(`解析配置 ${configKey} 失败:`, error)
        throw new Error(`配置 ${configKey} 不是有效的JSON格式`)
      }
    }
    // 如果不是字符串，直接返回
    return value
  },

  /**
   * 更新配置
   * @param configKey 配置键
   * @param configValue 配置值，可以是字符串或对象。如果是对象会自动转为JSON字符串。
   */
  updateConfig: (configKey: string, configValue: any): Promise<void> => {
    // 如果configValue不是字符串，转换为JSON字符串
    const valueToSend = typeof configValue === 'string' ? configValue : JSON.stringify(configValue)
    return http.put(`/system/config/${configKey}`, { configValue: valueToSend })
  }
}
