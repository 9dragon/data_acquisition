import { defineStore } from 'pinia'
import { ref } from 'vue'
import { dingtalkApi, type DingTalkAuthResponse } from '@/api/dingtalk'
import { useUserStore } from './user'
import { showToast, showLoadingToast, closeToast } from 'vant'

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
    chooseImage,
    previewImage
  }
})
