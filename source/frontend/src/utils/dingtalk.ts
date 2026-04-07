/**
 * 钉钉SDK工具类
 */

// 钉钉JSAPI加载状态
let isDingTalkReady = false
let readyResolve: ((value: boolean) => void) | null = null

/**
 * 判断是否在钉钉环境中
 */
export function isDingTalk(): boolean {
  return /dingtalk/i.test(navigator.userAgent)
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
 * 获取地理位置
 */
export function getLocation(): Promise<{ latitude: number; longitude: number; address?: string }> {
  return new Promise((resolve, reject) => {
    if (!isDingTalk()) {
      // 非钉钉环境，使用浏览器定位
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
        reject(new Error('浏览器不支持定位'))
      }
      return
    }

    // @ts-ignore
    if (window.dd && window.dd.device) {
      // @ts-ignore
      window.dd.device.geolocation.get({
        onSuccess: (result: any) => {
          resolve({
            latitude: result.latitude,
            longitude: result.longitude,
            address: result.address
          })
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
