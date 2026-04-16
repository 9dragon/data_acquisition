<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="700px"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="问题标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入问题标题" :disabled="isView" />
      </el-form-item>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="问题类型" prop="type">
            <el-select v-model="form.type" placeholder="请选择" style="width: 100%" :disabled="isView">
              <el-option v-for="opt in ISSUE_TYPE_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="优先级" prop="priority">
            <el-select v-model="form.priority" placeholder="请选择" style="width: 100%" :disabled="isView">
              <el-option v-for="opt in ISSUE_PRIORITY_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="所属项目" prop="projectId">
            <el-select v-model="form.projectId" placeholder="请选择" style="width: 100%" :disabled="isView" @change="handleProjectChange">
              <el-option v-for="p in projectOptions" :key="p.id" :label="p.name" :value="p.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="关联设备">
            <el-select v-model="form.deviceId" placeholder="请选择" style="width: 100%" :disabled="isView" clearable>
              <el-option v-for="d in deviceOptions" :key="d.id" :label="d.name" :value="d.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="负责人" prop="assigneeId">
        <el-select v-model="form.assigneeId" placeholder="请选择" style="width: 100%" :disabled="isView" clearable>
          <el-option v-for="u in userOptions" :key="u.id" :label="u.name" :value="u.id" />
        </el-select>
      </el-form-item>

      <el-form-item label="期望解决时间">
        <el-date-picker
          v-model="form.dueDate"
          type="date"
          placeholder="请选择日期"
          style="width: 100%"
          value-format="YYYY-MM-DD"
          :disabled="isView"
        />
      </el-form-item>

      <el-form-item label="问题描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="5" placeholder="请输入问题描述" :disabled="isView" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button v-if="!isView" type="primary" @click="handleSubmit" :loading="submitting">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { issueApi } from '@/api/issue'
import type { Issue } from '@/types/issue'
import { ISSUE_TYPE_OPTIONS, ISSUE_PRIORITY_OPTIONS } from '@/types/issue'
import { http } from '@/api/request'
import { projectApi } from '@/api/project'
import { deviceApi } from '@/api/device'
import { userApi } from '@/api/user'

const props = defineProps<{
  modelValue: boolean
  data?: Issue | null
  mode: 'create' | 'edit' | 'view'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: []
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const isView = computed(() => props.mode === 'view')

const dialogTitle = computed(() => {
  if (isView.value) return '问题详情'
  return props.mode === 'create' ? '新建问题' : '编辑问题'
})

const formRef = ref()
const submitting = ref(false)

const form = ref({
  title: '',
  type: 'other',
  priority: 'medium',
  projectId: undefined as number | undefined,
  deviceId: undefined as number | undefined,
  assigneeId: undefined as number | undefined,
  dueDate: '',
  description: ''
})

const rules = {
  title: [{ required: true, message: '请输入问题标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择问题类型', trigger: 'change' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
  projectId: [{ required: true, message: '请选择所属项目', trigger: 'change' }]
}

const projectOptions = ref<{ id: number; name: string }[]>([])
const deviceOptions = ref<{ id: number; name: string }[]>([])
const userOptions = ref<{ id: number; name: string }[]>([])

watch(() => props.data, (val) => {
  if (val) {
    form.value = {
      title: val.title,
      type: val.type,
      priority: val.priority,
      projectId: val.projectId,
      deviceId: val.deviceId,
      assigneeId: val.assigneeId,
      dueDate: val.dueDate || '',
      description: val.description || ''
    }
    if (val.projectId) {
      loadDevices(val.projectId)
    }
  } else {
    resetForm()
  }
}, { immediate: true })

watch(() => props.modelValue, (v) => {
  if (v) {
    loadProjects()
    loadUsers()
  }
})

onMounted(() => {
  loadProjects()
  loadUsers()
})

async function loadProjects() {
  try {
    projectOptions.value = await projectApi.getOptions()
  } catch (e) {
    console.error('加载项目失败', e)
  }
}

async function loadDevices(projectId: number) {
  try {
    deviceOptions.value = await deviceApi.getOptions({ projectId })
  } catch (e) {
    console.error('加载设备失败', e)
  }
}

async function loadUsers() {
  try {
    userOptions.value = await userApi.getOptions()
  } catch (e) {
    console.error('加载用户失败', e)
  }
}

function handleProjectChange(projectId: number) {
  form.value.deviceId = undefined
  if (projectId) {
    loadDevices(projectId)
  }
}

function resetForm() {
  form.value = {
    title: '',
    type: 'other',
    priority: 'medium',
    projectId: undefined,
    deviceId: undefined,
    assigneeId: undefined,
    dueDate: '',
    description: ''
  }
}

function handleClose() {
  visible.value = false
}

async function handleSubmit() {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      if (props.mode === 'create') {
        await issueApi.create(form.value as any)
        ElMessage.success('创建成功')
      } else {
        await issueApi.update(props.data!.id, form.value)
        ElMessage.success('更新成功')
      }
      emit('success')
      handleClose()
    } catch (e) {
      console.error('保存失败', e)
    } finally {
      submitting.value = false
    }
  })
}
</script>
