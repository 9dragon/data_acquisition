<template>
  <div class="check-in-page">
    <!-- 项目选择 -->
    <van-cell-group inset title="选择项目">
      <van-cell
        is-link
        :title="selectedProject || '请选择项目'"
        @click="showProjectPicker = true"
      />
    </van-cell-group>

    <!-- 签到信息 -->
    <van-cell-group inset title="签到信息">
      <van-cell title="当前位置" :value="locationInfo.address || '获取中...'" />
      <van-cell title="经纬度">
        <template #value>
          <span v-if="locationInfo.latitude">
            {{ locationInfo.latitude.toFixed(6) }}, {{ locationInfo.longitude.toFixed(6) }}
          </span>
          <span v-else>--</span>
        </template>
      </van-cell>
      <van-cell title="当前时间" :value="currentTime" />
    </van-cell-group>

    <!-- 照片 -->
    <van-cell-group inset title="拍照签到">
      <div class="photo-section">
        <div v-if="photo" class="photo-preview" @click="previewPhoto">
          <van-image :src="photo" fit="cover" />
          <van-icon name="cross" class="photo-delete" @click.stop="deletePhoto" />
        </div>
        <div v-else class="photo-upload" @click="takePhoto">
          <van-icon name="photograph" size="40" color="#999" />
          <span>点击拍照</span>
        </div>
      </div>
    </van-cell-group>

    <!-- 备注 -->
    <van-cell-group inset title="备注">
      <van-field
        v-model="remark"
        type="textarea"
        placeholder="请输入备注信息（选填）"
        rows="3"
        maxlength="200"
        show-word-limit
      />
    </van-cell-group>

    <!-- 签到按钮 -->
    <div class="submit-section">
      <van-button
        type="primary"
        size="large"
        round
        :loading="submitting"
        @click="handleCheckIn"
      >
        确认签到
      </van-button>
    </div>

    <!-- 项目选择弹窗 -->
    <van-popup v-model:show="showProjectPicker" position="bottom">
      <van-picker
        :columns="projectList"
        @confirm="onProjectConfirm"
        @cancel="showProjectPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { useRouter } from 'vue-router'
import { attendanceApi } from '@/api/attendance'
import { getLocation, chooseImage, previewImage as ddPreviewImage } from '@/utils/dingtalk'
import type { AttendanceRecord } from '@/api/attendance'

const router = useRouter()

// 项目列表
const projectList = ref([
  { text: '项目A', value: 1 },
  { text: '项目B', value: 2 },
  { text: '项目C', value: 3 }
])

const showProjectPicker = ref(false)
const selectedProject = ref('')
const selectedProjectId = ref<number>()

// 位置信息
const locationInfo = ref({
  latitude: 0,
  longitude: 0,
  address: ''
})

// 照片
const photo = ref('')

// 备注
const remark = ref('')

// 当前时间
const currentTime = ref('')

// 提交状态
const submitting = ref(false)

// 定时器
let timer: number | null = null

// 选择项目
const onProjectConfirm = ({ selectedOptions }: any) => {
  selectedProject.value = selectedOptions[0].text
  selectedProjectId.value = selectedOptions[0].value
  showProjectPicker.value = false
}

// 获取位置
const fetchLocation = async () => {
  try {
    const location = await getLocation()
    locationInfo.value = location
  } catch (error) {
    console.error('获取位置失败:', error)
    showToast('获取位置失败')
  }
}

// 拍照
const takePhoto = async () => {
  try {
    const image = await chooseImage()
    photo.value = image
  } catch (error) {
    console.error('拍照失败:', error)
  }
}

// 预览照片
const previewPhoto = () => {
  if (photo.value) {
    ddPreviewImage([photo.value], photo.value)
  }
}

// 删除照片
const deletePhoto = () => {
  photo.value = ''
}

// 更新时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\//g, '-')
}

// 签到
const handleCheckIn = async () => {
  // 验证
  if (!selectedProjectId.value) {
    showToast('请选择项目')
    return
  }

  if (!locationInfo.value.latitude) {
    showToast('请获取位置信息')
    return
  }

  submitting.value = true
  showLoadingToast({
    message: '签到中...',
    forbidClick: true,
    duration: 0
  })

  try {
    const record: AttendanceRecord = await attendanceApi.checkIn({
      projectId: selectedProjectId.value,
      photo: photo.value,
      latitude: locationInfo.value.latitude,
      longitude: locationInfo.value.longitude,
      location: locationInfo.value.address,
      remark: remark.value
    })

    closeToast()
    showToast('签到成功')

    setTimeout(() => {
      router.back()
    }, 1500)
  } catch (error: any) {
    closeToast()
    showToast(error.message || '签到失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchLocation()
  updateTime()
  timer = setInterval(updateTime, 1000) as unknown as number
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.check-in-page {
  padding: 16px;
}

.check-in-page :deep(.van-cell-group) {
  margin-bottom: 16px;
}

.photo-section {
  padding: 16px;
  display: flex;
  justify-content: center;
}

.photo-preview {
  position: relative;
  width: 200px;
  height: 200px;
}

.photo-preview :deep(.van-image) {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.photo-delete {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #fff;
  border-radius: 50%;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  color: #ee0a24;
}

.photo-upload {
  width: 200px;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #ddd;
  border-radius: 8px;
  background: #fafafa;
}

.photo-upload span {
  margin-top: 8px;
  color: #999;
  font-size: 14px;
}

.submit-section {
  margin-top: 24px;
}
</style>
