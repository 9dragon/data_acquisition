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
            :class="{ 'checked': shift.checked, 'current': shift.isCurrent, 'selected': selectedShiftId === shift.index }"
            @click="selectShift(shift)"
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

    <!-- 当前项目（从我的页面选择） -->
    <van-cell-group inset title="当前项目">
      <van-cell>
        <template #value>
          <span :class="{ 'no-project': !selectedProject }">
            {{ selectedProject || '请在【我的】页面选择项目' }}
          </span>
        </template>
      </van-cell>
    </van-cell-group>

    <!-- 签到信息 -->
    <van-cell-group inset title="签到信息">
      <van-cell title="当前位置">
        <template #value>
          <span class="address-value">{{ locationInfo.address || '获取中...' }}</span>
        </template>
      </van-cell>
      <van-cell title="经纬度">
        <template #value>
          <span v-if="locationInfo.latitude" class="coordinate-value">
            {{ locationInfo.latitude.toFixed(6) }},{{ locationInfo.longitude.toFixed(6) }}
          </span>
          <span v-else>--</span>
        </template>
      </van-cell>
      <van-cell title="当前时间">
        <template #value>
          <span class="time-value">{{ currentTime }}</span>
        </template>
      </van-cell>
    </van-cell-group>

    <!-- 照片 -->
    <van-cell-group inset title="拍照签到">
      <div class="photo-section">
        <div v-if="photo" class="photo-preview" @click="previewPhoto">
          <div class="photo-wrapper">
            <van-image :src="photo" fit="contain" />
          </div>
          <van-icon name="cross" class="photo-delete" @click.stop="deletePhoto" />
        </div>
        <div v-else class="photo-upload" @click="takePhoto">
          <van-icon name="photograph" size="40" color="#999" />
          <span>点击拍照</span>
          <div class="camera-switch" @click.stop="toggleCamera">
            <van-icon :name="cameraFacing === 'user' ? 'contact' : 'eye-o'" size="16" />
            <span>{{ cameraFacing === 'user' ? '前置' : '后置' }}</span>
          </div>
        </div>
      </div>
    </van-cell-group>

    <!-- 备注 -->
    <van-cell-group inset title="备注">
      <van-field
        v-model="remark"
        type="textarea"
        :placeholder="remarkPlaceholder"
        rows="3"
        maxlength="200"
        show-word-limit
        :required="!isInShiftTime"
      />
      <div v-if="!isInShiftTime" class="remark-required-hint">
        <van-icon name="info-o" /> 当前不在打卡时段内，必须填写备注才能打卡
      </div>
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

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { useRouter } from 'vue-router'
import { attendanceApi, type ShiftInfo } from '@/api/attendance'
import { systemConfigApi } from '@/api/systemConfig'
import { getLocation, type LocationInfo, chooseImage, previewImage as ddPreviewImage } from '@/utils/dingtalk'
import { useUserStore } from '@/stores/user'
import { addWatermarkToImage, type WatermarkData, type CanvasWatermarkOptions } from '@/utils/watermark'

// 水印配置接口
interface WatermarkConfig {
  enabled: boolean
  position: string
  fontSize: number
  color: string
  alpha: number
  backgroundColor: string
  showTime: boolean
  showLocation: boolean
  showUser: boolean
  timeIcon: string
  locationIcon: string
  userIcon: string
  [key: string]: any
}


const router = useRouter()
import { useMobileProjectStore } from '@/stores/mobileProject'
import { navigateWithFullScreen } from '@/utils/routerHelper'

const userStore = useUserStore()
const projectStore = useMobileProjectStore()

// 项目列表
const projectList = computed(() => {
  return projectStore.projectList.map(p => ({
    text: p.name,
    value: p.id
  }))
})

const selectedProject = computed(() => projectStore.currentProject?.name || '')
const selectedProjectId = computed(() => projectStore.currentProject?.id)

// 水印配置
const watermarkConfig = ref<WatermarkConfig>({
  enabled: true,
  position: 'bottom_right',
  fontSize: 24,
  color: '#FFFFFF',
  alpha: 0.8,
  backgroundColor: '#000000',
  showTime: true,
  showLocation: true,
  showUser: true,
  timeIcon: '🕐',
  locationIcon: '📍',
  userIcon: '👤'
})

// 位置信息
const locationInfo = ref<LocationInfo>({
  latitude: 0,
  longitude: 0,
  address: ''
})

// 照片
const photo = ref('')

// 摄像头方向：从 localStorage 读取，默认前置
const cameraFacing = ref<'user' | 'environment'>(
  (localStorage.getItem('checkin_camera_facing') as 'user' | 'environment') || 'user'
)
const toggleCamera = () => {
  cameraFacing.value = cameraFacing.value === 'user' ? 'environment' : 'user'
  localStorage.setItem('checkin_camera_facing', cameraFacing.value)
}

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

// 选中的打卡时段
const selectedShiftId = ref<number>()

// 选中的时段对象
const selectedShift = computed(() => {
  return shifts.value.find(s => s.index === selectedShiftId.value)
})

// 计算属性
const checkedRate = computed(() => {
  if (totalCount.value === 0) return 0
  return (checkedCount.value / totalCount.value) * 100
})

const currentShift = computed(() => {
  return shifts.value.find(s => s.isCurrent) || null
})

const canCheckIn = computed(() => {
  if (!selectedShift.value) return false
  if (selectedShift.value.checked) return false
  return !!selectedProjectId.value
})

const checkInButtonText = computed(() => {
  if (!selectedShift.value) return '请选择打卡时段'
  if (selectedShift.value.checked) return '该时段已打卡'
  return `确认${selectedShift.value.name}`
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

// 判断是否在打卡时段内
const isInShiftTime = computed(() => {
  return !!currentShift.value
})

// 备注占位符
const remarkPlaceholder = computed(() => {
  return isInShiftTime.value ? '请输入备注信息（选填）' : '请输入备注信息（非打卡时段必填）'
})

// 定时器
let timer: number | null = null

// 选择打卡时段
const selectShift = (shift: ShiftInfo) => {
  if (shift.checked) {
    showToast('该时段已打卡，无法选择')
    return
  }
  selectedShiftId.value = shift.index
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
    showToast(error.message || '获取位置失败，请检查定位权限')
    locationInfo.value = { latitude: 0, longitude: 0, address: '' }
  }
}

// 拍照 - 直接调起相机
const takePhoto = async () => {
  if (!locationInfo.value.latitude || locationInfo.value.latitude === 0) {
    showToast('请先获取位置信息')
    await fetchLocation()
    if (!locationInfo.value.latitude || locationInfo.value.latitude === 0) {
      showToast('无法获取位置，请检查定位权限')
      return
    }
  }

  try {
    showLoadingToast({ message: '拍照中...', forbidClick: true })

    // 调起相机（钉钉环境用 dd.chooseImage，浏览器用 file input）
    let imageData = await chooseImage(cameraFacing.value)

    // 钉钉环境返回 URL，需转为 base64
    if (imageData && !imageData.startsWith('data:')) {
      imageData = await urlToBase64(imageData)
    }

    // Canvas 绘制水印
    const watermarkData: WatermarkData = {
      time: currentTime.value,
      address: locationInfo.value.address || '',
      latitude: locationInfo.value.latitude || 0,
      longitude: locationInfo.value.longitude || 0,
      userName: userStore.name || ''
    }
    const watermarkOptions: CanvasWatermarkOptions = {
      showTime: watermarkConfig.value.showTime,
      showLocation: watermarkConfig.value.showLocation,
      showName: watermarkConfig.value.showUser,
      backgroundColor: `rgba(0, 0, 0, ${watermarkConfig.value.alpha})`,
      textColor: watermarkConfig.value.color,
      fontSize: watermarkConfig.value.fontSize,
      position: watermarkConfig.value.position,
      timeIcon: watermarkConfig.value.timeIcon || '🕐',
      locationIcon: watermarkConfig.value.locationIcon || '📍',
      userIcon: watermarkConfig.value.userIcon || '👤'
    }

    let finalImage = imageData
    if (watermarkConfig.value.enabled) {
      finalImage = await addWatermarkToImage(imageData, watermarkData, watermarkOptions)
    }

    photo.value = finalImage
    closeToast()
    showToast('拍照成功')
  } catch (error: any) {
    closeToast()
    if (error.message !== '未选择文件') {
      showToast(error.message || '拍照失败')
    }
  }
}

// 将图片URL转换为base64
const urlToBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('无法创建Canvas上下文'))
        return
      }
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/jpeg', 0.9))
    }
    img.onerror = () => {
      reject(new Error('图片加载失败'))
    }
    img.src = url
  })
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
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  const second = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

// 获取今日打卡统计
const fetchTodayStats = async () => {
  try {
    const stats = await attendanceApi.getTodayStats(selectedProjectId.value)
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
  if (!selectedShift.value) {
    showToast('请选择打卡时段')
    return
  }

  if (!selectedProjectId.value) {
    showToast('请选择项目')
    return
  }

  // 非打卡时段必须填写备注
  if (!isInShiftTime.value && !remark.value.trim()) {
    showToast('当前不在打卡时段内，必须填写备注')
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
      shiftIndex: selectedShift.value.index,
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

onMounted(async () => {
  // 获取水印配置
  try {
    const config = await systemConfigApi.getConfigJson('attendance.watermark')
    if (config) {
      watermarkConfig.value = { ...watermarkConfig.value, ...config }
    }
  } catch (error) {
    console.error('获取水印配置失败:', error)
  }

  await projectStore.fetchProjects()
  await projectStore.fetchCurrentProject()

  await fetchTodayStats()
  updateCurrentShift()

  // 默认选择当前时段
  const current = shifts.value.find(s => s.isCurrent && !s.checked)
  if (current) {
    selectedShiftId.value = current.index
  } else {
    // 如果没有当前时段，选择第一个未打卡的时段
    const firstUnchecked = shifts.value.find(s => !s.checked)
    if (firstUnchecked) {
      selectedShiftId.value = firstUnchecked.index
    }
  }

  fetchLocation()
  updateTime()
  timer = setInterval(() => {
    updateTime()
    updateCurrentShift()
  }, 1000) as unknown as number // 每秒更新一次
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.check-in-page {
  padding: 0;
}

.check-in-page :deep(.van-cell-group) {
  margin-bottom: 16px;
}

/* 当前位置地址右对齐、全部显示 */
.address-value {
  text-align: right;
  word-break: break-all;
  white-space: normal;
}

/* 坐标值不换行、右对齐 */
.coordinate-value {
  white-space: nowrap;
}

/* 时间值不换行、右对齐 */
.time-value {
  white-space: nowrap;
  text-align: right;
}

/* 签到信息区域的值右对齐 */
.check-in-page :deep(.van-cell-group:nth-of-type(3)) {
  overflow: visible;
}

.check-in-page :deep(.van-cell-group:nth-of-type(3) .van-cell__body) {
  overflow: visible;
}

.check-in-page :deep(.van-cell-group:nth-of-type(3) .van-cell__value) {
  text-align: right;
  overflow: visible;
  min-width: 180px;
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

.shift-item.selected {
  border: 2px solid #1989fa;
  box-shadow: 0 2px 8px rgba(25, 137, 250, 0.3);
}

.shift-item.selected:not(.checked):not(.current) {
  background: #f0f7ff;
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

.photo-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.photo-wrapper :deep(.van-image) {
  width: 100%;
  height: 100%;
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

.camera-switch {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-top: 6px;
  padding: 2px 10px;
  border-radius: 12px;
  background: #f0f0f0;
  color: #666;
  font-size: 12px;
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

.remark-required-hint {
  padding: 8px 16px;
  font-size: 13px;
  color: #ff976a;
  background: #fff7e6;
  display: flex;
  align-items: center;
  gap: 4px;
}

</style>
