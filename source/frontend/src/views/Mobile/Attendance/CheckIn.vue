<template>
  <div class="check-in-page">
    <!-- 今日打卡状态 -->
    <van-cell-group inset title="今日打卡">
      <div class="today-status">
        <div class="progress-ring">
          <van-circle
            v-model:current-rate="checkedRate"
            :rate="100"
            :speed="100"
            :text="`${checkedCount}/${totalCount}`"
            size="80px"
            color="#07c160"
            layer-color="#ebedf0"
          />
        </div>
        <div class="shifts-list">
          <div
            v-for="shift in shifts"
            :key="shift.index"
            class="shift-item"
            :class="{ 'checked': shift.checked, 'current': shift.isCurrent }"
          >
            <div class="shift-info">
              <span class="shift-name">{{ shift.name }}</span>
              <span v-if="shift.checked" class="shift-time">
                {{ shift.checkInTime }}
              </span>
              <span v-else class="shift-pending">
                {{ shift.startTime }} - {{ shift.endTime }}
              </span>
            </div>
            <van-icon v-if="shift.checked" name="passed" color="#07c160" size="20" />
            <van-icon v-else-if="shift.isCurrent" name="clock" color="#ff976a" size="20" />
            <van-icon v-else name="clock-o" color="#c8c9cc" size="20" />
          </div>
        </div>
      </div>
    </van-cell-group>

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
        :disabled="!canCheckIn"
        @click="handleCheckIn"
      >
        {{ checkInButtonText }}
      </van-button>
      <div v-if="checkInHint" class="check-in-hint">
        {{ checkInHint }}
      </div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { useRouter } from 'vue-router'
import { attendanceApi, type ShiftInfo } from '@/api/attendance'
import { getLocation, type LocationInfo, chooseImage, previewImage as ddPreviewImage } from '@/utils/dingtalk'

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
const locationInfo = ref<LocationInfo>({
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

// 今日打卡状态
const shifts = ref<ShiftInfo[]>([])
const checkedCount = ref(0)
const totalCount = ref(0)

// 计算属性
const checkedRate = computed(() => {
  if (totalCount.value === 0) return 0
  return (checkedCount.value / totalCount.value) * 100
})

const currentShift = computed(() => {
  return shifts.value.find(s => s.isCurrent) || null
})

const canCheckIn = computed(() => {
  if (!currentShift.value) return false
  if (currentShift.value.checked) return false
  return !!selectedProjectId.value
})

const checkInButtonText = computed(() => {
  if (!currentShift.value) return '非打卡时段'
  if (currentShift.value.checked) return '已打卡'
  return `确认${currentShift.value.name}`
})

const checkInHint = computed(() => {
  if (!currentShift.value) {
    const nextShift = shifts.value.find(s => !s.checked)
    if (nextShift) {
      return `下一打卡时段: ${nextShift.startTime} - ${nextShift.name}`
    }
    return '今日所有时段已完成'
  }
  return null
})

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

    // 如果有省市区信息，组合显示完整地址
    if (location.province || location.city || location.district || location.street) {
      const parts = []
      if (location.province) parts.push(location.province)
      if (location.city && location.city !== location.province) parts.push(location.city)
      if (location.district) parts.push(location.district)
      if (location.street) parts.push(location.street)
      const formattedAddress = parts.join('')
      // 如果没有返回address字段，使用组合的地址
      if (!location.address && formattedAddress) {
        locationInfo.value.address = formattedAddress
      }
    }

    // 显示定位成功提示
    if (location.address) {
      console.log('定位成功:', location.address)
    }
  } catch (error: any) {
    console.error('获取位置失败:', error)
    showToast(error.message || '获取位置失败，请确保在钉钉中打开并允许定位权限')
    locationInfo.value = { latitude: 0, longitude: 0, address: '' }
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

// 获取今日打卡统计
const fetchTodayStats = async () => {
  try {
    const stats = await attendanceApi.getTodayStats()
    totalCount.value = stats.totalShifts
    checkedCount.value = stats.checkedShifts
    shifts.value = stats.pendingShifts || []
  } catch (error: any) {
    console.error('获取今日统计失败:', error)
    // 如果接口失败，使用默认配置
    shifts.value = [
      { index: 1, name: '上班打卡', startTime: '08:00', endTime: '09:30', checked: false, isCurrent: false },
      { index: 2, name: '午间打卡', startTime: '12:00', endTime: '13:30', checked: false, isCurrent: false },
      { index: 3, name: '下班打卡', startTime: '17:30', endTime: '19:00', checked: false, isCurrent: false }
    ]
    totalCount.value = 3
    checkedCount.value = 0
    updateCurrentShift()
  }
}

// 更新当前时段状态
const updateCurrentShift = () => {
  const now = new Date()
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  shifts.value.forEach(shift => {
    shift.isCurrent = currentTimeStr >= shift.startTime && currentTimeStr <= shift.endTime
  })
}

// 签到
const handleCheckIn = async () => {
  // 验证
  if (!selectedProjectId.value) {
    showToast('请选择项目')
    return
  }

  // 位置信息必填
  if (!locationInfo.value.latitude || locationInfo.value.latitude === 0) {
    showToast('请先获取位置信息')
    // 重新尝试获取位置
    await fetchLocation()
    return
  }

  submitting.value = true
  showLoadingToast({
    message: '签到中...',
    forbidClick: true,
    duration: 0
  })

  try {
    await attendanceApi.checkIn({
      projectId: selectedProjectId.value,
      photo: photo.value,
      latitude: locationInfo.value.latitude,
      longitude: locationInfo.value.longitude,
      location: locationInfo.value.address,
      remark: remark.value
    })

    closeToast()
    showToast('签到成功')

    // 刷新今日统计
    await fetchTodayStats()

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
  fetchTodayStats()
  updateCurrentShift()
  timer = setInterval(() => {
    updateTime()
    updateCurrentShift()
  }, 60000) as unknown as number // 每分钟更新一次
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

.today-status {
  padding: 16px;
  display: flex;
  gap: 16px;
  align-items: center;
}

.progress-ring {
  flex-shrink: 0;
}

.shifts-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shift-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  background: #f5f5f5;
}

.shift-item.checked {
  background: #e8f7ef;
}

.shift-item.current {
  background: #fff7e6;
  border: 1px solid #ffd591;
}

.shift-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.shift-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.shift-time {
  font-size: 12px;
  color: #07c160;
}

.shift-pending {
  font-size: 12px;
  color: #999;
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

.check-in-hint {
  margin-top: 12px;
  text-align: center;
  font-size: 13px;
  color: #999;
}
</style>
