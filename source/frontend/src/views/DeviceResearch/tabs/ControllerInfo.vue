<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    label-width="120px"
    :disabled="disabled"
  >
    <el-form-item label="接口被占用" prop="isInterfaceOccupied">
      <el-radio-group v-model="formData.isInterfaceOccupied">
        <el-radio :label="true">是</el-radio>
        <el-radio :label="false">否</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="控制器接口类型" prop="interfaceType">
      <el-select
        v-model="formData.interfaceType"
        placeholder="请选择接口类型"
        allow-clear
      >
        <el-option label="RJ45" value="RJ45" />
        <el-option label="RS232" value="RS232" />
        <el-option label="RS422" value="RS422" />
        <el-option label="RS485" value="RS485" />
      </el-select>
    </el-form-item>

    <el-form-item label="连接触摸屏" prop="hasTouchScreen">
      <el-radio-group v-model="formData.hasTouchScreen">
        <el-radio :label="true">是</el-radio>
        <el-radio :label="false">否</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item
      v-if="formData.hasTouchScreen"
      label="触摸屏品牌"
      prop="touchScreenBrand"
    >
      <el-input
        v-model="formData.touchScreenBrand"
        placeholder="请输入触摸屏品牌"
        maxlength="100"
      />
    </el-form-item>

    <el-form-item label="控制器品牌" prop="controllerBrand">
      <el-select
        v-model="formData.controllerBrand"
        placeholder="请选择或输入控制器品牌"
        filterable
        allow-create
        allow-clear
      >
        <el-option
          v-for="item in controllerBrandOptions"
          :key="item"
          :label="item"
          :value="item"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="控制器型号" prop="controllerModel">
      <el-input
        v-model="formData.controllerModel"
        placeholder="请输入控制器型号"
        maxlength="100"
      />
    </el-form-item>

    <el-form-item label="提供的资料">
      <el-checkbox-group v-model="checkBoxValues">
        <el-checkbox label="hasPointTable">是否提供点位表</el-checkbox>
        <el-checkbox label="hasPlcSource">是否提供PLC源程序</el-checkbox>
        <el-checkbox label="hasTouchScreenSource">是否提供触摸屏源程序</el-checkbox>
      </el-checkbox-group>
    </el-form-item>

    <!-- 多媒体资料上传 -->
    <el-collapse>
      <el-collapse-item title="多媒体资料（照片/视频）">
        <el-tabs v-model="activeMediaType">
          <!-- 控制器 -->
          <el-tab-pane label="控制器" name="controller">
            <el-form-item label="控制器照片">
              <MediaUpload
                v-model="controllerPhotos"
                accept-type="image"
                :max-count="10"
                :max-size="10"
                :disabled="disabled"
              />
            </el-form-item>
            <el-form-item label="控制器视频">
              <MediaUpload
                v-model="controllerVideos"
                accept-type="video"
                :max-count="5"
                :max-size="50"
                :disabled="disabled"
              />
            </el-form-item>
          </el-tab-pane>

          <!-- 触摸屏 -->
          <el-tab-pane label="触摸屏" name="touchscreen">
            <el-form-item label="触摸屏照片">
              <MediaUpload
                v-model="touchscreenPhotos"
                accept-type="image"
                :max-count="10"
                :max-size="10"
                :disabled="disabled"
              />
            </el-form-item>
            <el-form-item label="触摸屏视频">
              <MediaUpload
                v-model="touchscreenVideos"
                accept-type="video"
                :max-count="5"
                :max-size="50"
                :disabled="disabled"
              />
            </el-form-item>
          </el-tab-pane>

          <!-- 控制柜 -->
          <el-tab-pane label="控制柜" name="cabinet">
            <el-form-item label="控制柜照片">
              <MediaUpload
                v-model="cabinetPhotos"
                accept-type="image"
                :max-count="10"
                :max-size="10"
                :disabled="disabled"
              />
            </el-form-item>
            <el-form-item label="控制柜视频">
              <MediaUpload
                v-model="cabinetVideos"
                accept-type="video"
                :max-count="5"
                :max-size="50"
                :disabled="disabled"
              />
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-collapse-item>
    </el-collapse>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import MediaUpload, { type MediaAttachment } from '@/components/MediaUpload.vue'
import type { DeviceResearchController } from '@/types/device'

interface Props {
  initialValues?: DeviceResearchController
  onSave?: (data: DeviceResearchController) => void
  loading?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialValues: () => ({} as DeviceResearchController),
  loading: false,
  disabled: false
})

const emit = defineEmits<{
  save: [data: DeviceResearchController]
}>()

const formRef = ref<FormInstance>()
const activeMediaType = ref('controller')

// 控制器品牌内置选项
const controllerBrandOptions = [
  '魏德米勒',
  '汇川',
  '信捷',
  '欧姆龙',
  '西门子',
  '台达',
  '三菱'
]

// 复选框值
const checkBoxValues = ref<string[]>([])

// 多媒体附件
const controllerPhotos = ref<MediaAttachment[]>([])
const controllerVideos = ref<MediaAttachment[]>([])
const touchscreenPhotos = ref<MediaAttachment[]>([])
const touchscreenVideos = ref<MediaAttachment[]>([])
const cabinetPhotos = ref<MediaAttachment[]>([])
const cabinetVideos = ref<MediaAttachment[]>([])

const formData = reactive<DeviceResearchController>({
  isInterfaceOccupied: undefined,
  interfaceType: undefined,
  hasTouchScreen: undefined,
  touchScreenBrand: '',
  controllerBrand: '',
  controllerModel: '',
  hasPointTable: false,
  hasPlcSource: false,
  hasTouchScreenSource: false
})

const rules: FormRules = {
  isInterfaceOccupied: [
    { required: true, message: '请选择接口被占用', trigger: 'change' }
  ],
  interfaceType: [
    { required: true, message: '请选择控制器接口类型', trigger: 'change' }
  ],
  hasTouchScreen: [
    { required: true, message: '请选择连接触摸屏', trigger: 'change' }
  ],
  controllerBrand: [
    { required: true, message: '请输入控制器品牌', trigger: 'blur' }
  ]
}

// 初始化表单数据
watch(() => props.initialValues, (newVal) => {
  if (newVal) {
    Object.assign(formData, {
      isInterfaceOccupied: newVal.isInterfaceOccupied,
      interfaceType: newVal.interfaceType,
      hasTouchScreen: newVal.hasTouchScreen,
      touchScreenBrand: newVal.touchScreenBrand || '',
      controllerBrand: newVal.controllerBrand || '',
      controllerModel: newVal.controllerModel || '',
      hasPointTable: newVal.hasPointTable || false,
      hasPlcSource: newVal.hasPlcSource || false,
      hasTouchScreenSource: newVal.hasTouchScreenSource || false
    })

    // 初始化复选框
    checkBoxValues.value = []
    if (newVal.hasPointTable) checkBoxValues.value.push('hasPointTable')
    if (newVal.hasPlcSource) checkBoxValues.value.push('hasPlcSource')
    if (newVal.hasTouchScreenSource) checkBoxValues.value.push('hasTouchScreenSource')

    // 初始化多媒体附件 - 从 JSON 字符串反序列化
    const parseMedia = (json: string | undefined) => {
      if (!json) return []
      try {
        return JSON.parse(json)
      } catch {
        return []
      }
    }

    controllerPhotos.value = parseMedia(newVal.controllerPhotos)
    controllerVideos.value = parseMedia(newVal.controllerVideos)
    touchscreenPhotos.value = parseMedia(newVal.touchscreenPhotos)
    touchscreenVideos.value = parseMedia(newVal.touchscreenVideos)
    cabinetPhotos.value = parseMedia(newVal.cabinetPhotos)
    cabinetVideos.value = parseMedia(newVal.cabinetVideos)
  }
}, { immediate: true })

// 监听复选框变化
watch(checkBoxValues, (newVal) => {
  formData.hasPointTable = newVal.includes('hasPointTable')
  formData.hasPlcSource = newVal.includes('hasPlcSource')
  formData.hasTouchScreenSource = newVal.includes('hasTouchScreenSource')
})

const handleSave = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    // 将多媒体数组序列化为 JSON 字符串
    const serializeMedia = (media: MediaAttachment[]) => {
      if (!media || media.length === 0) return null
      return JSON.stringify(media)
    }

    const data: DeviceResearchController = {
      isInterfaceOccupied: formData.isInterfaceOccupied,
      interfaceType: formData.interfaceType,
      hasTouchScreen: formData.hasTouchScreen,
      touchScreenBrand: formData.touchScreenBrand,
      controllerBrand: formData.controllerBrand,
      controllerModel: formData.controllerModel,
      hasPointTable: formData.hasPointTable,
      hasPlcSource: formData.hasPlcSource,
      hasTouchScreenSource: formData.hasTouchScreenSource,
      controllerPhotos: serializeMedia(controllerPhotos.value),
      controllerVideos: serializeMedia(controllerVideos.value),
      touchscreenPhotos: serializeMedia(touchscreenPhotos.value),
      touchscreenVideos: serializeMedia(touchscreenVideos.value),
      cabinetPhotos: serializeMedia(cabinetPhotos.value),
      cabinetVideos: serializeMedia(cabinetVideos.value)
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
.el-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
