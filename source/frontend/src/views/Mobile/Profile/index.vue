<template>
  <div class="profile-page">
    <!-- 用户信息 -->
    <div class="user-header">
      <div class="user-avatar" @click="handleClick('avatar')">
        <van-image
          round
          width="70"
          height="70"
          :src="userInfo.avatar || defaultAvatar"
        />
        <van-icon name="photograph" class="avatar-edit" />
      </div>
      <div class="user-name">{{ userInfo.name || '未登录' }}</div>
      <div class="user-meta">
        <span v-if="userInfo.jobNumber">工号: {{ userInfo.jobNumber }}</span>
        <span v-if="userInfo.phone">{{ userInfo.phone }}</span>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-section">
      <div class="stat-item" @click="goToPath('/mobile/attendance/records')">
        <div class="stat-value">{{ stats.attendanceDays }}</div>
        <div class="stat-label">签到天数</div>
      </div>
      <div class="stat-item" @click="goToPath('/mobile/task/list')">
        <div class="stat-value">{{ stats.taskCount }}</div>
        <div class="stat-label">我的任务</div>
      </div>
      <div class="stat-item" @click="goToPath('/mobile/issue/list')">
        <div class="stat-value">{{ stats.issueCount }}</div>
        <div class="stat-label">我的问题</div>
      </div>
    </div>

    <!-- 功能菜单 -->
    <van-cell-group title="账户设置" inset>
      <van-cell title="个人信息" is-link @click="handleClick('info')">
        <template #icon>
          <van-icon name="user-o" color="#1989fa" />
        </template>
      </van-cell>
      <van-cell title="修改密码" is-link @click="handleClick('password')">
        <template #icon>
          <van-icon name="lock" color="#ff976a" />
        </template>
      </van-cell>
    </van-cell-group>

    <van-cell-group title="其他" inset>
      <van-cell title="系统设置" is-link @click="handleClick('settings')">
        <template #icon>
          <van-icon name="setting-o" color="#07c160" />
        </template>
      </van-cell>
      <van-cell title="关于我们" is-link @click="handleClick('about')">
        <template #icon>
          <van-icon name="info-o" color="#969799" />
        </template>
      </van-cell>
      <van-cell title="版本信息" :value="appVersion">
        <template #icon>
          <van-icon name="label-o" color="#ee0a24" />
        </template>
      </van-cell>
    </van-cell-group>

    <!-- 退出登录 -->
    <div class="logout-section">
      <van-button type="danger" size="large" round @click="handleLogout" plain>
        退出登录
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 默认头像
const defaultAvatar = 'https://fastly.jsdelivr.net/npm/@vant/assets/user-active.png'

// 应用版本
const appVersion = ref('v1.0.0')

// 用户信息
const userInfo = ref({
  name: '',
  avatar: '',
  phone: '',
  jobNumber: '',
  role: ''
})

// 统计信息
const stats = ref({
  attendanceDays: 0,
  taskCount: 0,
  issueCount: 0
})

// 跳转路径
const goToPath = (path: string) => {
  router.push(path)
}

// 菜单点击
const handleClick = (type: string) => {
  switch (type) {
    case 'info':
      router.push('/profile/info')
      break
    case 'avatar':
      showToast('头像功能开发中...')
      break
    case 'password':
      router.push('/profile/password')
      break
    case 'settings':
      router.push('/profile/settings')
      break
    case 'about':
      router.push('/profile/about')
      break
    default:
      showToast('功能开发中...')
  }
}

// 退出登录
const handleLogout = () => {
  showConfirmDialog({
    title: '提示',
    message: '确定要退出登录吗？'
  }).then(() => {
    // 清除token
    localStorage.removeItem('token')
    userStore.logout()
    showToast('已退出登录')
    // 跳转到登录页
    router.push('/login')
  }).catch(() => {
    // 取消
  })
}

// 加载用户信息
onMounted(async () => {
  try {
    // 获取用户信息
    // const user = await userStore.fetchUserInfo()
    // userInfo.value = user

    // 临时数据
    userInfo.value = {
      name: '项目成员',
      avatar: '',
      phone: '138****8888',
      jobNumber: 'E001',
      role: '项目成员'
    }

    // 获取统计信息
    stats.value = {
      attendanceDays: 15,
      taskCount: 8,
      issueCount: 3
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
  }
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.user-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #1989fa 0%, #40a9ff 100%);
  color: #fff;
  margin-bottom: 16px;
}

.user-avatar {
  position: relative;
  cursor: pointer;
}

.avatar-edit {
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  padding: 4px;
}

.user-name {
  font-size: 20px;
  font-weight: bold;
  margin-top: 12px;
}

.user-meta {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  font-size: 13px;
  opacity: 0.9;
}

.stats-section {
  display: flex;
  justify-content: space-around;
  background: #fff;
  margin: 0 16px 16px;
  border-radius: 12px;
  padding: 20px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #1989fa;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #666;
}

:deep(.van-cell-group) {
  margin-bottom: 12px;
}

:deep(.van-cell__left-icon) {
  margin-right: 12px;
  font-size: 18px;
}

.logout-section {
  padding: 24px 16px 40px;
}
</style>
