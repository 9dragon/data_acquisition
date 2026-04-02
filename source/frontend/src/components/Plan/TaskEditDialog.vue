<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑任务' : '添加任务'"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="任务名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入任务名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="任务描述">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入任务描述"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="14">
          <el-form-item label="任务日期">
            <el-date-picker
              v-model="formData.dateRange"
              type="daterange"
              range-separator="~"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-form-item label="任务负责人">
            <el-select
              v-model="formData.managerId"
              placeholder="请选择负责人"
              style="width: 100%"
              clearable
            >
              <el-option
                v-for="user in users"
                :key="user.id"
                :label="user.name"
                :value="user.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="14">
          <el-form-item label="任务参与人">
            <el-select
              v-model="formData.participantIds"
              multiple
              placeholder="请选择参与人"
              style="width: 100%"
              clearable
            >
              <el-option
                v-for="user in users"
                :key="user.id"
                :label="user.name"
                :value="user.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { StageTaskConfig } from '@/types/plan'

interface Props {
  modelValue: boolean
  task?: StageTaskConfig | null
  stageDateRange?: string[]      // 阶段日期范围
  stageManagerId?: number        // 阶段负责人ID
  users?: any[]                  // 用户列表
}

interface Emits {
  'update:modelValue': [value: boolean]
  'confirm': [task: StageTaskConfig]
}

const props = withDefaults(defineProps<Props>(), {
  stageDateRange: () => [],
  users: () => []
})

const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.task?.key && props.task.key.startsWith('task_') === false)

const formData = reactive({
  name: '',
  description: '',
  dateRange: [] as string[],
  managerId: undefined as number | undefined,
  participantIds: [] as number[]
})

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入任务名称', trigger: 'blur' }
  ]
}

function resetForm() {
  formData.name = ''
  formData.description = ''
  formData.dateRange = props.stageDateRange ? [...props.stageDateRange] : []
  formData.managerId = props.stageManagerId
  formData.participantIds = []
  formRef.value?.clearValidate()
}

watch(() => props.task, (task) => {
  if (task) {
    formData.name = task.name
    formData.description = task.description || ''
    // 如果任务有日期，使用任务的日期；否则使用阶段的日期
    formData.dateRange = task.startDate && task.endDate
      ? [task.startDate, task.endDate]
      : props.stageDateRange ? [...props.stageDateRange] : []
    // 如果任务有负责人，使用任务的负责人；否则使用阶段的负责人
    formData.managerId = task.managerId ?? props.stageManagerId
    // 如果任务有参与人，使用任务的参与人；否则使用空数组
    formData.participantIds = task.participantIds || []
  } else {
    resetForm()
  }
}, { immediate: true })

function handleClose() {
  visible.value = false
  resetForm()
}

function handleConfirm() {
  if (!formRef.value) return

  formRef.value.validate((valid) => {
    if (valid) {
      const task: StageTaskConfig = {
        key: props.task?.key || `task_${Date.now()}`,
        name: formData.name,
        description: formData.description,
        enabled: props.task?.enabled ?? true,
        startDate: formData.dateRange?.[0],
        endDate: formData.dateRange?.[1],
        managerId: formData.managerId,
        participantIds: formData.participantIds
      }
      emit('confirm', task)
      visible.value = false
      resetForm()
    }
  })
}
</script>

<style scoped>
</style>
