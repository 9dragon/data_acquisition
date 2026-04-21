<template>
  <div class="info-page">
    <van-cell-group inset>
      <van-cell title="用户名" :value="userInfo.username || '-'" />
      <van-cell title="姓名" :value="userInfo.name || '-'" />
      <van-cell title="工号" :value="userInfo.jobNumber || '-'" />
      <van-cell title="手机号" :value="userInfo.phone || '-'" />
      <van-cell title="邮箱" :value="userInfo.email || '-'" />
    </van-cell-group>

    <div class="action-section">
      <van-button type="primary" size="large" round block @click="handleEdit">
        编辑信息
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '@/api/auth'
import { navigateWithFullScreen } from '@/utils/routerHelper'

const router = useRouter()

const userInfo = ref<{
  username: string
  name: string
  jobNumber: string
  phone: string
  email: string
}>({
  username: '',
  name: '',
  jobNumber: '',
  phone: '',
  email: ''
})

const handleEdit = () => {
  navigateWithFullScreen(router, '/mobile/profile/edit-info')
}

onMounted(async () => {
  try {
    const info = await authApi.getUserInfo()
    userInfo.value = {
      username: info.username || '',
      name: info.name || '',
      jobNumber: info.jobNumber || '',
      phone: info.phone || '',
      email: info.email || ''
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
})
</script>

<style scoped>
.info-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 16px;
}

.action-section {
  margin-top: 24px;
}
</style>