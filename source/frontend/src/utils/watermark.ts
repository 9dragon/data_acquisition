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
  position?: string
  timeIcon?: string
  locationIcon?: string
  userIcon?: string
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
    height: barHeight = 110,
    position = 'bottom_right',
    timeIcon = '',
    locationIcon = '',
    userIcon = ''
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
        const offset = 20 * scale

        // 根据 position 计算水印条坐标
        let barX: number, barY: number
        switch (position) {
          case 'top_left':
          case 'top_right':
            barX = padding
            barY = padding + offset
            break
          case 'center':
            barX = (imgWidth - barW) / 2
            barY = (imgHeight - barH) / 2
            break
          case 'bottom_left':
          case 'bottom_right':
          default:
            barX = padding
            barY = imgHeight - barH - padding - offset
            break
        }

        // 水印条背景（圆角矩形）
        ctx.fillStyle = backgroundColor
        drawRoundRect(ctx, barX, barY, barW, barH, radius)
        ctx.fill()

        // 字号体系：全部基于配置 fontSize，乘以 scale 系数
        const baseFontSize = fontSize * scale            // 基础字号：图标、日期、地址
        const timeFontSize = fontSize * 2 * scale        // 时分：2倍基础
        const nameFontSize = fontSize * 1.2 * scale      // 用户名：1.2倍基础
        const lineGap = 6 * scale                        // 行间距
        const iconGap = 4 * scale                        // 图标与文字间距

        // 水印文字颜色
        ctx.fillStyle = textColor
        ctx.textBaseline = 'top'

        // 动态计算左列宽度：先测量时间内容实际宽度，再确定分割线位置
        const leftPad = 12 * scale
        let timeContentW = 0
        if (showTime && data.time) {
          const timePart = data.time.split(' ')[1]?.slice(0, 5) || ''
          const datePart = data.time.split(' ')[0] || ''
          ctx.font = `${baseFontSize}px Arial`
          const iconW = timeIcon ? ctx.measureText(timeIcon).width + iconGap : 0
          ctx.font = `bold ${timeFontSize}px Arial`
          const timeW = ctx.measureText(timePart).width
          ctx.font = `${baseFontSize}px Arial`
          const dateW = ctx.measureText(datePart).width
          const textStartX = leftPad + iconW
          timeContentW = textStartX + Math.max(timeW, dateW) + 8 * scale
        }
        // 左列至少占 25%，至多占 40%
        const leftW = Math.max(barW * 0.25, Math.min(timeContentW, barW * 0.4))
        const rightX = barX + leftW
        const rightPad = 8 * scale

        // 计算左右内容高度，用于垂直居中
        let leftContentH = 0
        if (showTime && data.time) {
          leftContentH = timeFontSize + lineGap + baseFontSize
        }
        let rightContentH = 0
        if (showName && data.userName) rightContentH += nameFontSize + lineGap
        if (showLocation && data.address) rightContentH += baseFontSize

        const contentH = Math.max(leftContentH, rightContentH)
        const contentStartY = barY + (barH - contentH) / 2

        // ============ 左侧：时间（左对齐） ============
        if (showTime && data.time) {
          const timePart = data.time.split(' ')[1]?.slice(0, 5) || ''
          const datePart = data.time.split(' ')[0] || ''
          const leftPad = 12 * scale

          // 第一行：图标 + 时分
          let x = barX + leftPad
          const line1Y = contentStartY

          if (timeIcon) {
            ctx.font = `${baseFontSize}px Arial`
            ctx.fillText(timeIcon, x, line1Y + (timeFontSize - baseFontSize) / 2)
            x += ctx.measureText(timeIcon).width + iconGap
          }
          ctx.font = `bold ${timeFontSize}px Arial`
          ctx.fillText(timePart, x, line1Y)

          // 第二行：日期（与时分左对齐）
          ctx.font = `${baseFontSize}px Arial`
          ctx.fillText(datePart, x, line1Y + timeFontSize + lineGap)
        }

        // ============ 右侧：用户名 + 地址 ============
        ctx.textAlign = 'left'
        let rightY = contentStartY

        if (showName && data.userName) {
          ctx.font = `${baseFontSize}px Arial`
          const iconW = userIcon ? ctx.measureText(userIcon).width + iconGap : 0
          let x = rightX + rightPad

          if (userIcon) {
            ctx.font = `${baseFontSize}px Arial`
            ctx.fillText(userIcon, x, rightY + (nameFontSize - baseFontSize) / 2)
            x += iconW
          }
          ctx.font = `bold ${nameFontSize}px Arial`
          ctx.fillText(data.userName, x, rightY)
          rightY += nameFontSize + lineGap
        }

        if (showLocation && data.address) {
          ctx.font = `${baseFontSize}px Arial`
          const iconW = locationIcon ? ctx.measureText(locationIcon).width + iconGap : 0
          let x = rightX + rightPad

          if (locationIcon) {
            ctx.fillText(locationIcon, x, rightY)
            x += iconW
          }
          let addr = data.address
          if (addr.length > 30) {
            addr = addr.slice(0, 30) + '...'
          }
          const maxWidth = barW * 0.6 - rightPad - iconW - 8 * scale
          wrapText(ctx, addr, x, rightY, maxWidth, baseFontSize + lineGap)
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
