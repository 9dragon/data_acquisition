<template>
  <div class="info-page">
    <van-cell-group inset>
      <van-cell title="用户名" :value="userInfo.username" />
      <van-cell title="姓名" :value="userInfo.name" />
      <van-cell title="工号" :value="userInfo.jobNumber" />
      <van-cell title="手机号" :value="userInfo.phone" />
      <van-cell title="邮箱" :value="userInfo.email" />
    </van-cell-group>

    <div class="action-section">
      <van-button type="primary" size="large" round block @click="handleEdit">
        编辑信息
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()

const userInfo = ref({
  username: 'zhangsan',
  name: '张三',
  jobNumber: 'E001',
  phone: '138****8888',
  email: 'zhangsan@example.com'
})

const handleEdit = () => {
  showToast('编辑功能开发中...')
}
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
