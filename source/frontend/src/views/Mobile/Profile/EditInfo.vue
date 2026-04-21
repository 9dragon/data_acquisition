<template>
  <div class="edit-info-page">
    <van-form @submit="handleSubmit" class="edit-form">
      <van-cell-group inset>
        <van-field
          v-model="formData.name"
          label="姓名"
          placeholder="请输入姓名"
          :rules="[{ required: true, message: '请输入姓名' }]"
        />
        <van-field
          v-model="formData.phone"
          label="手机号"
          placeholder="请输入手机号"
          :rules="[
            { required: true, message: '请输入手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
          ]"
        />
        <van-field
          v-model="formData.email"
          label="邮箱"
          placeholder="请输入邮箱"
          :rules="[
            { pattern: /^[\w.-]+@[\w.-]+\.\w+$/, message: '邮箱格式不正确' }
          ]"
        />
      </van-cell-group>

      <div class="submit-section">
        <van-button
          type="primary"
          size="large"
          round
          block
          :loading="submitting"
          native-type="submit"
        >
          保存
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { authApi } from '@/api/auth'
import { userApi } from '@/api/user'

const router = useRouter()

const submitting = ref(false)

const formData = reactive({
  name: '',
  phone: '',
  email: ''
})

const loadUserInfo = async () => {
  try {
    const userInfo = await authApi.getUserInfo()
    formData.name = userInfo.name || ''
    formData.phone = userInfo.phone || ''
    formData.email = userInfo.email || ''
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

const handleSubmit = async () => {
  submitting.value = true
  showLoadingToast({
    message: '提交中...',
    forbidClick: true,
    duration: 0
  })

  try {
    await userApi.updateProfile({
      name: formData.name,
      phone: formData.phone,
      email: formData.email
    })
    closeToast()
    showToast('保存成功')
    setTimeout(() => {
      router.back()
    }, 1500)
  } catch (error: any) {
    closeToast()
    showToast(error.message || '保存失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.edit-info-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 16px;
}

.edit-form {
  height: 100%;
}

.submit-section {
  margin-top: 24px;
  padding: 0 16px;
}
</style>