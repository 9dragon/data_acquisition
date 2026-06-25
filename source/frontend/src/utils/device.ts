/**
 * 设备检测工具
 * 用于检测用户设备类型（移动端/桌面端）
 */

/**
 * 移动设备关键词列表
 */
const MOBILE_KEYWORDS = [
  'Android',
  'webOS',
  'iPhone',
  'iPad',
  'iPod',
  'BlackBerry',
  'IEMobile',
  'Opera Mini',
  'HarmonyOS',
  'OpenHarmony',
  'Phone'
]

/**
 * 检测是否为移动设备
 * @returns 是否为移动设备
 */
export function isMobileDevice(): boolean {
  const ua = navigator.userAgent
  return MOBILE_KEYWORDS.some(keyword => ua.includes(keyword))
}

/**
 * 获取当前设备应跳转的默认路由
 * @returns 默认路由路径
 */
export function getDefaultRoute(): string {
  return isMobileDevice() ? '/mobile' : '/dashboard'
}
