<template>
  <div class="records-page">
    <!-- 筛选条件 -->
    <van-dropdown-menu>
      <van-dropdown-item v-model="queryParams.status" :options="statusOptions" @change="onSearch" />
      <van-dropdown-item v-model="dateRange" :options="dateOptions" @change="onDateChange" />
    </van-dropdown-menu>

    <!-- 签到记录列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div v-for="record in records" :key="record.id" class="record-item">
          <div class="record-header">
            <span class="record-date">{{ formatDate(record.checkInTime) }}</span>
            <van-tag :type="record.status === 'NORMAL' ? 'success' : 'warning'">
              {{ record.status === 'NORMAL' ? '正常' : '迟到' }}
            </van-tag>
          </div>
          <div class="record-content">
            <div class="record-info">
              <van-icon name="clock-o" />
              <span>{{ formatTime(record.checkInTime) }}</span>
            </div>
            <div class="record-info" v-if="record.address">
              <van-icon name="location-o" />
              <span>{{ record.address }}</span>
            </div>
            <div class="record-photo" v-if="record.photoUrl" @click="previewPhoto(record.photoUrl)">
              <van-image
                width="60"
                height="60"
                :src="record.photoUrl"
                fit="cover"
                round
              />
            </div>
            <div class="record-remark" v-if="record.remark">
              备注：{{ record.remark }}
            </div>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>

    <!-- 空状态 -->
    <van-empty v-if="records.length === 0 && !loading" description="暂无签到记录" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { showToast } from 'vant'
import { attendanceApi, type AttendanceRecord } from '@/api/attendance'
import { previewImage } from '@/utils/dingtalk'

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  status: '',
  startDate: '',
  endDate: ''
})

// 状态选项
const statusOptions = [
  { text: '全部状态', value: '' },
  { text: '正常', value: 'NORMAL' },
  { text: '迟到', value: 'LATE' }
]

// 日期范围选项
const dateRange = ref('all')
const dateOptions = [
  { text: '全部时间', value: 'all' },
  { text: '今天', value: 'today' },
  { text: '本周', value: 'week' },
  { text: '本月', value: 'month' }
]

// 签到记录
const records = ref<AttendanceRecord[]>([])

// 分页状态
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

// 预览照片
const previewPhoto = (url: string) => {
  previewImage([url], url)
}

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return '今天'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
}

// 格式化时间
const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 日期范围变化
const onDateChange = () => {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  switch (dateRange.value) {
    case 'today':
      queryParams.startDate = todayStr
      queryParams.endDate = todayStr
      break
    case 'week':
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)
      queryParams.startDate = weekAgo.toISOString().split('T')[0]
      queryParams.endDate = todayStr
      break
    case 'month':
      const monthAgo = new Date(today)
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      queryParams.startDate = monthAgo.toISOString().split('T')[0]
      queryParams.endDate = todayStr
      break
    default:
      queryParams.startDate = ''
      queryParams.endDate = ''
  }

  onSearch()
}

// 搜索
const onSearch = () => {
  queryParams.pageNum = 1
  records.value = []
  finished.value = false
  onLoad()
}

// 加载数据
const onLoad = async () => {
  if (refreshing.value) {
    records.value = []
    refreshing.value = false
  }

  loading.value = true

  try {
    const result = await attendanceApi.myRecords(queryParams)
    const newRecords = result.records || []

    if (queryParams.pageNum === 1) {
      records.value = newRecords
    } else {
      records.value.push(...newRecords)
    }

    // 判断是否加载完成
    if (newRecords.length < queryParams.pageSize) {
      finished.value = true
    } else {
      queryParams.pageNum++
    }
  } catch (error) {
    console.error('加载签到记录失败:', error)
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

// 下拉刷新
const onRefresh = () => {
  queryParams.pageNum = 1
  finished.value = false
  onLoad()
}
</script>

<style scoped>
.records-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.record-item {
  margin: 12px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
}

.record-date {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.record-content {
  padding: 12px 16px;
}

.record-info {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.record-info :deep(.van-icon) {
  margin-right: 6px;
}

.record-photo {
  margin-top: 12px;
  cursor: pointer;
}

.record-remark {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f5f5f5;
  font-size: 13px;
  color: #999;
}
</style>
