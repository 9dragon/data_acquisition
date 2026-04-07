import { defineStore } from 'pinia'
import { ref } from 'vue'
import { dingtalkApi, type DingTalkAuthResponse } from '@/api/dingtalk'
import { useUserStore } from './user'
import { showToast, showLoadingToast, closeToast } from 'vant'
import type { LocationInfo } from '@/utils/dingtalk'

export const useDingTalkStore = defineStore('dingtalk', () => {
  const isDingTalkEnv = ref(false)
  const isReady = ref(false)

  /**
   * 初始化钉钉环境
   */
  async function init() {
    // 检查是否在钉钉环境中
    const ua = navigator.userAgent.toLowerCase()
    isDingTalkEnv.value = /dingtalk/i.test(ua)

    if (!isDingTalkEnv.value) {
      console.log('不在钉钉环境中')
      return false
    }

    // 加载钉钉JSAPI
    isReady.value = await loadDingTalkJSAPI()
    return isReady.value
  }

  /**
   * 加载钉钉JSAPI
   */
  function loadDingTalkJSAPI(): Promise<boolean> {
    return new Promise((resolve) => {
      if ((window as any).dd) {
        resolve(true)
        return
      }

      const script = document.createElement('script')
      // 使用钉钉官方JSAPI，支持客户端内免登
      script.src = 'https://g.alicdn.com/dingding/dingtalk-jsapi/2.10.3/dingtalk.open.js'
      script.onload = () => {
        // JSAPI加载后需要等待ready
        ;(window as any).dd.ready(() => {
          console.log('钉钉JSAPI已就绪')
          resolve(true)
        })
        ;(window as any).dd.error((err: any) => {
          console.error('钉钉JSAPI错误:', err)
          resolve(false)
        })
      }
      script.onerror = () => {
        console.error('钉钉JSAPI加载失败')
        resolve(false)
      }
      document.head.appendChild(script)
    })
  }

  /**
   * 钉钉免登认证
   */
  async function auth(): Promise<boolean> {
    if (!isReady.value) {
      showToast('钉钉SDK未初始化')
      return false
    }

    showLoadingToast({
      message: '登录中...',
      forbidClick: true,
      duration: 0
    })

    try {
      // 获取免登授权码
      const authCode = await getAuthCode()
      if (!authCode) {
        closeToast()
        showToast('获取授权码失败')
        return false
      }

      // 调用后端接口进行认证
      const result = await dingtalkApi.auth({ authCode })

      // 保存token和用户信息
      const userStore = useUserStore()
      userStore.setToken(result.token)
      userStore.setUserInfo(result.user)

      closeToast()
      showToast('登录成功')
      return true
    } catch (error: any) {
      closeToast()
      showToast(error.message || '登录失败')
      return false
    }
  }

  /**
   * 获取钉钉授权码
   */
  function getAuthCode(): Promise<string> {
    return new Promise((resolve, reject) => {
      const dd = (window as any).dd
      if (!dd || !dd.runtime) {
        reject(new Error('钉钉JSAPI未加载'))
        return
      }

      dd.runtime.permission.requestAuthCode({
        corpId: import.meta.env.VITE_DINGTALK_CORP_ID || '',
        onSuccess: (result: any) => {
          resolve(result.code)
        },
        onFail: (error: any) => {
          reject(new Error(error.errorMessage))
        }
      })
    })
  }

  /**
   * 获取地理位置
   * 支持多种API版本，自动降级
   */
  function getLocation(): Promise<{ latitude: number; longitude: number; address?: string; province?: string; city?: string; district?: string; street?: string }> {
    return new Promise((resolve, reject) => {
      if (!isDingTalkEnv.value) {
        // 非钉钉环境，使用浏览器定位
        useBrowserGeolocation(resolve, reject)
        return
      }

      const dd = (window as any).dd
      if (!dd) {
        reject(new Error('钉钉SDK未加载'))
        return
      }

      // 确保dd已就绪
      if (dd.ready) {
        dd.ready(() => {
          attemptDingTalkLocation(dd, resolve, reject)
        })
        dd.error((err: any) => {
          console.error('钉钉JSAPI错误:', err)
          reject(new Error('钉钉JSAPI错误'))
        })
      } else {
        attemptDingTalkLocation(dd, resolve, reject)
      }
    })
  }

  /**
   * 配置钉钉JSAPI权限
   * 必须在调用需要权限的API之前配置
   */
  function configDingTalk(): Promise<boolean> {
    return new Promise((resolve) => {
      // 获取当前页面URL
      const url = window.location.href.split('#')[0]

      // 调用后端获取签名
      dingtalkApi.getJsApiSignature(url)
        .then(config => {
          const dd = (window as any).dd
          if (dd && dd.config) {
            dd.config({
              agentId: config.agentId,
              corpId: config.corpId,
              timeStamp: config.timeStamp,
              nonceStr: config.nonceStr,
              signature: config.signature,
              type: 0,
              jsApiList: ['getLocation', 'device.geolocation.get'] // 需要使用的API列表
            })

            dd.ready(() => {
              console.log('✓ 钉钉JSAPI配置成功')
              resolve(true)
            })

            dd.error((err: any) => {
              console.error('✗ 钉钉JSAPI配置失败:', err)
              resolve(false)
            })
          } else {
            console.warn('dd.config不存在')
            resolve(false)
          }
        })
        .catch(err => {
          console.error('获取签名配置失败:', err)
          resolve(false)
        })
    })
  }

  /**
   * 尝试使用钉钉定位API
   */
  function attemptDingTalkLocation(
    dd: any,
    resolve: any,
    reject: any
  ) {
    console.log('尝试获取位置，可用的dd对象属性:', Object.keys(dd))

    // 方法1: 尝试新的 dd.getLocation API
    if (typeof dd.getLocation === 'function') {
      console.log('使用 dd.getLocation API')
      dd.getLocation({
        targetAccuracy: '200',
        cacheTimeout: 20,
        coordinate: '1',
        useCache: true,
        withReGeocode: true,
        type: 1,
        success: (result: any) => {
          console.log('钉钉定位成功:', result)
          resolve({
            latitude: parseFloat(result.latitude) || 0,
            longitude: parseFloat(result.longitude) || 0,
            address: result.address,
            province: result.province,
            city: result.city,
            district: result.district,
            street: result.street
          })
        },
        fail: (error: any) => {
          console.error('钉钉定位失败:', error)
          reject(new Error(error?.errorMessage || '定位失败'))
        },
        complete: () => {
          console.log('定位请求完成')
        }
      })
      return
    }

    // 方法2: 尝试 dd.device.geolocation.getLocation
    if (dd.device?.geolocation?.getLocation) {
      console.log('使用 dd.device.geolocation.getLocation API')
      dd.device.geolocation.getLocation({
        targetAccuracy: '200',
        cacheTimeout: 20,
        coordinate: '1',
        useCache: true,
        withReGeocode: true,
        type: 1,
        success: (result: any) => {
          console.log('钉钉定位成功:', result)
          resolve({
            latitude: parseFloat(result.latitude) || 0,
            longitude: parseFloat(result.longitude) || 0,
            address: result.address,
            province: result.province,
            city: result.city,
            district: result.district,
            street: result.street
          })
        },
        fail: (error: any) => {
          console.error('钉钉定位失败:', error)
          reject(new Error(error?.errorMessage || '定位失败'))
        }
      })
      return
    }

    // 方法3: 尝试旧的 dd.device.geolocation.get API
    if (dd.device?.geolocation?.get) {
      console.log('使用 dd.device.geolocation.get API (旧版)')
      dd.device.geolocation.get({
        onSuccess: (result: any) => {
          console.log('钉钉定位成功:', result)
          resolve({
            latitude: parseFloat(result.latitude) || 0,
            longitude: parseFloat(result.longitude) || 0,
            address: result.address || result.formattedAddress
          })
        },
        onFail: (error: any) => {
          console.error('钉钉定位失败:', error)
          reject(new Error(error?.errorMessage || '定位失败'))
        }
      })
      return
    }

    reject(new Error('找不到可用的定位API，请确认钉钉应用已授予定位权限'))
  }

  /**
   * 使用浏览器定位（降级方案）
   */
  function useBrowserGeolocation(resolve: any, reject: any) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          reject(new Error('获取位置失败: ' + error.message))
        }
      )
    } else {
      reject(new Error('浏览器不支持定位，请在钉钉中打开应用'))
    }
  }

  /**
   * 拍照或选择图片
   */
  function chooseImage(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (isDingTalkEnv.value && (window as any).dd?.device?.camera) {
        // 使用钉钉相机
        ;(window as any).dd.device.camera.chooseImage({
          onSuccess: (result: any) => {
            resolve(result.data[0])
          },
          onFail: (error: any) => {
            reject(new Error(error.errorMessage))
          }
        })
      } else {
        // 使用文件选择
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
      }
    })
  }

  /**
   * 预览图片
   */
  function previewImage(urls: string[], current?: string) {
    if (isDingTalkEnv.value && (window as any).dd?.device?.image) {
      ;(window as any).dd.device.image.preview({
        urls: urls,
        current: current || urls[0]
      })
    } else {
      // 浏览器环境，简单处理
      window.open(urls[0], '_blank')
    }
  }

  return {
    isDingTalkEnv,
    isReady,
    init,
    auth,
    getLocation,
    chooseImage,
    previewImage,
    configDingTalk
  }
})
