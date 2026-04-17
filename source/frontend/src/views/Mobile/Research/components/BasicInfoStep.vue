<template>
  <div class="basic-info-step">
    <van-cell-group inset title="基础信息">
      <van-field
        :model-value="workshopDisplayName"
        name="workshop"
        label="所属车间"
        placeholder="请选择车间"
        is-link
        readonly
        required
        :rules="[{ required: true, message: '请选择车间' }]"
        @click="showWorkshopPicker = true"
      />
      <van-field
        :model-value="deviceTypeDisplayName"
        name="deviceType"
        label="设备类型"
        placeholder="请选择设备类型"
        is-link
        readonly
        required
        :rules="[{ required: true, message: '请选择设备类型' }]"
        @click="showDeviceTypePicker = true"
      />
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
        placeholder="请选择或输入设备厂商"
        is-link
        readonly
        required
        :rules="[{ required: true, message: '请选择或输入设备厂商' }]"
        @click="showManufacturerPicker = true"
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

    <!-- 设备厂商选择器（支持选择和输入） -->
    <van-popup v-model:show="showManufacturerPicker" position="bottom" round>
      <div class="manufacturer-picker">
        <div class="picker-header">
          <van-button type="primary" size="small" @click="showManufacturerInput = true">自定义输入</van-button>
        </div>
        <van-picker
          :columns="manufacturerOptions"
          @confirm="onManufacturerConfirm"
          @cancel="showManufacturerPicker = false"
        />
      </div>
    </van-popup>

    <!-- 设备厂商自定义输入弹窗 -->
    <van-dialog v-model:show="showManufacturerInput" title="输入设备厂商" show-cancel-button @confirm="onManufacturerInputConfirm">
      <van-field
        v-model="customManufacturer"
        placeholder="请输入设备厂商名称"
        autofocus
      />
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { showToast } from 'vant'
import { useMobileProjectStore } from '@/stores/mobileProject'
import { useDeviceResearchStore } from '@/stores/deviceResearch'
import { workshopApi, type Workshop } from '@/api/workshop'
import { deviceTypeApi, type DeviceType } from '@/api/deviceType'
import { deviceResearchApi } from '@/api/deviceResearch'
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

// 显示名称
const workshopDisplayName = computed(() => formData.workshopName || '请选择')
const deviceTypeDisplayName = computed(() => formData.deviceTypeName || '请选择')

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

// 设备厂商选择器（支持选择和输入）
const showManufacturerPicker = ref(false)
const showManufacturerInput = ref(false)
const customManufacturer = ref('')
const manufacturerInput = computed({
  get: () => formData.deviceManufacturer || '',
  set: (val) => {
    formData.deviceManufacturer = val
    updateValue()
  }
})

const manufacturerOptions = ref<{ text: string; value: string }[]>([])

const loadManufacturerOptions = async () => {
  try {
    const result = await deviceResearchApi.getOptions()
    manufacturerOptions.value = (result.manufacturer || []).map(m => ({ text: m, value: m }))
  } catch (error) {
    console.error('加载设备厂商选项失败:', error)
  }
}

const onManufacturerConfirm = ({ selectedOptions }: any) => {
  formData.deviceManufacturer = selectedOptions[0].text
  showManufacturerPicker.value = false
  updateValue()
}

const onManufacturerInputConfirm = () => {
  if (!customManufacturer.value.trim()) {
    showToast('请输入设备厂商名称')
    return false
  }
  formData.deviceManufacturer = customManufacturer.value.trim()
  showManufacturerInput.value = false
  showManufacturerPicker.value = false
  customManufacturer.value = ''
  updateValue()
  return true
}

// 初始化
onMounted(async () => {
  Object.assign(formData, props.modelValue)
  // 新建模式时，自动填充上一次选择的车间
  if (!formData.workshopId && deviceResearchStore.lastSelectedWorkshop) {
    formData.workshopId = deviceResearchStore.lastSelectedWorkshop.workshopId
    formData.workshopName = deviceResearchStore.lastSelectedWorkshop.workshopName
    updateValue()
  }
  // 加载设备厂商选项
  await loadManufacturerOptions()
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
    if (!formData.workshopId) {
      showToast('请选择车间')
      return false
    }
    if (!formData.deviceTypeId) {
      showToast('请选择设备类型')
      return false
    }
    if (!formData.quantity || formData.quantity <= 0) {
      showToast('请输入有效的数量')
      return false
    }
    if (!formData.deviceManufacturer) {
      showToast('请选择或输入设备厂商')
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

.manufacturer-picker {
  max-height: 50vh;
}

.picker-header {
  padding: 12px 16px;
  text-align: right;
  border-bottom: 1px solid #ebedf0;
}
</style>
