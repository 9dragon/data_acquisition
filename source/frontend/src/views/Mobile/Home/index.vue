<template>
  <div class="mobile-home">
    <!-- 今日签到状态 -->
    <div class="today-status">
      <div class="status-card" :class="{ checked: todayChecked }">
        <div class="status-icon">
          <van-icon :name="todayChecked ? 'checked' : 'location-o'" size="40" />
        </div>
        <div class="status-text">
          <div class="status-title">{{ todayChecked ? '今日已签到' : '今日未签到' }}</div>
          <div class="status-time">{{ todayCheckTime || '--:--' }}</div>
        </div>
        <van-button
          v-if="!todayChecked"
          type="primary"
          size="small"
          round
          @click="goToCheckIn"
        >
          立即签到
        </van-button>
      </div>
    </div>

    <!-- 功能菜单 -->
    <div class="menu-grid">
      <div
        v-for="action in quickActions"
        :key="action.label"
        class="menu-item"
        @click="goToPath(action.path)"
      >
        <van-icon :name="action.icon" :color="action.color" size="32" />
        <span>{{ action.label }}</span>
      </div>
    </div>

    <!-- 待办事项 -->
    <div class="todo-section">
      <van-cell-group inset title="待办事项">
        <van-cell center>
          <template #title>
            <span class="todo-count">{{ todoCount }}</span> 待处理任务
          </template>
          <template #right-icon>
            <van-icon name="arrow" />
          </template>
        </van-cell>
        <van-cell center>
          <template #title>
            <span class="todo-count warning">{{ issueCount }}</span> 待处理问题
          </template>
          <template #right-icon>
            <van-icon name="arrow" />
          </template>
        </van-cell>
      </van-cell-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { attendanceApi } from '@/api/attendance'
import { mobileTaskApi } from '@/api/task'
import { mobileIssueApi } from '@/api/issue'
import { navigateWithFullScreen } from '@/utils/routerHelper'

const router = useRouter()

// 今日签到状态
const todayChecked = ref(false)
const todayCheckTime = ref('')

// 待办数量
const todoCount = ref(0)
const issueCount = ref(0)

// 快捷入口配置
const quickActions = ref([
  {
    icon: 'location-o',
    color: '#1989fa',
    label: '签到',
    path: '/mobile/attendance/check-in'
  },
  {
    icon: 'notes-o',
    color: '#ff976a',
    label: '调研',
    path: '/mobile/research/list'
  },
  {
    icon: 'apps-o',
    color: '#07c160',
    label: '任务',
    path: '/mobile/task/list'
  },
  {
    icon: 'chat-o',
    color: '#ee0a24',
    label: '问题',
    path: '/mobile/issue/list'
  }
])

// 跳转路径
const goToPath = (path: string) => {
  navigateWithFullScreen(router, path)
}

// 去签到
const goToCheckIn = () => {
  navigateWithFullScreen(router, '/mobile/attendance/check-in')
}

// 检查今日签到
const checkTodayAttendance = async () => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const result = await attendanceApi.myRecords({
      startDate: today,
      endDate: today,
      pageNum: 1,
      pageSize: 1
    })

    if (result.records && result.records.length > 0) {
      todayChecked.value = true
      const record = result.records[0]
      const time = new Date(record.checkInTime)
      todayCheckTime.value = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`
    }
  } catch (error) {
    console.error('检查签到状态失败:', error)
  }
}

// 获取待办数量
const fetchTodoCount = async () => {
  try {
    // 获取待处理任务数量
    const taskResult = await mobileTaskApi.myTasks({
      status: 'pending',
      pageNum: 1,
      pageSize: 1
    })
    todoCount.value = taskResult.total || 0

    // 获取待处理问题数量
    const issueResult = await mobileIssueApi.myList({
      status: 'open',
      pageNum: 1,
      pageSize: 1
    })
    issueCount.value = issueResult.total || 0
  } catch (error) {
    console.error('获取待办数量失败:', error)
  }
}

// 初始化
onMounted(async () => {
  showLoadingToast({
    message: '加载中...',
    forbidClick: true,
    duration: 500
  })

  try {
    // 检查今日签到
    await checkTodayAttendance()

    // 获取待办数量
    await fetchTodoCount()
  } catch (error) {
    console.error('初始化失败:', error)
  } finally {
    closeToast()
  }
})
</script>

<style scoped>
.mobile-home {
  padding: 16px;
}

.today-status {
  margin-bottom: 16px;
}

.status-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-card.checked {
  background: linear-gradient(135deg, #07c160 0%, #3ad068 100%);
  color: #fff;
}

.status-icon {
  margin-right: 16px;
}

.status-text {
  flex: 1;
}

.status-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 4px;
}

.status-time {
  font-size: 14px;
  opacity: 0.8;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 16px 8px;
  cursor: pointer;
}

.menu-item span {
  margin-top: 8px;
  font-size: 12px;
  color: #333;
}

.todo-section {
  margin-bottom: 16px;
}

.todo-count {
  display: inline-block;
  min-width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  background: #1989fa;
  color: #fff;
  border-radius: 10px;
  padding: 0 6px;
  font-size: 12px;
  margin-right: 8px;
}

.todo-count.warning {
  background: #ff976a;
}
</style>
