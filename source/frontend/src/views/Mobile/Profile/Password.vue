<template>
  <div class="password-page">
    <van-form @submit="handleSubmit" class="password-form">
      <van-cell-group inset>
        <van-field
          v-model="formData.oldPassword"
          type="password"
          label="旧密码"
          placeholder="请输入旧密码"
          :rules="[{ required: true, message: '请输入旧密码' }]"
        />
        <van-field
          v-model="formData.newPassword"
          type="password"
          label="新密码"
          placeholder="请输入新密码（6位以上）"
          :rules="[
            { required: true, message: '请输入新密码' },
            { pattern: /^[^\s]{6,}$/, message: '密码至少6位' }
          ]"
        />
        <van-field
          v-model="formData.confirmPassword"
          type="password"
          label="确认密码"
          placeholder="请再次输入新密码"
          :rules="[
            { required: true, message: '请确认新密码' },
            { validator: validateConfirm, message: '两次输入密码不一致' }
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
          保存修改
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { authApi } from '@/api/auth'

const router = useRouter()

const submitting = ref(false)

const formData = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirm = (value: string) => {
  return value === formData.newPassword
}

const handleSubmit = async () => {
  if (formData.newPassword !== formData.confirmPassword) {
    showToast('两次输入密码不一致')
    return
  }

  submitting.value = true
  showLoadingToast({
    message: '提交中...',
    forbidClick: true,
    duration: 0
  })

  try {
    await authApi.changePassword({
      oldPassword: formData.oldPassword,
      newPassword: formData.newPassword
    })
    closeToast()
    showToast('密码修改成功')
    setTimeout(() => {
      router.back()
    }, 1500)
  } catch (error: any) {
    closeToast()
    showToast(error.message || '修改失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.password-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 16px;
}

.password-form {
  height: 100%;
}

.submit-section {
  margin-top: 24px;
  padding: 0 16px;
}
</style>