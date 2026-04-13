<template>
  <div class="watermark-camera-wrapper">
    <!-- 使用 vue3-watermark-camera 组件 -->
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { showToast } from 'vant'
import { WatermarkCamera } from 'vue3-watermark-camera'

const emit = defineEmits<{
  photoCaptured: [photoData: string]
  cancel: []
}>()

const props = defineProps<{
  userName?: string
  time?: string
  location?: string
  imageSrc?: string
  watermarkConfig?: {
    showTime?: boolean
    showLocation?: boolean
    showName?: boolean
    backgroundColor?: string
    textColor?: string
    fontSize?: number
    timeIcon?: string
    locationIcon?: string
    userIcon?: string
    [key: string]: any
  }
}>()

// 照片路径
const photoPath = ref('')

// 水印配置（传递给 vue3-watermark-camera 组件）
const watermarkConfig = computed(() => {
  const defaultConfig = {
    showTime: true,
    showLocation: true,
    showName: !!props.userName,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    textColor: '#FFFFFF',
    fontSize: 24
  }
  // 合并外部传入的配置
  if (props.watermarkConfig) {
    return { ...defaultConfig, ...props.watermarkConfig }
  }
  return defaultConfig
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
</style>
