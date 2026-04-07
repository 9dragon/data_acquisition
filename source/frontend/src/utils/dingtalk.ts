/**
 * 钉钉SDK工具类
 */

import { dingtalkApi } from '@/api/dingtalk'

// 钉钉JSAPI加载状态
let isDingTalkReady = false
let readyResolve: ((value: boolean) => void) | null = null
let isConfigured = false
let configResolve: ((value: boolean) => void) | null = null

/**
 * 判断是否在钉钉环境中
 */
export function isDingTalk(): boolean {
  return /dingtalk/i.test(navigator.userAgent)
}

/**
 * 配置钉钉JSAPI权限
 * 必须在调用其他API之前配置
 */
export function configDingTalkJSAPI(): Promise<boolean> {
  return new Promise((resolve) => {
    if (isConfigured) {
      resolve(true)
      return
    }

    if (configResolve) {
      // 已经在配置中
      return
    }

    configResolve = resolve

    // 获取当前页面URL
    const url = window.location.href.split('#')[0]

    // 调用后端获取签名
    dingtalkApi.getJsApiSignature(url)
      .then(config => {
        // @ts-ignore
        if (window.dd && window.dd.config) {
          // @ts-ignore
          window.dd.config({
            agentId: config.agentId,
            corpId: config.corpId,
            timeStamp: config.timeStamp,
            nonceStr: config.nonceStr,
            signature: config.signature,
            type: 0,
            jsApiList: ['getLocation', 'device.geolocation.get'] // 需要使用的API列表
          })

          // @ts-ignore
          window.dd.ready(() => {
            console.log('✓ 钉钉JSAPI配置成功')
            isConfigured = true
            configResolve?.(true)
            configResolve = null
          })

          // @ts-ignore
          window.dd.error((err: any) => {
            console.error('✗ 钉钉JSAPI配置失败:', err)
            // 配置失败也继续，可能是权限问题
            configResolve?.(false)
            configResolve = null
          })
        } else {
          console.warn('dd.config不存在，跳过配置')
          configResolve?.(false)
          configResolve = null
        }
      })
      .catch(err => {
        console.error('获取签名配置失败:', err)
        configResolve?.(false)
        configResolve = null
      })
  })
}

/**
 * 加载钉钉JSAPI
 */
export function loadDingTalkJSAPI(): Promise<boolean> {
  return new Promise((resolve) => {
    if (isDingTalkReady) {
      resolve(true)
      return
    }

    if (readyResolve) {
      // 已经在加载中
      return
    }

    readyResolve = resolve

    const script = document.createElement('script')
    // 使用钉钉官方JSAPI，支持客户端内免登
    script.src = 'https://g.alicdn.com/dingding/dingtalk-jsapi/2.10.3/dingtalk.open.js'
    script.onload = () => {
      // JSAPI加载后需要等待ready
      // @ts-ignore
      if (window.dd && window.dd.ready) {
        // @ts-ignore
        window.dd.ready(() => {
          console.log('钉钉JSAPI已就绪')
          isDingTalkReady = true
          readyResolve?.(true)
          readyResolve = null
        })
        // @ts-ignore
        window.dd.error((err: any) => {
          console.error('钉钉JSAPI错误:', err)
          readyResolve?.(false)
          readyResolve = null
        })
      } else {
        isDingTalkReady = true
        readyResolve?.(true)
        readyResolve = null
      }
    }
    script.onerror = () => {
      console.error('钉钉JSAPI加载失败')
      readyResolve?.(false)
      readyResolve = null
    }
    document.head.appendChild(script)
  })
}

/**
 * 获取钉钉免登授权码
 */
export function getDingTalkAuthCode(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!isDingTalk()) {
      reject(new Error('不在钉钉环境中'))
      return
    }

    // @ts-ignore
    if (window.dd && window.dd.runtime) {
      // @ts-ignore
      window.dd.runtime.permission.requestAuthCode({
        corpId: import.meta.env.VITE_DINGTALK_CORP_ID || '',
        onSuccess: (result: any) => {
          resolve(result.code)
        },
        onFail: (error: any) => {
          reject(new Error(error.errorMessage))
        }
      })
    } else {
      reject(new Error('钉钉JSAPI未加载'))
    }
  })
}

/**
 * 位置信息接口
 */
export interface LocationInfo {
  latitude: number
  longitude: number
  address?: string
  province?: string
  city?: string
  district?: string
  street?: string
}

/**
 * 获取地理位置
 * 使用钉钉新版API dd.getLocation
 */
export function getLocation(): Promise<LocationInfo> {
  return new Promise((resolve, reject) => {
    if (!isDingTalk()) {
      reject(new Error('请在钉钉中打开应用'))
      return
    }

    // 首先加载JSAPI
    loadDingTalkJSAPI().then((loaded) => {
      if (!loaded) {
        reject(new Error('钉钉JSAPI加载失败'))
        return
      }

      // 然后配置权限（关键步骤！）
      configDingTalkJSAPI().then(() => {
        // 配置完成后获取位置
        getLocationWithDingTalk(resolve, reject)
      })
    })
  })
}

/**
 * 使用钉钉获取位置
 * 优先使用新版 dd.getLocation API
 */
function getLocationWithDingTalk(
  resolve: (value: LocationInfo) => void,
  reject: (reason: any) => void
) {
  // @ts-ignore
  const dd = window.dd
  if (!dd) {
    reject(new Error('钉钉SDK未加载'))
    return
  }

  // 打印dd对象结构用于调试
  console.log('=== 钉钉SDK调试信息 ===')
  console.log('dd对象存在:', !!dd)
  console.log('dd.ready存在:', typeof dd.ready === 'function')
  console.log('dd.getLocation存在:', typeof dd.getLocation === 'function')
  console.log('dd.device存在:', !!dd.device)
  if (dd.device) {
    console.log('dd.device.geolocation存在:', !!dd.device.geolocation)
    if (dd.device.geolocation) {
      console.log('dd.device.geolocation.get存在:', typeof dd.device.geolocation.get === 'function')
      console.log('dd.device.geolocation.getLocation存在:', typeof dd.device.geolocation.getLocation === 'function')
    }
  }
  console.log('====================')

  // 首先确保dd已经ready（必须步骤！）
  if (typeof dd.ready === 'function') {
    console.log('等待dd.ready回调...')
    dd.ready(() => {
      console.log('dd.ready回调触发，开始获取位置')
      attemptLocation(dd, resolve, reject)
    })
    dd.error((err: any) => {
      console.error('钉钉JSAPI错误:', err)
      reject(new Error('钉钉JSAPI初始化失败: ' + JSON.stringify(err)))
    })
  } else {
    // 没有ready方法，直接尝试
    console.warn('dd.ready不存在，直接尝试获取位置')
    attemptLocation(dd, resolve, reject)
  }
}

/**
 * 尝试使用不同的API路径获取位置
 * 优先使用新版 dd.getLocation API
 */
function attemptLocation(
  dd: any,
  resolve: (value: LocationInfo) => void,
  reject: (reason: any) => void
) {
  console.log('=== 开始尝试定位API ===')

  // 方法1: 优先使用新版 dd.getLocation API（官方推荐）
  if (typeof dd.getLocation === 'function') {
    console.log('✓ 使用新版 dd.getLocation API')
    dd.getLocation({
      // 目标精度，单位：米
      targetAccuracy: '200',
      // 缓存超时时间，单位：秒
      cacheTimeout: 20,
      // 坐标系类型：0=GPS坐标（WGS84），1=火星坐标（GCJ02），2=百度坐标（BD09）
      coordinate: '1',
      // 是否使用缓存
      useCache: true,
      // 是否进行逆地理编码（获取详细地址）
      withReGeocode: true,
      // 定位类型：0=粗略定位，1=精确定位，2=后台定位
      type: 1,
      success: (result: any) => {
        console.log('✓ 定位成功:', result)
        handleLocationSuccess(result, resolve)
      },
      fail: (error: any) => {
        console.error('✗ 定位失败:', error)
        handleLocationFail(error, reject)
      },
      complete: () => {
        console.log('定位请求完成')
      }
    })
    return
  }

  // 方法2: 尝试 dd.device.geolocation.getLocation
  if (dd.device?.geolocation?.getLocation) {
    console.log('✓ 使用 dd.device.geolocation.getLocation API')
    dd.device.geolocation.getLocation({
      targetAccuracy: '200',
      cacheTimeout: 20,
      coordinate: '1',
      useCache: true,
      withReGeocode: true,
      type: 1,
      success: (result: any) => {
        console.log('✓ 定位成功:', result)
        handleLocationSuccess(result, resolve)
      },
      fail: (error: any) => {
        console.error('✗ 定位失败:', error)
        handleLocationFail(error, reject)
      }
    })
    return
  }

  // 方法3: 降级使用旧的 dd.device.geolocation.get API（已废弃）
  if (dd.device?.geolocation?.get) {
    console.log('⚠ 使用旧版 dd.device.geolocation.get API（已废弃）')
    dd.device.geolocation.get({
      onSuccess: (result: any) => {
        console.log('✓ 定位成功:', result)
        handleLocationSuccess(result, resolve)
      },
      onFail: (error: any) => {
        console.error('✗ 定位失败:', error)
        handleLocationFail(error, reject)
      }
    })
    return
  }

  // 所有方法都不可用
  console.error('✗ 找不到任何可用的定位API')
  reject(new Error('找不到可用的定位API，请确认：\n1. 钉钉开发者后台已添加定位权限\n2. 钉钉客户端版本支持新版API'))
}

/**
 * 处理定位成功响应
 */
function handleLocationSuccess(result: any, resolve: (value: LocationInfo) => void) {
  console.log('钉钉定位成功:', result)

  const locationInfo: LocationInfo = {
    latitude: parseFloat(result.latitude) || 0,
    longitude: parseFloat(result.longitude) || 0
  }

  // 新API直接返回详细地址字段
  if (result.address) {
    locationInfo.address = result.address
  }
  if (result.province) {
    locationInfo.province = result.province
  }
  if (result.city) {
    locationInfo.city = result.city
  }
  if (result.district) {
    locationInfo.district = result.district
  }
  if (result.street) {
    locationInfo.street = result.street
  }

  // 兼容addressComponent格式（某些版本可能返回）
  if (result.addressComponent) {
    const ac = result.addressComponent
    locationInfo.province = locationInfo.province || ac.province
    locationInfo.city = locationInfo.city || ac.city
    locationInfo.district = locationInfo.district || ac.district
    locationInfo.street = locationInfo.street || ac.street
  }

  // 如果没有完整地址，尝试组合省市区
  if (!locationInfo.address && (locationInfo.province || locationInfo.city || locationInfo.district)) {
    const parts = []
    if (locationInfo.province) parts.push(locationInfo.province)
    if (locationInfo.city && locationInfo.city !== locationInfo.province) parts.push(locationInfo.city)
    if (locationInfo.district) parts.push(locationInfo.district)
    if (locationInfo.street) parts.push(locationInfo.street)
    locationInfo.address = parts.join('')
  }

  resolve(locationInfo)
}

/**
 * 处理定位失败响应
 */
function handleLocationFail(error: any, reject: (reason: any) => void) {
  console.error('钉钉定位失败:', error)
  let errorMsg = '定位失败'

  if (error?.errorMessage) {
    errorMsg = `定位失败: ${error.errorMessage}`
  } else if (error?.errorCode) {
    errorMsg = `定位失败: ${error.errorCode}`
  } else if (typeof error === 'string') {
    errorMsg = `定位失败: ${error}`
  }

  reject(new Error(errorMsg))
}

/**
 * 拍照或选择图片
 */
export function chooseImage(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!isDingTalk()) {
      // 非钉钉环境，使用文件选择
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.capture = 'environment'
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (event) => {
            resolve(event.target?.result as string)
          }
          reader.readAsDataURL(file)
        } else {
          reject(new Error('未选择文件'))
        }
      }
      input.click()
      return
    }

    // @ts-ignore
    if (window.dd && window.dd.device) {
      // @ts-ignore
      window.dd.device.camera.chooseImage({
        onSuccess: (result: any) => {
          // result.data[0] 包含图片信息
          resolve(result.data[0])
        },
        onFail: (error: any) => {
          reject(new Error(error.errorMessage))
        }
      })
    } else {
      reject(new Error('钉钉JSAPI未加载'))
    }
  })
}

/**
 * 预览图片
 */
export function previewImage(urls: string[], current?: string): void {
  if (!isDingTalk()) {
    // 非钉钉环境，简单处理
    console.log('预览图片:', urls, current)
    return
  }

  // @ts-ignore
  if (window.dd && window.dd.device) {
    // @ts-ignore
    window.dd.device.image.preview({
      urls: urls,
      current: current || urls[0]
    })
  }
}

/**
 * 显示提示
 */
export function showToast(message: string, duration = 2000): void {
  // @ts-ignore
  if (window.vant && window.vant.Toast) {
    // @ts-ignore
    window.vant.Toast({
      message,
      duration
    })
  } else {
    alert(message)
  }
}

/**
 * 显示加载提示
 */
export function showLoading(message = '加载中...'): void {
  // @ts-ignore
  if (window.vant && window.vant.Toast) {
    // @ts-ignore
    window.vant.Toast.loading({
      message,
      duration: 0,
      forbidClick: true
    })
  }
}

/**
 * 隐藏加载提示
 */
export function hideLoading(): void {
  // @ts-ignore
  if (window.vant && window.vant.Toast) {
    // @ts-ignore
    window.vant.Toast.clear()
  }
}
