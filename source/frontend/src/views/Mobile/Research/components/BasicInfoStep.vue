<template>
  <div class="basic-info-step">
    <van-cell-group inset title="基础信息">
      <van-field
        v-model="formData.workshopName"
        name="workshop"
        label="所属车间"
        placeholder="请输入或选择车间"
        required
        :rules="[{ required: true, message: '请输入或选择车间' }]"
        @blur="onWorkshopFieldBlur"
      >
        <template #button>
          <van-button size="small" class="picker-btn" @click="showWorkshopPicker = true">选择</van-button>
        </template>
      </van-field>
      <van-field
        v-model="formData.deviceTypeName"
        name="deviceType"
        label="设备类型"
        placeholder="请输入或选择设备类型"
        required
        :rules="[{ required: true, message: '请输入或选择设备类型' }]"
        @blur="onDeviceTypeFieldBlur"
      >
        <template #button>
          <van-button size="small" class="picker-btn" @click="showDeviceTypePicker = true">选择</van-button>
        </template>
      </van-field>
      <van-field
        v-model.number="formData.quantity"
        name="quantity"
        label="数量"
        type="number"
        placeholder="请输入数量"
        required
        :rules="[
          { required: true, message: '请输入数量' },
          { pattern: /^[1-9]\d*$/, message: '数量必须大于0' }
        ]"
      />
      <van-field
        v-model="manufacturerInput"
        name="deviceManufacturer"
        label="设备厂商"
        placeholder="请输入设备厂商"
        required
        :rules="[{ required: true, message: '请输入设备厂商' }]"
      />
      <van-field
        v-model="formData.remarks"
        name="remarks"
        label="备注"
        type="textarea"
        rows="3"
        placeholder="请输入备注信息（选填）"
        maxlength="500"
        show-word-limit
      />
    </van-cell-group>

    <!-- 车间选择器 -->
    <van-popup v-model:show="showWorkshopPicker" position="bottom" round>
      <van-picker
        :columns="workshopOptions"
        :loading="workshopLoading"
        @confirm="onWorkshopConfirm"
        @cancel="showWorkshopPicker = false"
      />
    </van-popup>

    <!-- 设备类型选择器 -->
    <van-popup v-model:show="showDeviceTypePicker" position="bottom" round>
      <van-picker
        :columns="deviceTypeOptions"
        :loading="deviceTypeLoading"
        @confirm="onDeviceTypeConfirm"
        @cancel="showDeviceTypePicker = false"
      />
    </van-popup>

    <!-- 设备厂商不提供下拉选择，直接手动输入 -->
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { showToast } from 'vant'
import { useMobileProjectStore } from '@/stores/mobileProject'
import { useDeviceResearchStore } from '@/stores/deviceResearch'
import { workshopApi } from '@/api/workshop'
import { deviceTypeApi } from '@/api/deviceType'
import type { DeviceResearchBasic } from '@/types/device'

interface Props {
  modelValue: DeviceResearchBasic
}

interface Emits {
  (e: 'update:modelValue', value: DeviceResearchBasic): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const projectStore = useMobileProjectStore()
const deviceResearchStore = useDeviceResearchStore()
const currentProject = computed(() => projectStore.currentProject)

const formData = reactive<DeviceResearchBasic>({ ...props.modelValue })

// 监听 props.modelValue 变化，同步到 formData
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    Object.keys(newVal).forEach(key => {
      if (newVal[key as keyof DeviceResearchBasic] !== undefined) {
        (formData as any)[key] = newVal[key as keyof DeviceResearchBasic]
      }
    })
  }
}, { deep: true })

// 监听变化
const updateValue = () => {
  emit('update:modelValue', { ...formData })
}

// 车间选择器
const showWorkshopPicker = ref(false)
const workshopLoading = ref(false)
const workshopOptions = ref<{ text: string; value: string }[]>([])

const loadWorkshops = async () => {
  workshopLoading.value = true
  try {
    const result = await workshopApi.getOptions({
      projectId: currentProject.value?.id
    })
    workshopOptions.value = result.map(w => ({ text: w.name, value: w.id?.toString() || w.name }))
  } catch (error) {
    console.error('加载车间列表失败:', error)
  } finally {
    workshopLoading.value = false
  }
}

const onWorkshopConfirm = ({ selectedOptions }: any) => {
  formData.workshopId = selectedOptions[0].value
  formData.workshopName = selectedOptions[0].text
  showWorkshopPicker.value = false
  // 保存选择的车间
  deviceResearchStore.setLastSelectedWorkshop({
    workshopId: formData.workshopId,
    workshopName: formData.workshopName
  })
  updateValue()
}

// 设备类型选择器
const showDeviceTypePicker = ref(false)
const deviceTypeLoading = ref(false)
const deviceTypeOptions = ref<{ text: string; value: string }[]>([])

const loadDeviceTypes = async () => {
  deviceTypeLoading.value = true
  try {
    const result = await deviceTypeApi.getOptions({
      projectId: currentProject.value?.id
    })
    deviceTypeOptions.value = result.map(t => ({ text: t.name, value: t.id?.toString() || t.name }))
  } catch (error) {
    console.error('加载设备类型失败:', error)
  } finally {
    deviceTypeLoading.value = false
  }
}

const onDeviceTypeConfirm = ({ selectedOptions }: any) => {
  formData.deviceTypeId = selectedOptions[0].value
  formData.deviceTypeName = selectedOptions[0].text
  showDeviceTypePicker.value = false
  updateValue()
}

// 车间手动输入：失焦时按名称匹配或自动创建车间
const onWorkshopFieldBlur = async () => {
  const name = (formData.workshopName || '').trim()
  if (!name) {
    if (formData.workshopId) {
      formData.workshopId = ''
      updateValue()
    }
    return
  }

  // 已有同名称车间则直接关联
  const existing = workshopOptions.value.find(w => w.text === name)
  if (existing) {
    formData.workshopId = existing.value
    formData.workshopName = name
    updateValue()
    return
  }

  // 不存在则自动创建，创建成功后保留用户当前输入
  formData.workshopId = ''
  updateValue()
  const created = await createOrGetWorkshop(name)
  if (!created || formData.workshopName !== name) return
  formData.workshopId = created.value
  formData.workshopName = created.text
  updateValue()
}

const createOrGetWorkshop = async (name: string): Promise<{ text: string; value: string } | null> => {
  try {
    const result = await workshopApi.createOrGet({
      name,
      projectId: currentProject.value?.id
    })
    const option = { text: result.name, value: result.id != null ? result.id.toString() : name }
    if (!workshopOptions.value.some(w => w.value === option.value)) {
      workshopOptions.value = [option, ...workshopOptions.value]
    }
    return option
  } catch (error) {
    console.error('创建车间失败:', error)
    showToast('创建车间失败')
    return null
  }
}

// 设备类型手动输入：失焦时按名称匹配或自动创建
const onDeviceTypeFieldBlur = async () => {
  const name = (formData.deviceTypeName || '').trim()
  if (!name) {
    if (formData.deviceTypeId) {
      formData.deviceTypeId = ''
      updateValue()
    }
    return
  }

  const existing = deviceTypeOptions.value.find(t => t.text === name)
  if (existing) {
    formData.deviceTypeId = existing.value
    formData.deviceTypeName = name
    updateValue()
    return
  }

  formData.deviceTypeId = ''
  updateValue()
  const created = await createOrGetDeviceType(name)
  if (!created || formData.deviceTypeName !== name) return
  formData.deviceTypeId = created.value
  formData.deviceTypeName = created.text
  updateValue()
}

const createOrGetDeviceType = async (name: string): Promise<{ text: string; value: string } | null> => {
  try {
    const result = await deviceTypeApi.createOrGet({
      name,
      projectId: currentProject.value?.id
    })
    const option = { text: result.name, value: result.id != null ? result.id.toString() : name }
    if (!deviceTypeOptions.value.some(t => t.value === option.value)) {
      deviceTypeOptions.value = [option, ...deviceTypeOptions.value]
    }
    return option
  } catch (error) {
    console.error('创建设备类型失败:', error)
    showToast('创建设备类型失败')
    return null
  }
}

// 设备厂商：自定义输入，不提供下拉选择
const manufacturerInput = computed({
  get: () => formData.deviceManufacturer || '',
  set: (val) => {
    formData.deviceManufacturer = val
    updateValue()
  }
})

// 初始化
onMounted(async () => {
  Object.assign(formData, props.modelValue)
  // 新建模式时，自动填充上一次选择的车间
  if (!formData.workshopId && deviceResearchStore.lastSelectedWorkshop) {
    formData.workshopId = deviceResearchStore.lastSelectedWorkshop.workshopId
    formData.workshopName = deviceResearchStore.lastSelectedWorkshop.workshopName
    updateValue()
  }
})

// 监听当前项目变化 - 添加 immediate 确保初始化时也执行
watch(currentProject, async (newProject, oldProject) => {
  if (newProject?.id) {
    // 同步项目信息
    formData.projectName = newProject.name
    formData.projectId = newProject.id
    
    // 如果项目切换了（新旧项目ID不同）或选项未加载，则重新加载
    const projectChanged = oldProject && oldProject.id !== newProject.id
    if (projectChanged || workshopOptions.value.length === 0) {
      await Promise.all([loadWorkshops(), loadDeviceTypes()])
    }
    
    updateValue()
  }
}, { immediate: true })

// 暴露验证方法
defineExpose({
  validate: () => {
    if (!currentProject.value) {
      showToast('请在【我的】页面选择项目')
      return false
    }
    if (!formData.workshopId || !formData.workshopName) {
      showToast('请输入或选择车间')
      return false
    }
    if (!formData.deviceTypeId || !formData.deviceTypeName) {
      showToast('请输入或选择设备类型')
      return false
    }
    if (!formData.quantity || formData.quantity <= 0) {
      showToast('请输入有效的数量')
      return false
    }
    if (!formData.deviceManufacturer) {
      showToast('请输入设备厂商')
      return false
    }
    return true
  }
})
</script>

<style scoped>
.basic-info-step {
  padding: 16px 0;
}

:deep(.van-cell-group) {
  margin-bottom: 12px;
}

.no-project {
  color: #969799;
}

.picker-btn {
  /* 供手动输入字段触发下拉选择 */
  flex-shrink: 0;
}
</style>
