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
          jsApiList: [
  'getLocation',
  'device.geolocation.get',
  'chooseImage',           // 新版拍照API
  'chooseMedia',           // 新版媒体选择API
  'biz.util.uploadImageFromCamera', // 保留：兼容旧版
  'biz.util.uploadImage',          // 保留：兼容旧版
	  'biz.util.previewImage'           // 图片预览API
]
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
 * 钉钉环境使用 dd.getLocation，非钉钉环境使用浏览器原生 Geolocation API
 */
export function getLocation(): Promise<LocationInfo> {
  return new Promise((resolve, reject) => {
    if (!isDingTalk()) {
      // 非钉钉环境，使用浏览器原生定位
      getLocationWithBrowser(resolve, reject)
      return
    }

    // 钉钉环境
    configDingTalkJSAPI().then(() => {
      getLocationWithDingTalk(resolve, reject)
    })
  })
}

/**
 * 使用浏览器原生API获取位置
 */
function getLocationWithBrowser(
  resolve: (value: LocationInfo) => void,
  reject: (reason: any) => void
) {
  if (!navigator.geolocation) {
    reject(new Error('浏览器不支持定位功能，请使用Chrome或Safari'))
    return
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const locationInfo: LocationInfo = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        address: ''
      }

      // 调用后端逆地理编码获取地址
      try {
        const { reverseGeocode } = await import('@/api/amap')
        const addressInfo = await reverseGeocode(locationInfo.latitude, locationInfo.longitude)
        if (addressInfo.address) locationInfo.address = addressInfo.address
        if (addressInfo.province) locationInfo.province = addressInfo.province
        if (addressInfo.city) locationInfo.city = addressInfo.city
        if (addressInfo.district) locationInfo.district = addressInfo.district
        if (addressInfo.street) locationInfo.street = addressInfo.street
      } catch (e) {
        console.warn('逆地理编码失败，仅使用经纬度', e)
      }

      resolve(locationInfo)
    },
    (error) => {
      let msg = '定位失败'
      switch (error.code) {
        case error.PERMISSION_DENIED:
          msg = '定位权限被拒绝，请在浏览器设置中允许定位'
          break
        case error.POSITION_UNAVAILABLE:
          msg = '无法获取位置信息'
          break
        case error.TIMEOUT:
          msg = '定位超时，请重试'
          break
      }
      reject(new Error(msg))
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
  )
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
 * 拍照
 * @param facingMode 摄像头方向：'user' 前置（默认），'environment' 后置
 */
export function chooseImage(facingMode: 'user' | 'environment' = 'user'): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!isDingTalk()) {
      // 非钉钉环境，使用文件选择调起系统相机
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.capture = facingMode
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
      chooseImageWithDingTalk(facingMode, resolve, reject)
    })
  })
}

/**
 * 使用钉钉拍照
 */
function chooseImageWithDingTalk(
  facingMode: 'user' | 'environment',
  resolve: (value: string) => void,
  reject: (reason: any) => void
) {
  if (typeof dd.ready === 'function') {
    dd.ready(() => {
      attemptChooseImage(facingMode, resolve, reject)
    })
    dd.error((err: any) => {
      reject(new Error('钉钉JSAPI初始化失败'))
    })
  } else {
    attemptChooseImage(facingMode, resolve, reject)
  }
}

/**
 * 调用钉钉拍照API
 */
function attemptChooseImage(
  facingMode: 'user' | 'environment',
  resolve: (value: string) => void,
  reject: (reason: any) => void
) {
  // 使用新版 dd.chooseImage API (dingtalk-jsapi 3.0.27+)
  if (typeof dd.chooseImage === 'function') {
    dd.chooseImage({
      sourceType: ['camera'], // 仅拍照，不包括相册
      defaultCameraMode: facingMode === 'user' ? 'front' : 'back',
      success: (res: any) => {
        // 新版API返回格式：{ filePaths: string[], files: Object[] }
        const imageUrl = res.filePaths?.[0] || res.url || res.picUrl || res
        resolve(imageUrl)
      },
      fail: (err: any) => {
        reject(new Error(err.errorMessage || '拍照失败'))
      }
    })
    return
  }

  // 降级方案：尝试旧版API uploadImageFromCamera
  if ((dd as any).biz?.util?.uploadImageFromCamera) {
    (dd as any).biz.util.uploadImageFromCamera({
      compression: true,
      onSuccess: (res: any) => {
        const imageUrl = res.url || res.picUrl || res
        resolve(imageUrl)
      },
      onFail: (err: any) => {
        reject(new Error(err.errorMessage || '拍照失败'))
      }
    })
    return
  }

  // 降级方案：尝试旧版API uploadImage
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

  if ((dd as any).biz?.util?.previewImage) {
    (dd as any).biz.util.previewImage({
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

/**
 * 媒体选择选项
 */
export interface MediaOption {
  multiple?: boolean;       // 是否多选，默认 true
  max?: number;             // 最多选择数量
  type?: ('image' | 'video')[];  // 媒体类型，默认 ['image', 'video']
}

/**
 * 媒体选择结果
 */
export interface MediaResult {
  type: 'image' | 'video';  // 媒体类型
  url: string;              // 媒体路径
  name?: string;            // 文件名
  size?: number;            // 文件大小
}

/**
 * 选择图片或视频（支持拍照、录像、相册选择）
 * 使用钉钉 dd.chooseMedia API
 */
export function chooseMedia(option?: MediaOption): Promise<MediaResult[]> {
  return new Promise((resolve, reject) => {
    if (!isDingTalk()) {
      // 非钉钉环境，使用文件选择
      const input = document.createElement('input')
      input.type = 'file'
      input.multiple = option?.multiple !== false
      const types = option?.type || ['image', 'video']
      if (types.length === 1 && types[0] === 'image') {
        input.accept = 'image/*'
      } else if (types.length === 1 && types[0] === 'video') {
        input.accept = 'video/*'
      } else {
        input.accept = 'image/*,video/*'
      }
      input.onchange = (e) => {
        const files = (e.target as HTMLInputElement).files
        if (files && files.length > 0) {
          const results: MediaResult[] = []
          let processed = 0
          
          Array.from(files).forEach((file) => {
            const isVideo = file.type.startsWith('video')
            const reader = new FileReader()
            reader.onload = (event) => {
              results.push({
                type: isVideo ? 'video' : 'image',
                url: event.target?.result as string,
                name: file.name,
                size: file.size
              })
              processed++
              if (processed === files.length) {
                resolve(results)
              }
            }
            reader.readAsDataURL(file)
          })
        } else {
          reject(new Error('未选择文件'))
        }
      }
      input.click()
      return
    }

    // 钉钉环境
    configDingTalkJSAPI().then(() => {
      chooseMediaWithDingTalk(option, resolve, reject)
    }).catch(reject)
  })
}

/**
 * 使用钉钉选择媒体
 */
function chooseMediaWithDingTalk(
  option: MediaOption | undefined,
  resolve: (value: MediaResult[]) => void,
  reject: (reason: any) => void
) {
  const handleReady = () => {
    attemptChooseMedia(option, resolve, reject)
  }

  if (typeof dd.ready === 'function') {
    dd.ready(() => {
      handleReady()
    })
    dd.error((err: any) => {
      reject(new Error('钉钉JSAPI初始化失败'))
    })
  } else {
    handleReady()
  }
}

/**
 * 调用钉钉媒体选择API
 */
function attemptChooseMedia(
  option: MediaOption | undefined,
  resolve: (value: MediaResult[]) => void,
  reject: (reason: any) => void
) {
  const multiple = option?.multiple !== false
  const max = option?.max || 9
  const types = option?.type || ['image', 'video']

  // 转换为钉钉 API 需要的格式
  const mediaType = types.length === 1 && types[0] === 'video' ? 2 : 1 // 1: 图片, 2: 视频

  // 使用新版 dd.chooseMedia API
  if (typeof dd.chooseMedia === 'function') {
    dd.chooseMedia({
      count: multiple ? max : 1,
      mediaType: mediaType, // 1: 图片, 2: 视频, 3: 图片和视频
      type: mediaType,
      success: (res: any) => {
        // 新版API返回格式: { results: [{ mediaId, thumbPath, type, name, size }] }
        const results: MediaResult[] = []
        
        if (res.results && Array.isArray(res.results)) {
          res.results.forEach((item: any) => {
            results.push({
              type: item.type === 2 ? 'video' : 'image',
              url: item.thumbPath || item.mediaId || item.url,
              name: item.name,
              size: item.size
            })
          })
        } else if (res.files && Array.isArray(res.files)) {
          // 兼容旧版格式
          res.files.forEach((item: any) => {
            const isVideo = item.type === 'video' || item.mediaType === 2
            results.push({
              type: isVideo ? 'video' : 'image',
              url: item.thumbPath || item.url || item,
              name: item.name,
              size: item.size
            })
          })
        }
        
        resolve(results)
      },
      fail: (err: any) => {
        reject(new Error(err.errorMessage || '选择媒体失败'))
      }
    })
    return
  }

  // 降级方案：使用 dd.chooseImage
  if (typeof dd.chooseImage === 'function' && types.includes('image') && !types.includes('video')) {
    dd.chooseImage({
      sourceType: ['album', 'camera'], // 同时支持相册和拍照
      count: multiple ? max : 1,
      success: (res: any) => {
        const results: MediaResult[] = []
        const filePaths = res.filePaths || (res.url ? [res.url] : [])
        
        filePaths.forEach((url: string) => {
          results.push({
            type: 'image',
            url: url
          })
        })
        
        resolve(results)
      },
      fail: (err: any) => {
        reject(new Error(err.errorMessage || '选择图片失败'))
      }
    })
    return
  }

  reject(new Error('媒体选择API不可用'))
}
