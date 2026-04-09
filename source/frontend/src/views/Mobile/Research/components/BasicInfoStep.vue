<template>
  <div class="basic-info-step">
    <!-- 当前项目（从我的页面选择） -->
    <van-cell-group inset title="当前项目">
      <van-cell>
        <template #value>
          <span :class="{ 'no-project': !currentProject }">
            {{ currentProject?.name || '请在【我的】页面选择项目' }}
          </span>
        </template>
      </van-cell>
    </van-cell-group>

    <van-cell-group inset title="基础信息">
      <van-field
        :value="workshopDisplayName"
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
        :value="deviceTypeDisplayName"
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
import { workshopApi, type Workshop } from '@/api/workshop'
import { deviceTypeApi, type DeviceType } from '@/api/deviceType'
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
const currentProject = computed(() => projectStore.currentProject)

const formData = reactive<DeviceResearchBasic>({ ...props.modelValue })

// 显示名称
const workshopDisplayName = computed(() => formData.workshopName || '请选择')
const deviceTypeDisplayName = computed(() => formData.deviceTypeName || '请选择')

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

const manufacturerOptions = [
  { text: '衡远', value: '衡远' },
  { text: '金帆', value: '金帆' },
  { text: '东顺', value: '东顺' },
  { text: '清时智能', value: '清时智能' },
  { text: '新东远', value: '新东远' },
  { text: '三环', value: '三环' },
  { text: '创为', value: '创为' },
  { text: '海悦', value: '海悦' },
  { text: '金润', value: '金润' },
  { text: '盈定', value: '盈定' },
  { text: '博兴', value: '博兴' }
]

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

  // 加载车间和设备类型
  if (currentProject.value?.id) {
    await Promise.all([loadWorkshops(), loadDeviceTypes()])
  }

  // 同步项目ID和名称
  if (currentProject.value?.name) {
    formData.projectName = currentProject.value.name
    formData.projectId = currentProject.value.id
    updateValue()
  }
})

// 监听当前项目变化
watch(currentProject, async (newProject) => {
  if (newProject?.id) {
    formData.projectName = newProject.name
    formData.projectId = newProject.id
    // 清空车间和设备类型选择
    formData.workshopId = ''
    formData.workshopName = ''
    formData.deviceTypeId = ''
    formData.deviceTypeName = ''
    updateValue()

    // 重新加载车间和设备类型
    await Promise.all([loadWorkshops(), loadDeviceTypes()])
  }
}, { deep: true })

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
