<template>
  <el-form
    ref="formRef"
    :model="formData"
    label-width="140px"
    :disabled="disabled"
  >
    <el-form-item label="采集设备状态">
      <el-switch
        v-model="formData.collectDeviceStatus"
        active-text="是"
        inactive-text="否"
      />
    </el-form-item>

    <el-form-item label="采集工艺参数">
      <el-switch
        v-model="formData.collectProcessParams"
        active-text="是"
        inactive-text="否"
        @change="handleProcessParamsChange"
      />
    </el-form-item>

    <!-- 条件显示：只有当采集工艺参数为"是"时才显示数据项相关字段 -->
    <template v-if="formData.collectProcessParams">
      <el-form-item label="需采集数据项" prop="dataItems">
        <el-select
          v-model="selectedDataItems"
          multiple
          placeholder="请选择需要采集的数据项"
          style="width: 100%"
          @change="handleDataItemsChange"
        >
          <el-option
            v-for="item in commonDataItems"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>

      <el-form-item v-if="selectedDataItems.length > 0" label="已选数据项">
        <div class="selected-tags">
          <el-tag
            v-for="item in selectedDataItems"
            :key="item"
            type="primary"
            closable
            @close="handleRemoveDataItem(item)"
          >
            {{ item }}
          </el-tag>
        </div>
      </el-form-item>

      <el-form-item label="数据项明细说明" prop="dataItemsDetail">
        <el-input
          v-model="formData.dataItemsDetail"
          type="textarea"
          :rows="6"
          placeholder="请详细说明需要采集的数据项，包括点位地址、数据类型、采集频率等具体要求"
          maxlength="1000"
          show-word-limit
        />
      </el-form-item>
    </template>

    <el-form-item label="采集产量/节拍">
      <el-switch
        v-model="formData.collectProduction"
        active-text="是"
        inactive-text="否"
      />
    </el-form-item>

    <el-form-item label="采集能耗">
      <el-switch
        v-model="formData.collectEnergy"
        active-text="是"
        inactive-text="否"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import type { DeviceResearchCollection } from '@/types/device'
import { deviceResearchApi } from '@/api/deviceResearch'

interface Props {
  initialValues?: DeviceResearchCollection
  onSave?: (data: DeviceResearchCollection) => void
  loading?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialValues: () => ({} as DeviceResearchCollection),
  loading: false,
  disabled: false
})

const emit = defineEmits<{
  save: [data: DeviceResearchCollection]
}>()

const formRef = ref<FormInstance>()

// 数据项选项
const commonDataItems = ref<string[]>([])

const loadDataItemOptions = async () => {
  try {
    const result = await deviceResearchApi.getOptions()
    commonDataItems.value = result.dataItems || []
  } catch (error) {
    console.error('加载数据项选项失败:', error)
  }
}

const selectedDataItems = ref<string[]>([])

const formData = reactive<DeviceResearchCollection>({
  collectDeviceStatus: true,
  collectProcessParams: false,
  dataItems: [],
  dataItemsDetail: '',
  collectProduction: false,
  collectEnergy: false
})

const rules = {
  dataItems: [
    { required: true, message: '请选择需要采集的数据项', trigger: 'change' }
  ],
  dataItemsDetail: [
    { required: true, message: '请填写数据项明细说明', trigger: 'blur' }
  ]
}

// 加载数据项选项
onMounted(() => {
  loadDataItemOptions()
})

// 初始化表单数据
watch(() => props.initialValues, (newVal) => {
  if (newVal) {
    formData.collectDeviceStatus = newVal.collectDeviceStatus || false
    formData.collectProcessParams = newVal.collectProcessParams || false
    formData.collectProduction = newVal.collectProduction || false
    formData.collectEnergy = newVal.collectEnergy || false
    formData.dataItemsDetail = newVal.dataItemsDetail || ''
    // dataItems 已经在父组件中解析为数组
    selectedDataItems.value = newVal.dataItems || []
  }
}, { immediate: true })

const handleProcessParamsChange = (value: boolean) => {
  if (!value) {
    selectedDataItems.value = []
    formData.dataItemsDetail = ''
  }
}

const handleDataItemsChange = (value: string[]) => {
  formData.dataItems = value
}

const handleRemoveDataItem = (item: string) => {
  const index = selectedDataItems.value.indexOf(item)
  if (index > -1) {
    selectedDataItems.value.splice(index, 1)
    formData.dataItems = selectedDataItems.value
  }
}

const handleSave = async () => {
  if (!formRef.value) return

  try {
    // 只有当采集工艺参数为"是"时才验证相关字段
    if (formData.collectProcessParams) {
      await formRef.value.validate()
    }

    const data: DeviceResearchCollection = {
      collectDeviceStatus: formData.collectDeviceStatus,
      collectProcessParams: formData.collectProcessParams,
      collectProduction: formData.collectProduction,
      collectEnergy: formData.collectEnergy,
      dataItems: formData.collectProcessParams ? JSON.stringify(selectedDataItems.value) : undefined,
      dataItemsDetail: formData.collectProcessParams ? formData.dataItemsDetail : undefined
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
.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.el-tag {
  margin: 0;
}
</style>
