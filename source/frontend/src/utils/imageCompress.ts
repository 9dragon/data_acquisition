/**
 * 通用图片压缩工具
 * 通过 Canvas 进行等比缩放 + JPEG 质量压缩
 * 压缩参数可通过系统配置动态调整
 */

import { systemConfigApi } from '@/api/systemConfig'

/** 压缩配置选项 */
export interface ImageCompressOptions {
  /** 最大宽度（px），默认 1280 */
  maxWidth: number
  /** 最大高度（px），默认 1280 */
  maxHeight: number
  /** JPEG 质量（0-1），默认 0.7 */
  quality: number
}

/** 默认压缩配置 */
const DEFAULT_OPTIONS: ImageCompressOptions = {
  maxWidth: 1280,
  maxHeight: 1280,
  quality: 0.7,
}

/**
 * 压缩图片
 * @param imageSrc 图片源（Base64 DataURL 或 Blob URL）
 * @param options 压缩配置，不传则使用默认值
 * @returns 压缩后的 Base64 DataURL（JPEG 格式）
 */
export function compressImage(
  imageSrc: string,
  options?: Partial<ImageCompressOptions>
): Promise<string> {
  return new Promise((resolve, reject) => {
    const opts = { ...DEFAULT_OPTIONS, ...options }

    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      try {
        const originalWidth = img.width
        const originalHeight = img.height

        // 计算等比缩放后的尺寸（只缩不扩）
        let targetWidth = originalWidth
        let targetHeight = originalHeight

        if (targetWidth > opts.maxWidth) {
          targetHeight = Math.round((targetHeight * opts.maxWidth) / targetWidth)
          targetWidth = opts.maxWidth
        }
        if (targetHeight > opts.maxHeight) {
          targetWidth = Math.round((targetWidth * opts.maxHeight) / targetHeight)
          targetHeight = opts.maxHeight
        }

        // 如果无需缩放且质量为1，直接返回原图
        if (targetWidth === originalWidth && targetHeight === originalHeight && opts.quality >= 1) {
          resolve(imageSrc)
          return
        }

        const canvas = document.createElement('canvas')
        canvas.width = targetWidth
        canvas.height = targetHeight

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('无法创建Canvas上下文'))
          return
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
        const result = canvas.toDataURL('image/jpeg', opts.quality)
        resolve(result)
      } catch (err) {
        // 压缩失败降级返回原图
        console.warn('图片压缩失败，返回原图:', err)
        resolve(imageSrc)
      }
    }

    img.onerror = () => reject(new Error('图片加载失败'))
    img.src = imageSrc
  })
}

/**
 * 从系统配置加载压缩参数
 * 配置 key: system.image_compress
 * 配置值: { maxWidth, maxHeight, quality }
 */
export async function getCompressOptions(): Promise<ImageCompressOptions> {
  try {
    const config = await systemConfigApi.getConfig('system.image_compress')
    if (config && typeof config === 'object') {
      return {
        maxWidth: Number(config.maxWidth) || DEFAULT_OPTIONS.maxWidth,
        maxHeight: Number(config.maxHeight) || DEFAULT_OPTIONS.maxHeight,
        quality: Number(config.quality) || DEFAULT_OPTIONS.quality,
      }
    }
  } catch {
    // 配置读取失败，使用默认值
  }
  return { ...DEFAULT_OPTIONS }
}
