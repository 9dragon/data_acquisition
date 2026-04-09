<template>
  <div class="collection-info-step">
    <van-cell-group inset title="采集信息">
      <van-field name="collectDeviceStatus" label="采集设备状态">
        <template #input>
          <van-switch v-model="formData.collectDeviceStatus" size="20" @change="updateValue" />
        </template>
      </van-field>

      <van-field name="collectProcessParams" label="采集工艺参数">
        <template #input>
          <van-switch v-model="formData.collectProcessParams" size="20" @change="updateValue" />
        </template>
      </van-field>

      <van-field
        v-if="formData.collectProcessParams"
        name="dataItems"
        label="需采集数据项"
        placeholder="请选择数据项"
        is-link
        readonly
        @click="showDataItemsPicker = true"
      >
        <template #input>
          <span>{{ selectedDataItemsText }}</span>
        </template>
      </van-field>

      <van-cell v-if="selectedDataItems.length > 0" title="已选数据项">
        <template #value>
          <van-tag
            v-for="(item, index) in selectedDataItems"
            :key="index"
            closeable
            @close="removeDataItem(index)"
            style="margin: 4px;"
          >
            {{ item }}
          </van-tag>
        </template>
      </van-cell>

      <van-field
        v-if="formData.collectProcessParams"
        v-model="formData.dataItemsDetail"
        name="dataItemsDetail"
        label="数据项明细"
        type="textarea"
        rows="4"
        placeholder="请详细描述数据项的采集要求（选填）"
        maxlength="1000"
        show-word-limit
      />

      <van-field name="collectProduction" label="采集产量/节拍">
        <template #input>
          <van-switch v-model="formData.collectProduction" size="20" @change="updateValue" />
        </template>
      </van-field>

      <van-field name="collectEnergy" label="采集能耗">
        <template #input>
          <van-switch v-model="formData.collectEnergy" size="20" @change="updateValue" />
        </template>
      </van-field>
    </van-cell-group>

    <!-- 数据项选择器 -->
    <van-popup v-model:show="showDataItemsPicker" position="bottom" round>
      <div class="data-items-picker">
        <div class="picker-header">
          <van-button type="primary" size="small" @click="confirmDataItems">确定</van-button>
        </div>
        <van-checkbox-group v-model="tempSelectedItems">
          <van-checkbox
            v-for="option in dataItemOptions"
            :key="option.value"
            :name="option.value"
            style="padding: 12px 16px; border-bottom: 1px solid #ebedf0;"
          >
            {{ option.text }}
          </van-checkbox>
        </van-checkbox-group>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { showToast } from 'vant'
import type { DeviceResearchCollection } from '@/types/device'

interface Props {
  modelValue: DeviceResearchCollection
}

interface Emits {
  (e: 'update:modelValue', value: DeviceResearchCollection): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formData = reactive<DeviceResearchCollection>({ ...props.modelValue })

// 数据项
const selectedDataItems = ref<string[]>([])
const tempSelectedItems = ref<string[]>([])
const showDataItemsPicker = ref(false)

const dataItemOptions = [
  { text: '设备运行状态', value: '设备运行状态' },
  { text: '设备故障信息', value: '设备故障信息' },
  { text: '生产数量', value: '生产数量' },
  { text: '温度数据', value: '温度数据' },
  { text: '压力数据', value: '压力数据' },
  { text: '速度/节拍', value: '速度/节拍' },
  { text: '能耗数据', value: '能耗数据' },
  { text: '维护提醒', value: '维护提醒' },
  { text: '其他', value: '其他' }
]

// 已选数据项文本
const selectedDataItemsText = computed(() => {
  if (selectedDataItems.value.length === 0) {
    return '请选择数据项'
  }
  return `已选 ${selectedDataItems.value.length} 项`
})

// 监听变化
const updateValue = () => {
  // 更新数据项为JSON字符串
  formData.dataItems = JSON.stringify(selectedDataItems.value)
  emit('update:modelValue', { ...formData })
}

// 打开数据项选择器
const openDataItemsPicker = () => {
  tempSelectedItems.value = [...selectedDataItems.value]
  showDataItemsPicker.value = true
}

// 确认数据项选择
const confirmDataItems = () => {
  selectedDataItems.value = [...tempSelectedItems.value]
  updateValue()
  showDataItemsPicker.value = false
}

// 移除数据项
const removeDataItem = (index: number) => {
  selectedDataItems.value.splice(index, 1)
  updateValue()
}

// 初始化
onMounted(() => {
  Object.assign(formData, props.modelValue)

  // 解析已选数据项
  if (formData.dataItems) {
    try {
      selectedDataItems.value = JSON.parse(formData.dataItems)
    } catch (e) {
      selectedDataItems.value = []
    }
  }
})

// 暴露验证方法
defineExpose({
  validate: () => {
    return true
  }
})
</script>

<style scoped>
.collection-info-step {
  padding: 16px 0;
}

:deep(.van-cell-group) {
  margin-bottom: 12px;
}

.data-items-picker {
  max-height: 60vh;
  display: flex;
  flex-direction: column;
}

.picker-header {
  padding: 12px 16px;
  border-bottom: 1px solid #ebedf0;
  display: flex;
  justify-content: flex-end;
}

:deep(.van-checkbox-group) {
  flex: 1;
  overflow-y: auto;
}
</style>
