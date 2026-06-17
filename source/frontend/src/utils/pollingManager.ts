/**
 * 可暂停/恢复的轮询器
 * - 页面不可见时自动暂停，回到前台立即拉一次再恢复
 * - 组件卸载时调用 destroy() 清理
 */

export interface PollingOptions {
  /** 轮询间隔（毫秒） */
  interval: number
  /** 是否在启动时立即执行一次（默认 true） */
  immediate?: boolean
  /** 是否监听页面可见性自动暂停/恢复（默认 true） */
  autoPauseOnHidden?: boolean
}

export class PollingManager {
  private timer: ReturnType<typeof setTimeout> | null = null
  private running = false
  private readonly options: Required<PollingOptions>
  private readonly task: () => Promise<void> | void
  private readonly visibilityHandler: () => void

  constructor(task: () => Promise<void> | void, options: PollingOptions) {
    this.task = task
    this.options = {
      interval: options.interval,
      immediate: options.immediate ?? true,
      autoPauseOnHidden: options.autoPauseOnHidden ?? true
    }
    this.visibilityHandler = this.handleVisibilityChange.bind(this)
  }

  start(): void {
    if (this.running) return
    this.running = true
    if (this.options.autoPauseOnHidden) {
      document.addEventListener('visibilitychange', this.visibilityHandler)
    }
    if (this.options.immediate) {
      this.execute()
    } else {
      this.scheduleNext()
    }
  }

  stop(): void {
    this.running = false
    this.clearTimer()
  }

  destroy(): void {
    this.stop()
    if (this.options.autoPauseOnHidden) {
      document.removeEventListener('visibilitychange', this.visibilityHandler)
    }
  }

  /** 手动触发一次任务（不影响后续轮询节奏） */
  async execute(): Promise<void> {
    if (!this.running) return
    try {
      await this.task()
    } catch (e) {
      console.warn('[PollingManager] task error', e)
    } finally {
      if (this.running) {
        this.scheduleNext()
      }
    }
  }

  private scheduleNext(): void {
    this.clearTimer()
    if (!this.running) return
    this.timer = setTimeout(() => {
      this.execute()
    }, this.options.interval)
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      this.clearTimer()
    } else if (this.running) {
      // 回到前台立即拉一次
      this.execute()
    }
  }
}
