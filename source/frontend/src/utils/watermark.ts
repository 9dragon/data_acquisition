/**
 * 图片水印工具
 */

// ==================== CSS 叠加水印（旧接口，保留兼容） ====================

export interface WatermarkOptions {
  container: HTMLElement
  time: string
  location: string
  userName: string
}

export function addWatermarkOverlay(options: WatermarkOptions): void {
  const oldWatermark = options.container.querySelector('.photo-watermark')
  if (oldWatermark) {
    oldWatermark.remove()
  }

  const watermark = document.createElement('div')
  watermark.className = 'photo-watermark'
  watermark.innerHTML = `
    <div class="watermark-content">
      <span class="watermark-text">${options.time}</span>
      <span class="watermark-separator">|</span>
      <span class="watermark-text">${options.location}</span>
      <span class="watermark-separator">|</span>
      <span class="watermark-text">${options.userName}</span>
    </div>
  `

  options.container.appendChild(watermark)
}

export function removeWatermarkOverlay(container: HTMLElement): void {
  const watermark = container.querySelector('.photo-watermark')
  if (watermark) {
    watermark.remove()
  }
}

// ==================== Canvas 绘制水印 ====================

export interface CanvasWatermarkOptions {
  showTime?: boolean
  showLocation?: boolean
  showName?: boolean
  backgroundColor?: string
  textColor?: string
  fontSize?: number
  height?: number
}

export interface WatermarkData {
  time: string
  address: string
  latitude: number
  longitude: number
  userName: string
}

/**
 * 通过 Canvas 将水印绘制到图片上
 */
export function addWatermarkToImage(
  imageSrc: string,
  data: WatermarkData,
  options: CanvasWatermarkOptions = {}
): Promise<string> {
  const {
    showTime = true,
    showLocation = true,
    showName = true,
    backgroundColor = 'rgba(0,0,0,0.5)',
    textColor = '#fff',
    fontSize = 14,
    height: barHeight = 110
  } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      try {
        // 使用图片原始尺寸绘制，保证清晰度
        const imgWidth = img.naturalWidth
        const imgHeight = img.naturalHeight
        const dpr = 1 // 使用原始尺寸，不需要 devicePixelRatio

        const canvas = document.createElement('canvas')
        canvas.width = imgWidth
        canvas.height = imgHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('无法创建Canvas上下文'))
          return
        }

        // 绘制原始图片
        ctx.drawImage(img, 0, 0, imgWidth, imgHeight)

        // 根据图片宽度缩放水印元素
        const scale = imgWidth / 375
        const padding = 16 * scale
        const barW = imgWidth - padding * 2
        const radius = 12 * scale
        const barH = barHeight * scale
        const barY = imgHeight - barH - padding - 20 * scale
        const barX = padding

        // 水印条背景（圆角矩形）
        ctx.fillStyle = backgroundColor
        drawRoundRect(ctx, barX, barY, barW, barH, radius)
        ctx.fill()

        // 水印文字颜色
        ctx.fillStyle = textColor
        ctx.textBaseline = 'top'

        // 分两列：左侧时间(40%)，右侧信息(60%)
        const leftW = barW * 0.4
        const rightX = barX + leftW

        // 左侧：时间
        let textY = barY + 26 * scale
        if (showTime && data.time) {
          // 时分
          const timePart = data.time.split(' ')[1]?.slice(0, 5) || ''
          ctx.font = `bold ${32 * scale}px Arial`
          const timeW = ctx.measureText(timePart).width
          ctx.fillText(timePart, barX + (leftW - timeW) / 2, textY)
          textY += 36 * scale

          // 日期
          const datePart = data.time.split(' ')[0] || ''
          ctx.font = `bold ${fontSize * scale}px Arial`
          const dateW = ctx.measureText(datePart).width
          ctx.fillText(datePart, barX + (leftW - dateW) / 2, textY)
        }

        // 中间竖线分隔
        ctx.beginPath()
        ctx.moveTo(rightX - 16 * scale, barY + 12 * scale)
        ctx.lineTo(rightX - 16 * scale, barY + barH - 12 * scale)
        ctx.strokeStyle = textColor
        ctx.lineWidth = 2 * scale
        ctx.stroke()

        // 右侧：用户名、坐标、地址
        let rightY = barY + 16 * scale
        ctx.textAlign = 'left'

        if (showName && data.userName) {
          ctx.font = `bold ${18 * scale}px Arial`
          ctx.fillText(data.userName, rightX + 16 * scale, rightY)
          rightY += 24 * scale
        }

        if (showLocation && data.latitude && data.longitude) {
          const coordText = formatCoordinate(data.latitude, data.longitude)
          ctx.font = `${fontSize * scale}px Arial`
          ctx.fillText(coordText, rightX, rightY)
          rightY += 20 * scale
        }

        if (showLocation && data.address) {
          ctx.font = `${fontSize * scale}px Arial`
          let addr = data.address
          if (addr.length > 30) {
            addr = addr.slice(0, 30) + '...'
          }
          const maxWidth = barW * 0.6 - 12 * scale
          wrapText(ctx, addr, rightX, rightY, maxWidth, 18 * scale)
        }

        // 输出结果
        const result = canvas.toDataURL('image/jpeg', 0.9)
        resolve(result)
      } catch (err) {
        // Canvas 被污染等异常，降级返回原图
        console.warn('水印绘制失败，返回原图:', err)
        resolve(imageSrc)
      }
    }

    img.onerror = () => reject(new Error('图片加载失败'))
    img.src = imageSrc
  })
}

/** 绘制圆角矩形路径 */
function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number
): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

/** 文本自动换行 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  maxWidth: number,
  lineHeight: number
): void {
  let line = ''
  let currentY = y
  for (let i = 0; i < text.length; i++) {
    const testLine = line + text[i]
    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
      ctx.fillText(line, x, currentY)
      currentY += lineHeight
      line = text[i]
    } else {
      line = testLine
    }
  }
  ctx.fillText(line, x, currentY)
}

/** 坐标格式化 */
function formatCoordinate(lat: number, lng: number): string {
  if (!lat || !lng) return ''
  return `${Number(lat).toFixed(6)}°N,${Number(lng).toFixed(6)}°E`
}
