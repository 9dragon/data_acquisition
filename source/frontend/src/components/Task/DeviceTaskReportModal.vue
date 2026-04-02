<template>
  <el-dialog
    v-model="visible"
    title="设备任务填报"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="设备名称">
        <el-input v-model="taskData.deviceName" disabled />
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
      <el-form-item label="任务名称">
        <el-input v-model="taskData.taskName" disabled />
      </el-form-item>
      <el-form-item label="开始日期">
        <el-date-picker
          v-model="formData.startDate"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          placeholder="自动记录或手动选择"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="完成状态" prop="completed">
        <el-switch
          v-model="formData.completed"
          active-text="已完成"
          inactive-text="未完成"
          @change="handleCompletedChange"
        />
      </el-form-item>
      <el-form-item v-if="formData.completed" label="完成日期">
        <el-date-picker
          v-model="formData.completedDate"
          type="datetime"
          placeholder="选择完成日期"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息"
        />
      </el-form-item>

      <!-- 资料收集 -->
      <el-form-item label="任务资料">
        <div class="materials-section">
          <el-empty
            v-if="!materialRequirements || materialRequirements.length === 0"
            description="暂无资料需求"
            :image-size="80"
          />
          <div v-else class="materials-list">
            <div
              v-for="req in materialRequirements"
              :key="req.key"
              class="material-item"
            >
              <div class="material-header">
                <span class="material-name">
                  <el-tag v-if="req.required" type="danger" size="small">必填</el-tag>
                  {{ req.name }}
                </span>
                <el-tag :type="getMaterialStatus(req).type" size="small">
                  {{ getMaterialStatus(req).text }}
                </el-tag>
              </div>
              <div class="material-desc">{{ req.description }}</div>
              <MediaUpload
                v-model="materialsMap[req.key]"
                :file-type="req.fileType"
                :max-count="req.maxCount || 5"
                @change="handleMaterialChange(req.key)"
              />
            </div>
          </div>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useTaskStore } from '@/stores/task'
import { ImplementationStageMap, type DeviceTask, type TaskMaterialItem } from '@/types/task'
import type { MaterialRequirement } from '@/api/stage'
import MediaUpload from '@/components/MediaUpload.vue'

interface Props {
  modelValue: boolean
  taskData: DeviceTask | null
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
  completed: false,
  startDate: '',
  completedDate: '',
  remark: ''
})

const materialsMap = ref<Record<string, TaskMaterialItem>>({})

const formRules = {}

// 模拟资料需求数据（实际应从阶段配置中获取）
const materialRequirements = ref<MaterialRequirement[]>([
  {
    key: 'photo',
    name: '现场照片',
    description: '上传任务完成后的现场照片',
    fileType: 'image',
    required: true,
    minCount: 1,
    maxCount: 5
  },
  {
    key: 'document',
    name: '验收文档',
    description: '上传任务验收文档',
    fileType: 'document',
    required: false,
    minCount: 0,
    maxCount: 3
  }
])

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
    if (val && props.taskData) {
      formData.completed = props.taskData.completed || false
      formData.startDate = props.taskData.startDate || ''
      formData.completedDate = props.taskData.completedDate || ''
      formData.remark = props.taskData.remark || ''

      // 初始化资料数据
      if (props.taskData.materialsList) {
        props.taskData.materialsList.forEach(item => {
          materialsMap.value[item.requirementKey] = item
        })
      }
    }
  }
)

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const getStageLabel = (stageKey: string) => {
  return ImplementationStageMap[stageKey]?.label || stageKey
}

const getStageTagType = (stageKey: string): 'primary' | 'success' | 'warning' | 'info' => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
    preparation: 'primary',
    construction: 'success',
    configuration: 'warning',
    verification: 'info'
  }
  return typeMap[stageKey] || 'info'
}

const getMaterialStatus = (req: MaterialRequirement) => {
  const material = materialsMap.value[req.key]
  if (!material || !material.files || material.files.length === 0) {
    return { type: 'info', text: '未上传' }
  }
  if (material.completed) {
    return { type: 'success', text: '已完成' }
  }
  const count = material.files.length
  if (req.minCount && count < req.minCount) {
    return { type: 'warning', text: `数量不足 (${count}/${req.minCount})` }
  }
  return { type: 'success', text: `已上传 (${count})` }
}

const handleCompletedChange = (completed: boolean) => {
  if (completed && !formData.completedDate) {
    formData.completedDate = new Date().toISOString().slice(0, 19).replace('T', ' ')
  }
}

const handleMaterialChange = (key: string) => {
  // 资料变化时的处理
}

const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
  materialsMap.value = {}
}

const buildMaterialsList = (): TaskMaterialItem[] => {
  return Object.entries(materialsMap.value).map(([key, material]) => ({
    requirementKey: key,
    requirementName: material.requirementName,
    files: material.files || [],
    completed: material.completed || false,
    completedDate: material.completedDate
  }))
}

const handleSubmit = async () => {
  try {
    submitting.value = true

    const updateData = {
      completed: formData.completed,
      startDate: formData.startDate,
      completedDate: formData.completedDate,
      remark: formData.remark,
      materials: buildMaterialsList()
    }

    await taskStore.updateDeviceTaskProgress(props.taskData!.id, updateData)

    ElMessage.success('填报成功')
    emit('refresh')
    handleClose()
  } catch (error) {
    console.error('填报失败:', error)
    ElMessage.error('填报失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.materials-section {
  width: 100%;

  .materials-list {
    .material-item {
      padding: 12px;
      margin-bottom: 12px;
      border: 1px solid #ebeef5;
      border-radius: 4px;

      &:last-child {
        margin-bottom: 0;
      }

      .material-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .material-name {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }
      }

      .material-desc {
        font-size: 12px;
        color: #909399;
        margin-bottom: 12px;
      }
    }
  }
}
</style>
