<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑任务' : '创建任务'"
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
      <!-- 任务推进方式 -->
      <el-form-item label="推进方式" prop="taskMode">
        <el-radio-group v-model="formData.taskMode">
          <el-radio value="task">按任务推进</el-radio>
          <el-radio value="device">按设备推进</el-radio>
        </el-radio-group>
        <div class="form-tip">
          按任务推进：与具体设备无关的任务（如整体规划、协调工作等）
          按设备推进：需要针对每台设备单独完成的任务
        </div>
      </el-form-item>

      <!-- 任务名称 -->
      <el-form-item label="任务名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入任务名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <!-- 任务描述 -->
      <el-form-item label="任务描述">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请描述任务的具体内容、目标和交付物"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-row :gutter="16">
        <!-- 所属阶段 -->
        <el-col :span="12">
          <el-form-item label="所属阶段" prop="stageKey">
            <el-select
              v-model="formData.stageKey"
              placeholder="请选择阶段"
              style="width: 100%"
            >
              <el-option
                v-for="stage in implementationStages"
                :key="stage.key"
                :label="stage.label"
                :value="stage.key"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <!-- 任务状态 -->
        <el-col :span="12">
          <el-form-item label="任务状态" prop="status">
            <el-select
              v-model="formData.status"
              placeholder="请选择状态"
              style="width: 100%"
              :disabled="formData.taskMode === 'device'"
            >
              <el-option
                v-for="status in taskStatusOptions"
                :key="status.key"
                :label="status.label"
                :value="status.key"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 设备选择（仅按设备推进时显示） -->
      <el-form-item v-if="formData.taskMode === 'device'" label="关联设备" prop="deviceIds">
        <el-select
          v-model="formData.deviceIds"
          multiple
          placeholder="请选择关联的设备"
          style="width: 100%"
          filterable
          :loading="devicesLoading"
          clearable
        >
          <el-option
            v-for="device in deviceList"
            :key="device.id"
            :label="`${device.name} (${device.code})`"
            :value="device.id"
          >
            <span>{{ device.name }}</span>
            <span style="color: #8492a6; font-size: 12px; margin-left: 8px">{{ device.code }}</span>
          </el-option>
        </el-select>
        <div class="form-tip">选择需要完成此任务的设备</div>
      </el-form-item>

      <!-- 计划时间（仅按任务推进时显示） -->
      <el-form-item v-if="formData.taskMode === 'task'" label="计划时间" prop="dateRange">
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

      <!-- 负责人（仅按任务推进时显示） -->
      <el-form-item v-if="formData.taskMode === 'task'" label="负责人">
        <el-select
          v-model="formData.assigneeIds"
          multiple
          placeholder="请选择负责人"
          style="width: 100%"
        >
          <el-option
            v-for="user in mockUsers"
            :key="user.id"
            :label="user.name"
            :value="user.id"
          />
        </el-select>
      </el-form-item>

      <!-- 完成进度（仅按任务推进时显示） -->
      <el-form-item v-if="formData.taskMode === 'task'" label="完成进度">
        <el-slider
          v-model="formData.progress"
          :min="0"
          :max="100"
          :marks="{ 0: '0%', 50: '50%', 100: '100%' }"
        />
      </el-form-item>

      <!-- 任务依赖（仅按任务推进时显示） -->
      <el-form-item v-if="formData.taskMode === 'task' && allTasks.length > 0" label="依赖任务">
        <el-checkbox-group v-model="formData.dependencyIds">
          <el-checkbox
            v-for="task in availableDependencies"
            :key="task.id"
            :label="task.id"
          >
            {{ task.name }}
          </el-checkbox>
        </el-checkbox-group>
        <div class="form-tip">此任务开始前需要完成的任务</div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        {{ isEdit ? '保存' : '创建' }}
      </el-button>
    </template>

    <!-- 提示信息 -->
    <div class="dialog-tip">
      <div class="tip-title">💡 提示</div>
      <ul class="tip-list">
        <li>任务创建后会添加到对应的项目计划中</li>
        <li>阶段进度会根据该阶段所有任务自动计算</li>
        <li>设置依赖关系可以确保任务按顺序执行</li>
      </ul>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { http } from '@/api/request'
import type { ProjectPlanTask, ProjectPlanTaskFormData } from '@/types/task'
import { TaskStatusMap, ImplementationStageMap } from '@/types/task'

interface Props {
  modelValue: boolean
  task?: ProjectPlanTask | null
  projectId: number
  allTasks?: ProjectPlanTask[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', data: ProjectPlanTaskFormData | { taskMode: string; deviceIds: number[] }): void
}

const props = withDefaults(defineProps<Props>(), {
  allTasks: () => []
})

const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const loading = ref(false)

// 设备列表
const deviceList = ref<any[]>([])
const devicesLoading = ref(false)

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.task?.id)

// 实施阶段选项
const implementationStages = computed(() => {
  return Object.entries(ImplementationStageMap).map(([key, value]) => ({
    key,
    label: value.label
  }))
})

// 任务状态选项
const taskStatusOptions = computed(() => {
  return Object.entries(TaskStatusMap).map(([key, value]) => ({
    key,
    label: value.label
  }))
})

// 可选的依赖任务（排除当前任务）
const availableDependencies = computed(() => {
  return props.allTasks.filter(t => t.id !== props.task?.id)
})

// 模拟用户数据
const mockUsers = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' },
  { id: 4, name: '赵六' }
])

// 表单数据
const formData = reactive({
  taskMode: 'task', // 任务推进方式：task=按任务推进, device=按设备推进
  name: '',
  description: '',
  stageKey: '' as any,
  status: 'pending' as any,
  dateRange: [] as string[],
  assigneeIds: [] as number[],
  progress: 0,
  dependencyIds: [] as number[],
  deviceIds: [] as number[]  // 按设备推进时的设备ID列表
})

// 表单验证规则
const formRules: FormRules = {
  taskMode: [
    { required: true, message: '请选择推进方式', trigger: 'change' }
  ],
  name: [
    { required: true, message: '请输入任务名称', trigger: 'blur' }
  ],
  stageKey: [
    { required: true, message: '请选择所属阶段', trigger: 'change' }
  ],
  status: [
    {
      required: true,
      validator: (rule, value, callback) => {
        // 按设备推进时不需要选择状态
        if (formData.taskMode === 'device') {
          callback()
        } else if (!value) {
          callback(new Error('请选择任务状态'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  deviceIds: [
    {
      required: true,
      validator: (rule, value, callback) => {
        if (formData.taskMode === 'device' && (!value || value.length === 0)) {
          callback(new Error('请选择关联设备'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  dateRange: [
    {
      required: true,
      validator: (rule, value, callback) => {
        // 按设备推进时不需要选择时间
        if (formData.taskMode === 'device') {
          callback()
        } else if (!value || value.length === 0) {
          callback(new Error('请选择计划时间'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// 加载项目设备列表
async function loadProjectDevices() {
  if (!props.projectId) {
    console.log('没有projectId，跳过加载设备列表')
    return
  }

  devicesLoading.value = true
  try {
    console.log('正在加载项目设备列表，projectId:', props.projectId)
    const response = await http.get<any>('/devices', {
      params: { projectId: props.projectId, pageSize: 1000 }
    })
    console.log('设备列表响应:', response)
    deviceList.value = response.records || []
    console.log('设备列表数据:', deviceList.value)
    if (deviceList.value.length === 0) {
      console.warn('该项目下没有设备')
    }
  } catch (error) {
    console.error('加载设备列表失败:', error)
    ElMessage.warning('加载设备列表失败，请稍后重试')
  } finally {
    devicesLoading.value = false
  }
}

// 监听任务变化，填充表单
watch(() => props.task, (task) => {
  if (task) {
    formData.taskMode = 'task'  // 编辑时默认按任务推进
    formData.name = task.name
    formData.description = task.description || ''
    formData.stageKey = task.stageKey
    formData.status = task.status
    formData.dateRange = [task.startDate, task.endDate]
    formData.progress = task.progress
    formData.assigneeIds = task.assigneeIds
      ? task.assigneeIds.split(',').map(Number)
      : []
    formData.dependencyIds = task.dependencyIds
      ? task.dependencyIds.split(',').map(Number)
      : []
    formData.deviceIds = []
  } else {
    resetForm()
  }
}, { immediate: true })

// 重置表单
function resetForm() {
  formData.taskMode = 'task'
  formData.name = ''
  formData.description = ''
  formData.stageKey = ''
  formData.status = 'pending'
  formData.dateRange = []
  formData.assigneeIds = []
  formData.progress = 0
  formData.dependencyIds = []
  formData.deviceIds = []
  formRef.value?.clearValidate()
}

// 组件挂载时加载设备列表
onMounted(() => {
  loadProjectDevices()
})

// 监听对话框打开状态，打开时重新加载设备列表
watch(() => props.modelValue, (isOpen) => {
  if (isOpen && props.projectId) {
    loadProjectDevices()
  }
})

// 监听projectId变化
watch(() => props.projectId, (newProjectId) => {
  if (newProjectId && props.modelValue) {
    loadProjectDevices()
  }
})

// 提交表单
async function handleSubmit() {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    // 按设备推进的任务
    if (formData.taskMode === 'device') {
      // 为每个选中的设备创建一个设备任务
      const submitData = {
        taskMode: 'device',
        projectId: props.projectId,
        stageKey: formData.stageKey,
        taskKey: `device-task-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        deviceIds: formData.deviceIds
      }
      emit('submit', submitData)
    } else {
      // 按任务推进的项目计划任务
      const submitData: ProjectPlanTaskFormData = {
        id: props.task?.id,
        projectId: props.projectId,
        stageKey: formData.stageKey,
        taskKey: `task-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        status: formData.status,
        startDate: formData.dateRange[0],
        endDate: formData.dateRange[1],
        progress: formData.progress,
        assigneeIds: formData.assigneeIds,
        dependencyIds: formData.dependencyIds
      }
      emit('submit', submitData)
    }

    dialogVisible.value = false
    resetForm()
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    loading.value = false
  }
}

// 关闭对话框
function handleClose() {
  resetForm()
}
</script>

<style scoped>
.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.dialog-tip {
  padding: 12px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 4px;
  margin-top: 16px;
}

.tip-title {
  font-size: 12px;
  color: #52c41a;
  margin-bottom: 4px;
}

.tip-list {
  margin: 0;
  padding-left: 16px;
  font-size: 12px;
  color: #666;
}

.tip-list li {
  margin-bottom: 4px;
}
</style>
