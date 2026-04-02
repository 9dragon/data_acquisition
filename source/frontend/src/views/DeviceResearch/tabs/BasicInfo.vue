<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    label-width="100px"
    :disabled="disabled"
  >
    <el-form-item label="项目名称" prop="projectName">
      <el-select
        v-model="formData.projectName"
        placeholder="请选择项目名称"
        filterable
        allow-clear
        @change="handleProjectChange"
      >
        <el-option
          v-for="project in projects"
          :key="project.id"
          :label="project.name"
          :value="project.id"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="所属车间" prop="workshop">
      <el-select
        v-model="formData.workshop"
        placeholder="请选择所属车间"
        filterable
        allow-clear
      >
        <el-option
          v-for="item in workshopOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="设备类型" prop="deviceType">
      <el-select
        v-model="formData.deviceType"
        placeholder="请选择设备类型"
        filterable
        allow-clear
      >
        <el-option
          v-for="item in deviceTypeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="数量" prop="quantity">
      <el-input-number
        v-model="formData.quantity"
        :min="1"
        :max="9999"
        :step="1"
        style="width: 100%"
      />
    </el-form-item>

    <el-form-item label="设备厂商" prop="deviceManufacturer">
      <el-select
        v-model="formData.deviceManufacturer"
        placeholder="请选择或输入设备厂商"
        filterable
        allow-create
        allow-clear
      >
        <el-option
          v-for="item in manufacturerOptions"
          :key="item"
          :label="item"
          :value="item"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="备注" prop="remarks">
      <el-input
        v-model="formData.remarks"
        type="textarea"
        :rows="4"
        placeholder="请输入备注信息"
        maxlength="500"
        show-word-limit
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { DeviceResearchBasic } from '@/types/device'
import type { Project } from '@/types/project'

interface Props {
  initialValues?: DeviceResearchBasic
  onSave?: (data: DeviceResearchBasic) => void
  loading?: boolean
  disabled?: boolean
  workshopOptions?: Array<{ label: string; value: string }>
  deviceTypeOptions?: Array<{ label: string; value: string }>
  projects?: Project[]
  projectId?: string
  onProjectChange?: (projectId: string) => void
}

const props = withDefaults(defineProps<Props>(), {
  initialValues: () => ({} as DeviceResearchBasic),
  loading: false,
  disabled: false,
  workshopOptions: () => [],
  deviceTypeOptions: () => [],
  projects: () => []
})

const emit = defineEmits<{
  save: [data: DeviceResearchBasic]
}>()

const formRef = ref<FormInstance>()

// 设备厂商内置选项
const manufacturerOptions = [
  '衡远',
  '金帆',
  '东顺',
  '清时智能',
  '新东远',
  '三环',
  '创为',
  '海悦',
  '金润',
  '盈定',
  '博兴'
]

const formData = reactive<DeviceResearchBasic>({
  projectName: '',
  workshop: '',
  deviceType: '',
  quantity: 1,
  deviceManufacturer: '',
  remarks: ''
})

const rules: FormRules = {
  projectName: [
    { required: true, message: '请选择项目名称', trigger: 'change' }
  ],
  deviceType: [
    { required: true, message: '请选择设备类型', trigger: 'change' }
  ],
  deviceManufacturer: [
    { required: true, message: '请输入设备厂商', trigger: 'blur' }
  ],
  quantity: [
    { required: true, message: '请输入数量', trigger: 'blur' }
  ]
}

// 初始化表单数据
watch(() => props.initialValues, (newVal) => {
  if (newVal) {
    Object.assign(formData, {
      projectName: props.projectId || newVal.projectName || '',
      workshop: newVal.workshop || '',
      deviceType: newVal.deviceType || '',
      quantity: newVal.quantity || 1,
      deviceManufacturer: newVal.deviceManufacturer || '',
      remarks: newVal.remarks || ''
    })
  }
}, { immediate: true })

// 监听projectId变化
watch(() => props.projectId, (newVal) => {
  if (newVal && !props.initialValues?.projectName) {
    formData.projectName = newVal
  }
})

const handleProjectChange = (value: string) => {
  props.onProjectChange?.(value)
}

const handleSave = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    // 获取项目信息
    const selectedProject = props.projects.find(p => p.id === formData.projectName)

    const data: DeviceResearchBasic = {
      projectName: typeof formData.projectName === 'string' ? selectedProject?.name || formData.projectName : selectedProject?.name,
      projectId: typeof formData.projectName === 'number' ? formData.projectName : selectedProject?.id,
      workshop: formData.workshop,
      deviceType: formData.deviceType,
      quantity: formData.quantity,
      deviceManufacturer: formData.deviceManufacturer,
      remarks: formData.remarks
    }

    emit('save', data)
  } catch (error) {
    ElMessage.error('请检查表单填写是否完整')
  }
}

// 暴露验证方法给父组件
defineExpose({
  validate: () => formRef.value?.validate(),
  resetFields: () => formRef.value?.resetFields(),
  handleSave
})
</script>

<style scoped>
.el-select {
  width: 100%;
}
</style>
