<template>
  <div class="watermark-camera-wrapper">
    <!-- 如果有外部图片源，显示图片预览 -->
    <div v-if="imageSrc" class="image-preview-mode">
      <div class="preview-image-wrapper">
        <img :src="imageSrc" alt="预览图片" class="preview-image" />
        <!-- 水印叠加层 -->
        <div class="watermark-overlay" :style="watermarkStyle">
          <div class="watermark-text">
            <div v-if="watermarkConfig.showTime && time">{{ time }}</div>
            <div v-if="watermarkConfig.showLocation && location">{{ location }}</div>
            <div v-if="watermarkConfig.showName && userName">{{ userName }}</div>
          </div>
        </div>
      </div>
      <div class="preview-actions">
        <button class="confirm-btn" @click="handleImageConfirm">确认使用</button>
        <button class="cancel-btn" @click="handleCancel">取消</button>
      </div>
    </div>

    <!-- 否则显示相机组件 -->
    <div v-else>
      <WatermarkCamera
        v-model="photoPath"
        :name="userName"
        :watermarkConfig="watermarkConfig"
        :locationConfig="locationConfig"
        @camera-success="handleCameraSuccess"
        @camera-error="handleCameraError"
      />

      <!-- 取消按钮 -->
      <button class="cancel-btn" @click="handleCancel">取消</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { showToast } from 'vant'
import { WatermarkCamera } from 'vue3-watermark-camera'
// 样式文件通过组件自动加载

const emit = defineEmits<{
  photoCaptured: [photoData: string]
  cancel: []
}>()

const props = defineProps<{
  userName?: string
  time?: string
  location?: string
  imageSrc?: string  // 外部图片源，如果提供则只添加水印不显示相机
  watermarkConfig?: {  // 水印配置，可选
    showTime?: boolean
    showLocation?: boolean
    showName?: boolean
    backgroundColor?: string
    textColor?: string
    fontSize?: number
    [key: string]: any
  }
}>()

// 照片路径
const photoPath = ref('')

// 水印配置
const watermarkConfig = computed(() => {
  const defaultConfig = {
    showTime: true,
    showLocation: true,
    showName: !!props.userName,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    textColor: '#FFFFFF',
    fontSize: 24,
    position: 'bottom_right'
  }
  // 合并外部传入的配置
  if (props.watermarkConfig) {
    return { ...defaultConfig, ...props.watermarkConfig }
  }
  return defaultConfig
})

// 水印叠加层样式
const watermarkStyle = computed(() => {
  const config = watermarkConfig.value
  const position = config.position || 'bottom_right'
  let style: any = {
    background: config.backgroundColor,
    color: config.textColor,
    fontSize: `${config.fontSize}px`
  }
  // 根据位置设置定位
  if (position === 'top_left') {
    style.top = '20px'
    style.left = '20px'
    style.bottom = 'auto'
    style.right = 'auto'
  } else if (position === 'top_right') {
    style.top = '20px'
    style.right = '20px'
    style.bottom = 'auto'
    style.left = 'auto'
  } else if (position === 'bottom_left') {
    style.bottom = '20px'
    style.left = '20px'
    style.top = 'auto'
    style.right = 'auto'
  } else { // bottom_right
    style.bottom = '20px'
    style.right = '20px'
    style.top = 'auto'
    style.left = 'auto'
  }
  return style
})

// 位置配置 - 使用钉钉定位
const locationConfig = computed(() => ({
  enableLocation: true,
  locationProvider: 'dingtalk' as const
}))

// 相机成功
const handleCameraSuccess = (filePath: string) => {
  emit('photoCaptured', filePath)
}

// 相机失败
const handleCameraError = (error: any) => {
  console.error('相机失败:', error)
  showToast('拍照失败')
  emit('cancel')
}

// 确认使用图片
const handleImageConfirm = () => {
  // 直接返回原始图片（TODO: 需要添加水印）
  emit('photoCaptured', imageSrc || '')
}

// 取消
const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.watermark-camera-wrapper {
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  background: #000;
}

.cancel-btn {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 32px;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  z-index: 10001;
}

.image-preview-mode {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #000;
  padding: 20px;
}

.preview-image-wrapper {
  position: relative;
  width: 100%;
  max-width: 400px;
  margin-bottom: 30px;
}

.preview-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
}

.watermark-overlay {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.6);
  padding: 8px 12px;
  border-radius: 4px;
  max-width: 80%;
}

.watermark-text {
  color: #fff;
  font-size: 14px;
  line-height: 1.4;
}

.preview-actions {
  display: flex;
  gap: 20px;
}

.confirm-btn {
  padding: 12px 32px;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 500;
  background: #07c160;
  color: #fff;
  cursor: pointer;
}

.cancel-btn {
  padding: 12px 32px;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  cursor: pointer;
}
</style>
