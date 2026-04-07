<template>
  <div class="mobile-login">
    <!-- Logo区域 -->
    <div class="login-logo">
      <div class="logo-icon">
        <van-icon name="apps-o" size="60" color="#1989fa" />
      </div>
      <h1>数据采集系统</h1>
      <p class="logo-subtitle">工业数据采集项目管理</p>
    </div>

    <!-- 钉钉环境：显示钉钉登录按钮 -->
    <div v-if="dingtalkStore.isDingTalkEnv" class="dingtalk-login">
      <van-button
        type="primary"
        size="large"
        block
        :loading="loading"
        icon="dingtalk-o"
        @click="handleDingTalkLogin"
      >
        钉钉一键登录
      </van-button>
    </div>

    <!-- 分割线 -->
    <div v-if="dingtalkStore.isDingTalkEnv" class="divider">
      <span>或使用账号密码登录</span>
    </div>

    <!-- 账号密码登录表单 -->
    <van-form @submit="handlePasswordLogin" class="login-form">
      <van-cell-group inset>
        <van-field
          v-model="loginForm.username"
          name="username"
          label="账号"
          placeholder="请输入账号"
          clearable
          :rules="[{ required: true, message: '请输入账号' }]"
        >
          <template #left-icon>
            <van-icon name="user-o" />
          </template>
        </van-field>
        <van-field
          v-model="loginForm.password"
          name="password"
          type="password"
          label="密码"
          placeholder="请输入密码"
          clearable
          :rules="[{ required: true, message: '请输入密码' }]"
        >
          <template #left-icon>
            <van-icon name="lock" />
          </template>
        </van-field>
      </van-cell-group>

      <div class="login-button">
        <van-button
          type="primary"
          size="large"
          block
          :loading="loading"
          native-type="submit"
        >
          登录
        </van-button>
      </div>
    </van-form>

    <!-- 底部提示 -->
    <div class="login-footer">
      <p>默认账号：admin / admin123</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { useDingTalkStore } from '@/stores/dingtalk'
import { useUserStore } from '@/stores/user'
import { authApi } from '@/api/auth'
import { getDefaultRoute } from '@/utils/device'
import { navigateWithFullScreen } from '@/utils/routerHelper'

const router = useRouter()
const route = useRoute()
const dingtalkStore = useDingTalkStore()
const userStore = useUserStore()

const loading = ref(false)

const loginForm = reactive({
  username: 'admin',
  password: 'admin123'
})

// 钉钉登录
const handleDingTalkLogin = async () => {
  loading.value = true
  try {
    const success = await dingtalkStore.auth()
    if (success) {
      // 登录成功，跳转到默认路由
      const redirectPath = route.query.redirect as string
      const targetPath = redirectPath || getDefaultRoute()
      navigateWithFullScreen(router, targetPath)
    }
  } catch (error: any) {
    showToast(error.message || '钉钉登录失败')
  } finally {
    loading.value = false
  }
}

// 账号密码登录
const handlePasswordLogin = async () => {
  loading.value = true
  try {
    const response = await authApi.login({
      username: loginForm.username,
      password: loginForm.password
    })

    // 保存token和用户信息
    userStore.setToken(response.token)
    userStore.setUserInfo(response.user)

    showToast('登录成功')

    // 跳转到默认路由
    const redirectPath = route.query.redirect as string
    const targetPath = redirectPath || getDefaultRoute()
    navigateWithFullScreen(router, targetPath)
  } catch (error: any) {
    showToast(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}

// 初始化钉钉环境
onMounted(async () => {
  await dingtalkStore.init()
})
</script>

<style scoped>
.mobile-login {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.login-logo {
  text-align: center;
  margin-bottom: 40px;
  margin-top: 40px;
}

.logo-icon {
  margin-bottom: 16px;
}

.login-logo h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
  color: #fff;
}

.logo-subtitle {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.dingtalk-login {
  margin-bottom: 20px;
}

.divider {
  display: flex;
  align-items: center;
  margin: 20px 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.3);
}

.divider span {
  padding: 0 16px;
}

.login-form {
  flex: 1;
}

:deep(.van-cell-group) {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  overflow: hidden;
}

:deep(.van-field) {
  padding: 16px;
}

.login-button {
  margin-top: 20px;
}

.login-footer {
  text-align: center;
  margin-top: 30px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
}

.login-footer p {
  margin: 0;
}
</style>
