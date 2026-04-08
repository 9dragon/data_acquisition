/**
 * 钉钉SDK工具类
 */

import { dingtalkApi } from '@/api/dingtalk'
import * as dd from 'dingtalk-jsapi'

// 钉钉JSAPI配置状态
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
        dd.config({
          agentId: config.agentId,
          corpId: config.corpId,
          timeStamp: config.timeStamp,
          nonceStr: config.nonceStr,
          signature: config.signature,
          type: 0,
          jsApiList: ['getLocation', 'device.geolocation.get', 'biz.util.uploadImageFromCamera', 'biz.util.uploadImage']
        })

        dd.ready(() => {
          console.log('✓ 钉钉JSAPI配置成功')
          isConfigured = true
          configResolve?.(true)
          configResolve = null
        })

        dd.error((err: any) => {
          console.error('✗ 钉钉JSAPI配置失败:', err)
          configResolve?.(false)
          configResolve = null
        })
      })
      .catch(err => {
        console.error('获取签名配置失败:', err)
        configResolve?.(false)
        configResolve = null
      })
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

    // 配置权限
    configDingTalkJSAPI().then(() => {
      getLocationWithDingTalk(resolve, reject)
    })
  })
}

/**
 * 使用钉钉获取位置
 */
function getLocationWithDingTalk(
  resolve: (value: LocationInfo) => void,
  reject: (reason: any) => void
) {
  if (typeof dd.ready === 'function') {
    dd.ready(() => {
      attemptLocation(resolve, reject)
    })
    dd.error((err: any) => {
      reject(new Error('钉钉JSAPI初始化失败'))
    })
  } else {
    attemptLocation(resolve, reject)
  }
}

/**
 * 尝试使用不同的API路径获取位置
 */
function attemptLocation(
  resolve: (value: LocationInfo) => void,
  reject: (reason: any) => void
) {
  // 方法1: 使用新版 dd.getLocation API
  if (typeof dd.getLocation === 'function') {
    dd.getLocation({
      targetAccuracy: '200',
      cacheTimeout: 20,
      coordinate: '1',
      useCache: true,
      withReGeocode: true,
      type: 1,
      success: (result: any) => {
        resolve(handleLocationSuccess(result))
      },
      fail: (error: any) => {
        reject(handleLocationFail(error))
      }
    })
    return
  }

  // 方法2: 尝试 dd.device.geolocation.getLocation
  if ((dd as any).device?.geolocation?.getLocation) {
    (dd as any).device.geolocation.getLocation({
      targetAccuracy: '200',
      cacheTimeout: 20,
      coordinate: '1',
      useCache: true,
      withReGeocode: true,
      type: 1,
      success: (result: any) => {
        resolve(handleLocationSuccess(result))
      },
      fail: (error: any) => {
        reject(handleLocationFail(error))
      }
    })
    return
  }

  reject(new Error('找不到可用的定位API'))
}

/**
 * 处理定位成功响应
 */
function handleLocationSuccess(result: any): LocationInfo {
  const locationInfo: LocationInfo = {
    latitude: parseFloat(result.latitude) || 0,
    longitude: parseFloat(result.longitude) || 0
  }

  if (result.address) locationInfo.address = result.address
  if (result.province) locationInfo.province = result.province
  if (result.city) locationInfo.city = result.city
  if (result.district) locationInfo.district = result.district
  if (result.street) locationInfo.street = result.street

  if (result.addressComponent) {
    const ac = result.addressComponent
    locationInfo.province = locationInfo.province || ac.province
    locationInfo.city = locationInfo.city || ac.city
    locationInfo.district = locationInfo.district || ac.district
    locationInfo.street = locationInfo.street || ac.street
  }

  if (!locationInfo.address && (locationInfo.province || locationInfo.city || locationInfo.district)) {
    const parts = []
    if (locationInfo.province) parts.push(locationInfo.province)
    if (locationInfo.city && locationInfo.city !== locationInfo.province) parts.push(locationInfo.city)
    if (locationInfo.district) parts.push(locationInfo.district)
    if (locationInfo.street) parts.push(locationInfo.street)
    locationInfo.address = parts.join('')
  }

  return locationInfo
}

/**
 * 处理定位失败响应
 */
function handleLocationFail(error: any): Error {
  let errorMsg = '定位失败'
  if (error?.errorMessage) {
    errorMsg = `定位失败: ${error.errorMessage}`
  } else if (error?.errorCode) {
    errorMsg = `定位失败: ${error.errorCode}`
  }
  return new Error(errorMsg)
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

    // 配置权限
    configDingTalkJSAPI().then(() => {
      chooseImageWithDingTalk(resolve, reject)
    })
  })
}

/**
 * 使用钉钉拍照
 */
function chooseImageWithDingTalk(
  resolve: (value: string) => void,
  reject: (reason: any) => void
) {
  if (typeof dd.ready === 'function') {
    dd.ready(() => {
      attemptChooseImage(resolve, reject)
    })
    dd.error((err: any) => {
      reject(new Error('钉钉JSAPI初始化失败'))
    })
  } else {
    attemptChooseImage(resolve, reject)
  }
}

/**
 * 调用钉钉拍照API
 */
function attemptChooseImage(
  resolve: (value: string) => void,
  reject: (reason: any) => void
) {
  // 方法1: 使用 dd.biz.util.uploadImageFromCamera (直接拍照)
  if ((dd as any).biz?.util?.uploadImageFromCamera) {
    (dd as any).biz.util.uploadImageFromCamera({
      compression: true,
      onSuccess: (res: any) => {
        resolve(res.url || res.picUrl || res)
      },
      onFail: (err: any) => {
        reject(new Error(err.errorMessage || '拍照失败'))
      }
    })
    return
  }

  // 方法2: 使用 dd.biz.util.uploadImage (可以拍照或选择图片)
  if ((dd as any).biz?.util?.uploadImage) {
    (dd as any).biz.util.uploadImage({
      multiple: false,
      onSuccess: (res: any) => {
        if (res && res.length > 0) {
          resolve(res[0].url || res[0].picUrl || res[0])
        } else {
          resolve(res.url || res.picUrl || res)
        }
      },
      onFail: (err: any) => {
        reject(new Error(err.errorMessage || '选择图片失败'))
      }
    })
    return
  }

  reject(new Error('拍照API不可用'))
}

/**
 * 预览图片
 */
export function previewImage(urls: string[], current?: string): void {
  if (!isDingTalk()) {
    console.log('预览图片:', urls, current)
    return
  }

  if ((dd as any).device?.image?.preview) {
    (dd as any).device.image.preview({
      urls: urls,
      current: current || urls[0]
    })
  }
}

/**
 * 显示提示
 */
export function showToast(message: string, duration = 2000): void {
  if ((window as any).vant?.Toast) {
    (window as any).vant.Toast({ message, duration })
  } else {
    alert(message)
  }
}

/**
 * 显示加载提示
 */
export function showLoading(message = '加载中...'): void {
  if ((window as any).vant?.Toast) {
    (window as any).vant.Toast.loading({
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
  if ((window as any).vant?.Toast) {
    (window as any).vant.Toast.clear()
  }
}
