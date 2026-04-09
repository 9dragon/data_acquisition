import { defineStore } from 'pinia'
import { ref } from 'vue'
import { dingtalkApi, type DingTalkAuthResponse } from '@/api/dingtalk'
import { useUserStore } from './user'
import { showToast, showLoadingToast, closeToast } from 'vant'
import * as dd from 'dingtalk-jsapi'

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

    // npm包方式，无需手动加载
    isReady.value = true
    return true
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
      if (!dd.runtime) {
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
      if (isDingTalkEnv.value && (dd as any).biz?.util?.uploadImageFromCamera) {
        // 使用钉钉相机
        ;(dd as any).biz.util.uploadImageFromCamera({
          compression: true,
          onSuccess: (result: any) => {
            resolve(result.url || result.picUrl || result)
          },
          onFail: (error: any) => {
            reject(new Error(error.errorMessage || '拍照失败'))
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
    if (isDingTalkEnv.value && (dd as any).biz?.util?.previewImage) {
      ;(dd as any).biz.util.previewImage({
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
