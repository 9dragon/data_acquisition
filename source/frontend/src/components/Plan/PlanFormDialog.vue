<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑项目计划' : '创建项目计划'"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="plan-form"
    >
      <!-- 计划名称 -->
      <el-form-item label="计划名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入计划名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <!-- 计划描述 -->
      <el-form-item label="计划描述">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请描述计划的目标、内容等"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <!-- 计划日期范围 -->
      <el-form-item label="计划日期" prop="dateRange">
        <el-date-picker
          v-model="formData.dateRange"
          type="daterange"
          range-separator="~"
          start-placeholder="计划开始日期"
          end-placeholder="计划结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 100%"
          @change="handleDateRangeChange"
        />
      </el-form-item>

      <!-- 所属项目 -->
      <el-form-item label="所属项目" prop="projectId">
        <el-select
          v-model="formData.projectId"
          placeholder="请选择所属项目"
          style="width: 100%"
          clearable
        >
          <el-option
            v-for="project in projectList"
            :key="project.id"
            :label="project.name"
            :value="project.id"
          />
        </el-select>
      </el-form-item>

      <!-- 包含的阶段 -->
      <el-form-item label="包含阶段" prop="selectedStages">
        <div v-if="stagesLoading" class="stage-loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载阶段数据中...</span>
        </div>
        <el-checkbox-group v-else v-model="formData.selectedStages" @change="handleStagesChange">
          <el-row :gutter="8">
            <el-col
              v-for="stage in implementationStages"
              :key="stage.key"
              :span="12"
            >
              <el-checkbox :label="stage.key">
                <span class="stage-label">{{ stage.name }}</span>
                <el-tag size="small" :type="stage.progressMode === 'by_task' ? 'primary' : 'success'" style="margin-left: 8px">
                  {{ stage.progressMode === 'by_task' ? '按任务' : '按设备' }}
                </el-tag>
              </el-checkbox>
            </el-col>
          </el-row>
        </el-checkbox-group>
      </el-form-item>

      <!-- 阶段配置 -->
      <div v-if="formData.selectedStages.length > 0" class="stage-config-section">
        <div class="stage-config-title">阶段配置</div>

        <!-- 总权重指示器 -->
        <div class="total-weight-indicator" :class="{ error: !isWeightValid }">
          <span class="total-weight-label">总权重: {{ totalWeight }}%</span>
          <el-tag :type="isWeightValid ? 'success' : 'danger'" size="small">
            {{ isWeightValid ? '配置正确' : '必须为100%' }}
          </el-tag>
        </div>

        <el-card
          v-for="stageKey in formData.selectedStages"
          :key="stageKey"
          class="stage-config-card"
          shadow="never"
        >
          <template #header>
            <div class="stage-card-header">
              <span class="stage-card-title">{{ getStageLabel(stageKey) }}</span>
              <el-tag size="small" :type="getStageProgressMode(stageKey) === 'by_task' ? 'primary' : 'success'">
                {{ getStageProgressMode(stageKey) === 'by_task' ? '按任务' : '按设备' }}
              </el-tag>
            </div>
          </template>

          <!-- 基础配置区域 -->
          <div class="stage-basic-config-section">
            <div class="section-title">基础配置</div>
            <div class="stage-basic-info">
              <el-row :gutter="16">
                <el-col :span="10">
                  <el-form-item label="阶段权重">
                    <WeightSlider
                      v-model="stageConfigs[stageKey].weight"
                      @change="handleWeightChange"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="14">
                  <el-form-item label="阶段日期">
                    <el-date-picker
                      v-model="stageConfigs[stageKey].dateRange"
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
              </el-row>
              <el-row :gutter="16">
                <el-col :span="10">
                  <el-form-item label="负责人">
                    <el-select
                      v-model="stageConfigs[stageKey].managerId"
                      placeholder="请选择负责人"
                      style="width: 100%"
                      class="stage-select"
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
                  <el-form-item label="参与人">
                    <el-select
                      v-model="stageConfigs[stageKey].participantIds"
                      multiple
                      placeholder="请选择参与人"
                      style="width: 100%"
                      class="stage-select"
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
            </div>
          </div>

          <el-divider />

          <!-- 任务配置 -->
          <TaskConfigList
            :tasks="stageConfigs[stageKey].tasks || []"
            :stage-date-range="stageConfigs[stageKey].dateRange"
            :stage-manager-id="stageConfigs[stageKey].managerId"
            :users="users"
            @update:tasks="handleTasksUpdate(stageKey, $event)"
          />

          <!-- 设备选择（仅by_device阶段） -->
          <template v-if="getStageProgressMode(stageKey) === 'by_device'">
            <el-divider />

            <div class="device-config-section">
              <div class="section-title">设备选择</div>
              <DeviceCascader
                :project-id="formData.projectId"
                v-model="stageConfigs[stageKey].deviceIds"
              />
            </div>
          </template>
        </el-card>
      </div>
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
        <li>阶段日期必须在计划日期范围内</li>
        <li>每个阶段需要设置负责人</li>
        <li>按任务阶段：所有任务完成后该阶段即完成</li>
        <li>按设备阶段：填报时按每个设备的每个任务进行填报和统计</li>
      </ul>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import type { ProjectPlan, ProjectPlanFormData, StageConfig, StageTaskConfig } from '@/types/plan'
import { stageApi, type Stage } from '@/api/stage'
import { http } from '@/api/request'
import { useProjectStore } from '@/stores/project'
import { userApi } from '@/api/user'
import WeightSlider from './WeightSlider.vue'
import TaskConfigList from './TaskConfigList.vue'
import DeviceCascader from './DeviceCascader.vue'

interface Props {
  modelValue: boolean
  plan?: ProjectPlan | null
  projectId?: number
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', data: ProjectPlanFormData): void
}

const props = withDefaults(defineProps<Props>(), {
  projectId: 0
})

const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const loading = ref(false)
const stagesLoading = ref(false)

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.plan?.id)

// 从API获取的实施阶段
const implementationStages = ref<Stage[]>([])

// 用户列表
const users = ref<any[]>([])
// 项目列表
const projectList = ref<any[]>([])
const projectStore = useProjectStore()

// 加载阶段数据
async function loadStages() {
  try {
    stagesLoading.value = true
    const data = await stageApi.getAllStages()
    implementationStages.value = data
  } catch (error) {
    console.error('加载阶段失败:', error)
    ElMessage.error('加载阶段数据失败')
  } finally {
    stagesLoading.value = false
  }
}

// 加载用户列表
async function loadUsers() {
  try {
    users.value = await userApi.getOptions()
  } catch (error) {
    console.error('加载用户失败:', error)
    ElMessage.error('加载用户数据失败')
  }
}

// 加载项目列表
async function loadProjects() {
  try {
    await projectStore.fetchProjectList()
    projectList.value = projectStore.projectList
  } catch (error) {
    console.error('加载项目失败:', error)
    ElMessage.error('加载项目数据失败')
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadStages()
  loadUsers()
  loadProjects()
})

// 表单数据
const formData = reactive({
  name: '',
  description: '',
  dateRange: [] as string[],
  selectedStages: [] as string[],
  projectId: undefined as number | undefined
})

// 阶段配置
const stageConfigs = ref<Record<string, {
  dateRange: string[]
  managerId?: number
  participantIds?: number[]
  weight?: number
  tasks?: StageTaskConfig[]
  deviceIds?: number[]
}>>({})

// 总权重计算
const totalWeight = computed(() => {
  return formData.selectedStages.reduce((sum, stageKey) => {
    return sum + (stageConfigs.value[stageKey]?.weight || 0)
  }, 0)
})

// 权重校验
const isWeightValid = computed(() => totalWeight.value === 100)

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入计划名称', trigger: 'blur' }
  ],
  projectId: [
    { required: true, message: '请选择所属项目', trigger: 'change' }
  ],
  dateRange: [
    { required: true, message: '请选择计划日期', trigger: 'change' }
  ],
  selectedStages: [
    {
      validator: (_rule: any, value: string[], callback: any) => {
        if (!value || value.length === 0) {
          callback(new Error('请至少选择一个阶段'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// 阶段日期验证规则（保留用于显示，实际验证在提交时进行）
const stageDateRules = []

// 获取阶段标签
function getStageLabel(stageKey: string): string {
  const stage = implementationStages.value.find(s => s.key === stageKey)
  return stage?.name || stageKey
}

// 获取阶段推进方式
function getStageProgressMode(stageKey: string): 'by_task' | 'by_device' {
  const stage = implementationStages.value.find(s => s.key === stageKey)
  return stage?.progressMode || 'by_task'
}

// 权重变化处理
function handleWeightChange() {
  // 触发重新计算，无需额外操作
}

// 任务更新处理
function handleTasksUpdate(stageKey: string, tasks: StageTaskConfig[]) {
  if (stageConfigs.value[stageKey]) {
    stageConfigs.value[stageKey].tasks = tasks
  }
}

// 处理日期范围变化
function handleDateRangeChange() {
  // 当计划日期变化时，需要验证阶段日期是否还在范围内
  // 这里简化处理，清空阶段配置
  Object.keys(stageConfigs.value).forEach(key => {
    stageConfigs.value[key].dateRange = []
  })
}

// 监听选中的阶段变化，自动初始化配置
watch(() => [...formData.selectedStages], (newStages, oldStages) => {
  // 添加新选中的阶段配置
  newStages.forEach(stageKey => {
    if (!stageConfigs.value[stageKey]) {
      const stage = implementationStages.value.find(s => s.key === stageKey)
      stageConfigs.value[stageKey] = {
        dateRange: [],
        participantIds: [],
        weight: stage?.defaultWeight || 0,  // 自动带出默认权重
        tasks: stage?.taskTemplates?.map(t => ({  // 自动带出任务模板
          key: t.key,
          name: t.name,
          description: t.description,
          enabled: true,
          startDate: undefined,
          endDate: undefined,
          managerId: undefined
        })) || [],
        deviceIds: []  // 稍后在项目选择后加载
      }
    }
  })
  // 移除未选中的阶段配置
  if (oldStages) {
    oldStages.forEach(stageKey => {
      if (!newStages.includes(stageKey)) {
        delete stageConfigs.value[stageKey]
      }
    })
  }
}, { flush: 'sync', immediate: true })

// 监听阶段配置变化，自动继承日期和负责人到任务
watch(() => stageConfigs.value, (configs) => {
  Object.entries(configs).forEach(([stageKey, config]) => {
    if (config.tasks) {
      config.tasks.forEach(task => {
        // 如果任务没有设置日期，且阶段有日期，则自动继承
        if (!task.startDate && !task.endDate && config.dateRange?.length === 2) {
          task.startDate = config.dateRange[0]
          task.endDate = config.dateRange[1]
        }
        // 如果任务没有设置负责人，且阶段有负责人，则自动继承
        if (!task.managerId && config.managerId) {
          task.managerId = config.managerId
        }
        // 如果任务没有设置参与人，且阶段有参与人，则自动继承
        if ((!task.participantIds || task.participantIds.length === 0) && config.participantIds?.length) {
          task.participantIds = config.participantIds
        }
      })
    }
  })
}, { deep: true })

// 处理阶段选择变化（保留用于兼容）
function handleStagesChange() {
  // 配置初始化现在由 watch 自动处理
}

// 监听项目选择变化，为by_device阶段初始化设备选择
watch(() => formData.projectId, (projectId) => {
  if (projectId) {
    // 为 by_device 阶段初始化设备选择
    formData.selectedStages.forEach(stageKey => {
      const stage = implementationStages.value.find(s => s.key === stageKey)
      if (stage?.progressMode === 'by_device' && !stageConfigs.value[stageKey]?.deviceIds?.length) {
        // 设备选择组件会自动加载并全选设备，这里不需要额外操作
      }
    })
  }
})

// 监听计划变化，填充表单
watch(() => props.plan, (plan) => {
  if (plan) {
    formData.name = plan.name || ''
    formData.description = plan.description || ''
    formData.projectId = plan.projectId
    formData.dateRange = [plan.startDate || '', plan.endDate || '']
    // 从 stagesJson 解析阶段配置
    if (plan.stagesJson) {
      try {
        const stages = JSON.parse(plan.stagesJson)
        formData.selectedStages = stages.map((s: StageConfig) => s.stageKey)
        stages.forEach((s: StageConfig) => {
          const stage = implementationStages.value.find(st => st.key === s.stageKey)
          // 如果有保存的任务，使用保存的；否则使用默认的
          const tasks = s.tasks && s.tasks.length > 0
            ? s.tasks
            : stage?.taskTemplates?.map(t => ({
                key: t.key,
                name: t.name,
                description: t.description,
                enabled: true,
                startDate: undefined,
                endDate: undefined,
                managerId: undefined,
                participantIds: [] as number[]
              })) || []

          stageConfigs.value[s.stageKey] = {
            dateRange: [s.startDate, s.endDate],
            managerId: s.managerId,
            participantIds: s.participantIds,
            weight: s.weight,  // 回显权重
            tasks: tasks,  // 回显任务
            deviceIds: s.deviceIds  // 回显设备选择
          }
        })
      } catch (e) {
        console.error('解析阶段配置失败:', e)
      }
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// 重置表单
function resetForm() {
  formData.name = ''
  formData.description = ''
  formData.dateRange = []
  formData.selectedStages = []
  formData.projectId = undefined
  stageConfigs.value = {}
  formRef.value?.clearValidate()
}

// 提交表单
async function handleSubmit() {
  if (!formRef.value) return

  try {
    // 先验证基础表单
    await formRef.value.validate()

    // 手动验证阶段配置
    if (formData.selectedStages.length === 0) {
      ElMessage.error('请至少选择一个阶段')
      return
    }

    // 验证每个阶段的日期配置
    for (const stageKey of formData.selectedStages) {
      const config = stageConfigs.value[stageKey]
      if (!config || !config.dateRange || config.dateRange.length !== 2) {
        const stageName = getStageLabel(stageKey)
        ElMessage.error(`请选择${stageName}的日期`)
        return
      }

      // 验证阶段日期在计划日期范围内
      if (formData.dateRange && formData.dateRange.length === 2) {
        const [stageStart, stageEnd] = config.dateRange
        const [planStart, planEnd] = formData.dateRange
        const stageStartDate = new Date(stageStart).getTime()
        const stageEndDate = new Date(stageEnd).getTime()
        const planStartDate = new Date(planStart).getTime()
        const planEndDate = new Date(planEnd).getTime()

        if (stageStartDate < planStartDate || stageEndDate > planEndDate) {
          const stageName = getStageLabel(stageKey)
          ElMessage.error(`${stageName}的日期必须在计划日期范围内`)
          return
        }
      }
    }

    loading.value = true

    // 验证总权重
    if (totalWeight.value !== 100) {
      ElMessage.error(`总权重必须为100%，当前为${totalWeight.value}%`)
      loading.value = false
      return
    }

    // 构建阶段数据
    const stages: StageConfig[] = formData.selectedStages.map(stageKey => {
      const config = stageConfigs.value[stageKey]
      const stage = implementationStages.value.find(s => s.key === stageKey)
      return {
        stageKey,
        startDate: config.dateRange[0],
        endDate: config.dateRange[1],
        managerId: config.managerId,
        participantIds: config.participantIds || [],
        weight: config.weight,  // 新增
        tasks: config.tasks?.filter(t => t.enabled),  // 新增：只提交启用的任务
        deviceIds: stage?.progressMode === 'by_device' ? config.deviceIds : undefined  // 新增
      }
    })

    const submitData: ProjectPlanFormData = {
      id: props.plan?.id,
      projectId: formData.projectId!,
      name: formData.name,
      description: formData.description,
      startDate: formData.dateRange[0],
      endDate: formData.dateRange[1],
      stages
    }

    emit('submit', submitData)
    dialogVisible.value = false
    resetForm()
  } catch (error: any) {
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
.stage-config-section {
  margin-top: 16px;
}

.stage-config-title {
  font-weight: 500;
  margin-bottom: 12px;
  color: #303133;
}

.total-weight-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 16px;
}

.total-weight-indicator.error {
  background: #fef0f0;
  border: 1px solid #fbc4c4;
}

.total-weight-label {
  font-size: 14px;
  font-weight: 500;
}

.stage-config-card {
  margin-bottom: 12px;
  overflow: visible;
}

.stage-config-card :deep(.el-card__body) {
  overflow: visible;
  pointer-events: auto;
}

.stage-config-card:last-child {
  margin-bottom: 0;
}

.stage-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.stage-card-title {
  font-weight: 500;
}

.stage-label {
  font-size: 14px;
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

.stage-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
  font-size: 14px;
}

.stage-loading .el-icon {
  font-size: 16px;
}

/* 确保弹框内容可溢出显示 */
:deep(.el-dialog__body) {
  overflow: visible;
}

.stage-config-section {
  overflow: visible;
}

.stage-config-card {
  overflow: visible;
}

.stage-config-card :deep(.el-card__body) {
  overflow: visible;
}

.stage-basic-config-section {
  margin-bottom: 16px;
  overflow: visible;
}

.device-config-section {
  margin-top: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 12px;
}

.stage-basic-info {
  padding: 16px;
  background: #fafafa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  overflow: visible;
}

.stage-basic-info :deep(.el-row) {
  overflow: visible;
  display: flex;
  margin-left: -8px !important;
  margin-right: -8px !important;
}

.stage-basic-info :deep(.el-row + .el-row) {
  margin-top: 16px;
}

.stage-basic-info :deep(.el-col) {
  overflow: visible;
  padding-left: 0 !important;
}

.stage-basic-info :deep(.el-form-item) {
  display: flex;
  align-items: center;
}

.stage-basic-info :deep(.el-form-item__label) {
  width: 70px !important;
  flex-shrink: 0;
  padding-right: 8px !important;
}

.stage-basic-info :deep(.el-form-item__content) {
  display: flex;
  justify-content: flex-start;
  margin-left: 0;
}

.stage-basic-info :deep(.el-form-item__label) {
  width: 70px !important;
  flex-shrink: 0;
  padding-right: 8px !important;
}

.stage-basic-info .stage-select {
  width: 100%;
}

.stage-basic-info :deep(.el-form-item) {
  margin-bottom: 12px;
  overflow: visible;
  display: flex;
  align-items: center;
}

.stage-basic-info :deep(.el-form-item__content) {
  overflow: visible;
  margin-left: 0;
}

.stage-basic-info .el-form-item:last-child {
  margin-bottom: 0;
}

/* 修复权重滑块组件被覆盖的问题 */
.stage-basic-info .el-form-item {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
}

.stage-basic-info :deep(.el-form-item__label) {
  width: 70px !important;
  flex-shrink: 0;
  padding-right: 8px !important;
}

.stage-basic-info .stage-select {
  width: 100%;
}

.stage-basic-info :deep(.el-form-item__content) {
  overflow: visible;
  margin-left: 0;
}
</style>
