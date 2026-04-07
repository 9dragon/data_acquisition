import type { Router, RouteLocationRaw, NavigationHookOptions } from 'vue-router'

/**
 * 检查是否在钉钉全屏模式
 */
export function isDingTalkFullScreen(): boolean {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('dd_full_screen') === 'true'
}

/**
 * 带全屏参数的导航
 * @param router Vue Router实例
 * @param location 目标位置
 * @param options 导航选项
 */
export function navigateWithFullScreen(
  router: Router,
  location: RouteLocationRaw,
  options?: NavigationHookOptions
): Promise<any> {
  if (!isDingTalkFullScreen()) {
    return router.push(location, options)
  }

  let targetLocation: RouteLocationRaw = location

  if (typeof location === 'string') {
    const url = new URL(location, window.location.origin)
    url.searchParams.set('dd_full_screen', 'true')
    targetLocation = url.pathname + url.search
  } else if (typeof location === 'object' && location.path) {
    targetLocation = {
      ...location,
      query: { ...(location.query || {}), dd_full_screen: 'true' }
    }
  }

  return router.push(targetLocation, options)
}
