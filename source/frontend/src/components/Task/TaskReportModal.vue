<template>
  <el-dialog
    v-model="visible"
    title="任务填报"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="任务名称">
        <el-input v-model="taskData.name" disabled />
      </el-form-item>
      <el-form-item label="项目">
        <el-input v-model="taskData.projectName" disabled />
      </el-form-item>
      <el-form-item label="阶段">
        <el-tag :type="getStageTagType(taskData.stageKey)" size="small">
          {{ taskData.stageName || getStageLabel(taskData.stageKey) }}
        </el-tag>
      </el-form-item>
      <el-form-item label="负责人">
        <el-input v-model="taskData.managerName" disabled />
      </el-form-item>
      <el-form-item label="参与人">
        <el-input v-model="taskData.participantNames" disabled />
      </el-form-item>
      <el-form-item label="任务状态" prop="status">
        <el-select 
          v-model="formData.status" 
          placeholder="请选择状态"
          :disabled="isCompleted"
          @change="handleStatusChange"
        >
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            :disabled="item.value === 'cancelled' && isCompleted"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="完成进度" prop="progress">
        <el-slider
          v-model="formData.progress"
          :marks="progressMarks"
          :disabled="isCompleted"
          @change="handleProgressChange"
        />
      </el-form-item>
      <el-form-item label="实际开始日期">
        <el-date-picker
          v-model="formData.actualStartDate"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          placeholder="自动记录或手动选择"
          :disabled="isCompleted"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="实际完成日期">
        <el-date-picker
          v-model="formData.actualEndDate"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          placeholder="自动记录或手动选择"
          :disabled="isCompleted || formData.status !== 'completed'"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="备注" class="remark-item">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息"
          :disabled="isCompleted"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" :disabled="isCompleted" @click="handleSubmit">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useTaskStore } from '@/stores/task'
import type { ProjectTaskListItem, ProjectTaskUpdateDTO } from '@/types/task'

interface Props {
  modelValue: boolean
  taskData: ProjectTaskListItem | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const taskStore = useTaskStore()

const visible = ref(false)
const formRef = ref()
const submitting = ref(false)

const formData = reactive({
  status: 'pending',
  progress: 0,
  actualStartDate: '',
  actualEndDate: '',
  remark: ''
})

const isCompleted = computed(() => {
  return props.taskData?.status === 'completed'
})

const formRules = {
  status: [{ required: true, message: '请选择任务状态', trigger: 'change' }]
}

const statusOptions = [
  { label: '未开始', value: 'pending' },
  { label: '进行中', value: 'in_progress' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
]

const progressMarks = {
  0: '0%',
  50: '50%',
  100: '100%'
}

// 进度变化时自动联动状态
const handleProgressChange = (value: number) => {
  if (isCompleted.value) return
  
  if (value === 0) {
    formData.status = 'pending'
  } else if (value === 100) {
    formData.status = 'completed'
  } else if (value > 0 && formData.status === 'pending') {
    formData.status = 'in_progress'
  }
}

// 状态变化时自动联动进度
const handleStatusChange = (value: string) => {
  if (isCompleted.value) return
  
  if (value === 'pending') {
    formData.progress = 0
  } else if (value === 'completed') {
    formData.progress = 100
  } else if (value === 'in_progress' && formData.progress === 0) {
    formData.progress = 10
  }
}

// 获取阶段标签类型
const getStageTagType = (stageKey: string): 'primary' | 'success' | 'warning' | 'info' => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
    preparation: 'primary',
    construction: 'success',
    configuration: 'warning',
    verification: 'info'
  }
  return typeMap[stageKey] || 'info'
}

// 获取阶段标签文字
const getStageLabel = (stageKey: string): string => {
  const labelMap: Record<string, string> = {
    preparation: '准备阶段',
    construction: '施工阶段',
    configuration: '配置阶段',
    verification: '核对阶段'
  }
  return labelMap[stageKey] || stageKey
}

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
    if (val && props.taskData) {
      formData.status = props.taskData.status || 'pending'
      formData.progress = props.taskData.progress || 0
      formData.actualStartDate = props.taskData.actualStartDate || ''
      formData.actualEndDate = props.taskData.actualEndDate || ''
      formData.remark = ''
    }
  }
)

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  if (isCompleted.value) {
    ElMessage.warning('已完成的任务不能修改')
    return
  }

  try {
    await formRef.value?.validate()
    submitting.value = true

    // 如果标记为完成，自动设置进度为100%
    if (formData.status === 'completed') {
      formData.progress = 100
    }

    const updateData: ProjectTaskUpdateDTO = {
      status: formData.status,
      progress: formData.progress
    }

    // 只在有值时才传递实际日期
    if (formData.actualStartDate) {
      updateData.actualStartDate = formData.actualStartDate
    }
    if (formData.actualEndDate) {
      updateData.actualEndDate = formData.actualEndDate
    }
    if (formData.remark) {
      updateData.remark = formData.remark
    }

    await taskStore.updateProjectTaskProgress(props.taskData!.id, updateData)

    ElMessage.success('填报成功')
    emit('refresh')
    handleClose()
  } catch (error) {
    console.error('填报失败:', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
:deep(.el-slider__marks-text) {
  font-size: 12px;
}

:deep(.el-form-item.remark-item) {
  margin-top: 20px;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}
</style>
