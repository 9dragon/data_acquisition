<template>
  <div class="mobile-home">
    <!-- 用户信息卡片 -->
    <div class="user-card">
      <div class="user-avatar">
        <van-image
          round
          width="60"
          height="60"
          :src="userInfo.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/user-active.png'"
        />
      </div>
      <div class="user-info">
        <div class="user-name">{{ userInfo.name || '未登录' }}</div>
        <div class="user-role">{{ userInfo.role || '项目成员' }}</div>
      </div>
    </div>

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
      <div class="menu-item" @click="goToPath('/mobile/attendance/check-in')">
        <van-icon name="location-o" color="#1989fa" size="32" />
        <span>打卡签到</span>
      </div>
      <div class="menu-item" @click="goToPath('/mobile/task/list')">
        <van-icon name="apps-o" color="#07c160" size="32" />
        <span>我的任务</span>
      </div>
      <div class="menu-item" @click="goToPath('/mobile/issue/list')">
        <van-icon name="chat-o" color="#ff976a" size="32" />
        <span>问题管理</span>
      </div>
      <div class="menu-item" @click="goToPath('/mobile/attendance/records')">
        <van-icon name="records" color="#ee0a24" size="32" />
        <span>签到记录</span>
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

const router = useRouter()

// 用户信息
const userInfo = ref({
  name: '',
  avatar: '',
  role: ''
})

// 今日签到状态
const todayChecked = ref(false)
const todayCheckTime = ref('')

// 待办数量
const todoCount = ref(0)
const issueCount = ref(0)

// 跳转路径
const goToPath = (path: string) => {
  router.push(path)
}

// 去签到
const goToCheckIn = () => {
  router.push('/mobile/attendance/check-in')
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
    // TODO: 从store获取用户信息
    userInfo.value = {
      name: '项目成员',
      avatar: '',
      role: '项目成员'
    }

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

.user-card {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #1989fa 0%, #40a9ff 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  color: #fff;
}

.user-avatar {
  margin-right: 16px;
}

.user-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
}

.user-role {
  font-size: 14px;
  opacity: 0.9;
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
