<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-alert
      v-if="isSystemStage"
      type="warning"
      title="系统内置阶段不支持编辑"
      description="如需修改，请联系管理员"
      :closable="false"
      style="margin-bottom: 16px"
    />
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="阶段标识" prop="key">
        <el-input
          v-model="form.key"
          placeholder="请输入阶段标识，如：preparation"
          :disabled="isSystemStage"
        />
      </el-form-item>

      <el-form-item label="阶段名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入阶段名称" :disabled="isSystemStage" />
      </el-form-item>

      <el-form-item label="阶段描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入阶段描述"
          :disabled="isSystemStage"
        />
      </el-form-item>

      <el-form-item label="推进方式" prop="progressMode">
        <el-radio-group v-model="form.progressMode" :disabled="isSystemStage">
          <el-radio value="by_task">按任务推进</el-radio>
          <el-radio value="by_device">按设备推进</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="默认权重" prop="defaultWeight">
        <WeightSlider
          v-model="form.defaultWeight"
          :min="0"
          :max="100"
          :step="5"
          :disabled="isSystemStage"
        />
      </el-form-item>

      <el-form-item label="显示颜色" prop="color">
        <el-radio-group v-model="form.color" :disabled="isSystemStage">
          <el-radio-button
            v-for="color in colorOptions"
            :key="color.value"
            :label="color.value"
          >
            <span
              class="color-option"
              :style="{ backgroundColor: color.value }"
            />
            {{ color.label }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="显示图标" prop="icon">
        <el-select v-model="form.icon" placeholder="选择图标" :disabled="isSystemStage">
          <el-option label="项目" value="FolderOpened" />
          <el-option label="同步" value="Refresh" />
          <el-option label="时钟" value="Clock" />
          <el-option label="完成" value="CircleCheck" />
          <el-option label="设置" value="Setting" />
          <el-option label="工具" value="Tools" />
          <el-option label="火箭" value="Promotion" />
          <el-option label="闪电" value="Sunny" />
          <el-option label="实验" value="Operation" />
          <el-option label="数据" value="DataBoard" />
        </el-select>
      </el-form-item>

      <!-- 任务模板配置 -->
      <el-divider content-position="left">任务模板配置</el-divider>

      <div class="task-actions">
        <el-button type="dashed" @click="handleAddTask" :disabled="isSystemStage">
          <el-icon><Plus /></el-icon>
          添加任务
        </el-button>
      </div>

      <div v-if="form.taskTemplates.length === 0" class="empty-tasks">
        暂无任务，请点击上方按钮添加
      </div>

      <el-collapse v-else v-model="activeTaskNames" class="task-list">
        <el-collapse-item
          v-for="(task, index) in form.taskTemplates"
          :key="task.id"
          :name="index"
        >
          <template #title>
            <div class="task-header">
              <span class="task-name">{{ task.name || '未命名任务' }}</span>
              <el-tag size="small" type="info">
                {{ task.materialRequirements?.length || 0 }} 项资料
              </el-tag>
            </div>
          </template>
          <template #extra>
            <el-button
              type="danger"
              circle
              size="small"
              @click.stop="handleDeleteTask(index)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>

          <!-- 任务基本信息 -->
          <div class="task-basic-info">
            <el-form-item label="任务名称">
              <el-input v-model="task.name" placeholder="请输入任务名称" />
            </el-form-item>
            <el-form-item label="任务标识">
              <el-input v-model="task.key" placeholder="请输入任务标识，如：install" />
            </el-form-item>
            <el-form-item label="任务描述">
              <el-input
                v-model="task.description"
                type="textarea"
                :rows="2"
                placeholder="请输入任务描述"
              />
            </el-form-item>
          </div>

          <!-- 资料需求 -->
          <el-divider content-position="left" style="margin: 12px 0; font-size: 12px">
            资料需求
          </el-divider>
          <el-button
            type="dashed"
            size="small"
            @click="() => handleAddMaterialRequirement(index)"
          >
            <el-icon><Plus /></el-icon>
            添加资料需求
          </el-button>

          <div v-if="!task.materialRequirements || task.materialRequirements.length === 0" class="empty-materials">
            暂无资料需求
          </div>

          <div v-else class="material-list">
            <div
              v-for="(req, reqIndex) in task.materialRequirements"
              :key="reqIndex"
              class="material-item"
            >
              <div class="material-header">
                <span>资料需求 {{ reqIndex + 1 }}</span>
                <el-button
                  type="danger"
                  circle
                  size="small"
                  @click="handleDeleteMaterialRequirement(index, reqIndex)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              <div class="material-fields">
                <el-form-item label="资料名称">
                  <el-input v-model="req.name" placeholder="如：安装前照片" size="small" />
                </el-form-item>
                <el-form-item label="资料类型">
                  <el-select v-model="req.fileType" size="small">
                    <el-option label="图片" value="image" />
                    <el-option label="视频" value="video" />
                    <el-option label="文档" value="document" />
                    <el-option label="表格" value="spreadsheet" />
                    <el-option label="CAD图纸" value="cad" />
                    <el-option label="其他" value="other" />
                  </el-select>
                </el-form-item>
                <el-form-item label="是否必填">
                  <el-switch v-model="req.required" />
                </el-form-item>
                <el-form-item label="数量范围">
                  <el-input-number v-model="req.minCount" :min="1" :max="99" size="small" />
                  <span style="margin: 0 4px">-</span>
                  <el-input-number v-model="req.maxCount" :min="1" :max="99" size="small" />
                </el-form-item>
              </div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">{{ isSystemStage ? '关闭' : '取消' }}</el-button>
      <el-button
        v-if="!isSystemStage"
        type="primary"
        :loading="loading"
        @click="handleConfirm"
      >
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import {
  FolderOpened,
  Refresh,
  Clock,
  CircleCheck,
  Setting,
  Tools,
  Promotion,
  Sunny,
  Operation,
  DataBoard,
  Plus,
  Delete
} from '@element-plus/icons-vue'
import { stageApi, type Stage } from '@/api/stage'
import WeightSlider from '@/components/Plan/WeightSlider.vue'

// 任务模板接口
interface TaskTemplate {
  id: string
  key: string
  name: string
  description?: string
  defaultWeight: number
  materialRequirements?: MaterialRequirement[]
}

// 资料需求接口
interface MaterialRequirement {
  key: string
  name: string
  description?: string
  fileType: string
  required: boolean
  minCount: number
  maxCount: number
}

interface Props {
  visible: boolean
  stage?: Stage | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const loading = ref(false)
const activeTaskNames = ref<number[]>([])

const isEdit = computed(() => !!props.stage?.id)

const isSystemStage = computed(() => props.stage?.isSystem === 1)

const dialogTitle = computed(() => {
  if (!isEdit.value) return '创建阶段'
  return props.stage?.isSystem === 1 ? '查看阶段（系统内置）' : '编辑阶段'
})

const form = reactive({
  key: '',
  name: '',
  description: '',
  progressMode: 'by_task' as 'by_task' | 'by_device',
  defaultWeight: 20,
  color: '#409EFF',
  icon: 'FolderOpened',
  taskTemplates: [] as TaskTemplate[]
})

const rules: FormRules = {
  key: [
    { required: true, message: '请输入阶段标识', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在2到50个字符', trigger: 'blur' },
    { pattern: /^[a-z_][a-z0-9_]*$/, message: '只能包含小写字母、数字和下划线，且以字母或下划线开头', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入阶段名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在2到50个字符', trigger: 'blur' }
  ],
  progressMode: [
    { required: true, message: '请选择推进方式', trigger: 'change' }
  ]
}

// 颜色选项
const colorOptions = [
  { value: '#409EFF', label: '蓝色' },
  { value: '#67C23A', label: '绿色' },
  { value: '#E6A23C', label: '橙色' },
  { value: '#F56C6C', label: '红色' },
  { value: '#909399', label: '灰色' },
  { value: '#C0392B', label: '深红' },
  { value: '#8E44AD', label: '紫色' },
  { value: '#2980B9', label: '深蓝' },
  { value: '#16A085', label: '青色' },
  { value: '#D35400', label: '深橙' },
  { value: '#2C3E50', label: '深灰' },
  { value: '#F39C12', label: '金色' }
]

// 生成唯一ID
const generateId = () => `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// 生成资料ID
const generateMaterialId = () => `material_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// 添加任务
const handleAddTask = () => {
  form.taskTemplates.push({
    id: generateId(),
    key: `task_${form.taskTemplates.length + 1}`,
    name: `新任务 ${form.taskTemplates.length + 1}`,
    description: '',
    defaultWeight: 10,
    materialRequirements: []
  })
  activeTaskNames.value = [form.taskTemplates.length - 1]
}

// 删除任务
const handleDeleteTask = (index: number) => {
  form.taskTemplates.splice(index, 1)
  // 更新激活的面板索引
  const activeIndex = activeTaskNames.value.indexOf(index)
  if (activeIndex !== -1) {
    activeTaskNames.value.splice(activeIndex, 1)
  }
}

// 添加资料需求
const handleAddMaterialRequirement = (taskIndex: number) => {
  const task = form.taskTemplates[taskIndex]
  if (!task.materialRequirements) {
    task.materialRequirements = []
  }
  task.materialRequirements.push({
    key: generateMaterialId(),
    name: '',
    fileType: 'image',
    required: true,
    minCount: 1,
    maxCount: 5
  })
}

// 删除资料需求
const handleDeleteMaterialRequirement = (taskIndex: number, reqIndex: number) => {
  const task = form.taskTemplates[taskIndex]
  if (task.materialRequirements) {
    task.materialRequirements.splice(reqIndex, 1)
  }
}

const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    key: '',
    name: '',
    description: '',
    progressMode: 'by_task',
    defaultWeight: 20,
    color: '#409EFF',
    icon: 'FolderOpened',
    taskTemplates: []
  })
  activeTaskNames.value = []
  formRef.value?.clearValidate()
}

// 监听stage变化，填充表单
watch(() => props.stage, (newStage) => {
  if (newStage) {
    Object.assign(form, {
      key: newStage.key || '',
      name: newStage.name || '',
      description: newStage.description || '',
      progressMode: newStage.progressMode || 'by_task',
      defaultWeight: newStage.defaultWeight || 20,
      color: newStage.color || '#409EFF',
      icon: newStage.icon || 'FolderOpened'
    })
    // 深拷贝任务模板
    if (newStage.taskTemplates && newStage.taskTemplates.length > 0) {
      form.taskTemplates = newStage.taskTemplates.map(task => ({
        ...task,
        materialRequirements: task.materialRequirements ? [...task.materialRequirements] : []
      }))
    } else {
      form.taskTemplates = []
    }
  } else {
    resetForm()
  }
}, { immediate: true })

const handleClose = () => {
  visible.value = false
  resetForm()
}

const handleConfirm = async () => {
  if (!formRef.value) return

  // 系统内置阶段不支持编辑
  if (isEdit.value && props.stage?.isSystem === 1) {
    ElMessage.warning('系统内置阶段，不支持编辑，请联系管理员')
    return
  }

  try {
    await formRef.value.validate()

    // 验证任务模板
    if (form.taskTemplates.length === 0) {
      ElMessage.warning('请至少添加一个任务')
      return
    }

    // 验证每个任务
    for (let i = 0; i < form.taskTemplates.length; i++) {
      const task = form.taskTemplates[i]
      if (!task.name || !task.name.trim()) {
        ElMessage.warning(`请填写第 ${i + 1} 个任务的名称`)
        return
      }
      if (!task.key || !task.key.trim()) {
        ElMessage.warning(`请填写第 ${i + 1} 个任务的标识`)
        return
      }
    }

    loading.value = true

    const submitData = {
      key: form.key,
      name: form.name,
      description: form.description,
      progressMode: form.progressMode,
      defaultWeight: form.defaultWeight,
      color: form.color,
      icon: form.icon,
      taskTemplates: form.taskTemplates
    }

    if (isEdit.value && props.stage) {
      await stageApi.updateStage(props.stage.id, submitData)
      ElMessage.success('更新成功')
    } else {
      await stageApi.createStage(submitData)
      ElMessage.success('创建成功')
    }

    emit('success')
    handleClose()
  } catch (error: any) {
    if (error?.message) {
      ElMessage.error(error.message)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.color-option {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 2px;
  margin-right: 4px;
  vertical-align: middle;
}

.task-actions {
  margin-bottom: 12px;
}

.empty-tasks {
  padding: 24px;
  text-align: center;
  color: #999;
  background: #fafafa;
  border-radius: 4px;
}

.task-list {
  margin-top: 12px;
}

.task-header {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.task-name {
  font-weight: 500;
}

.task-basic-info {
  padding: 12px 0;
}

.task-basic-info .el-form-item {
  margin-bottom: 12px;
}

.material-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.material-item {
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
}

.material-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 500;
}

.material-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.material-fields .el-form-item {
  margin-bottom: 0;
}

.empty-materials {
  padding: 12px;
  text-align: center;
  color: #999;
  font-size: 12px;
}
</style>
