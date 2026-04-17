<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="600px"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名" :disabled="isEdit" />
      </el-form-item>

      <el-form-item v-if="!isEdit" label="密码" prop="password">
        <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
      </el-form-item>

      <el-form-item label="姓名" prop="name">
        <el-input v-model="form.name" placeholder="请输入姓名" />
      </el-form-item>

      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号" />
      </el-form-item>

      <el-form-item label="公司" prop="company">
        <el-input v-model="form.company" placeholder="请输入公司" />
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { userApi, type User } from '@/api/user'

const visible = ref(false)
const submitting = ref(false)
const formRef = ref()
const currentMode = ref<'create' | 'edit'>('create')
const currentUserId = ref<number>()

const form = reactive<{
  username: string
  password: string
  name: string
  phone: string
  email: string
  company: string
}>({
  username: '',
  password: '',
  name: '',
  phone: '',
  email: '',
  company: ''
})

const isEdit = computed(() => currentMode.value === 'edit')
const dialogTitle = computed(() => isEdit.value ? '编辑用户' : '新增用户')

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { pattern: /^[\w.-]+@[\w.-]+\.\w+$/, message: '请输入正确的邮箱', trigger: 'blur' }
  ]
}

function open(mode: 'create' | 'edit' = 'create', user?: User) {
  visible.value = true
  currentMode.value = mode
  if (mode === 'edit' && user) {
    currentUserId.value = user.id
    form.username = user.username || ''
    form.name = user.name || ''
    form.phone = user.phone || ''
    form.email = user.email || ''
    form.company = user.company || ''
    form.password = ''
  } else {
    currentUserId.value = undefined
    form.username = ''
    form.password = ''
    form.name = ''
    form.phone = ''
    form.email = ''
    form.company = ''
  }
}

function handleClose() {
  visible.value = false
  formRef.value?.resetFields()
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (isEdit.value && currentUserId.value) {
      const data: Partial<User> = {
        name: form.name,
        phone: form.phone || undefined,
        email: form.email || undefined,
        company: form.company || undefined
      }
      await userApi.update(currentUserId.value, data)
      ElMessage.success('编辑用户成功')
    } else {
      const data: Omit<User, 'id'> = {
        username: form.username,
        password: form.password,
        name: form.name,
        phone: form.phone || undefined,
        email: form.email || undefined,
        company: form.company || undefined,
        source: 0
      }
      await userApi.create(data)
      ElMessage.success('新增用户成功')
    }
    handleClose()
    emit('success')
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

const emit = defineEmits<{
  success: []
}>()

defineExpose({ open })
</script>
