/**
 * 图片水印工具 - 使用CSS叠加方式
 */

export interface WatermarkOptions {
  container: HTMLElement
  time: string
  location: string
  userName: string
}

/**
 * 为图片容器添加水印层
 * 使用CSS叠加方式，避免Canvas跨域问题
 */
export function addWatermarkOverlay(options: WatermarkOptions): void {
  // 移除旧的水印
  const oldWatermark = options.container.querySelector('.photo-watermark')
  if (oldWatermark) {
    oldWatermark.remove()
  }

  // 创建水印元素
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

/**
 * 移除水印层
 */
export function removeWatermarkOverlay(container: HTMLElement): void {
  const watermark = container.querySelector('.photo-watermark')
  if (watermark) {
    watermark.remove()
  }
}
