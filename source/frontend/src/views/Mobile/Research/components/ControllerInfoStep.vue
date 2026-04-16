<template>
  <div class="controller-info-step">
    <van-cell-group inset title="控制器信息">
      <van-cell center title="接口被占用" required>
        <template #right-icon>
          <van-switch v-model="formData.isInterfaceOccupied" size="20" @change="updateValue" />
        </template>
      </van-cell>

      <van-field
        name="interfaceType"
        label="接口类型"
        placeholder="请选择接口类型"
        is-link
        readonly
        required
        :rules="[{ required: true, message: '请选择接口类型' }]"
        @click="showInterfaceTypePicker = true"
      >
        <template #input>
          <span>{{ formData.interfaceType || '请选择' }}</span>
        </template>
      </van-field>

      <van-cell center title="连接触摸屏" required>
        <template #right-icon>
          <van-switch v-model="formData.hasTouchScreen" size="20" @change="updateValue" />
        </template>
      </van-cell>

      <van-field
        v-if="formData.hasTouchScreen === true"
        v-model="formData.touchScreenBrand"
        name="touchScreenBrand"
        label="触摸屏品牌"
        placeholder="请输入触摸屏品牌"
        required
        :rules="[{ required: true, message: '请输入触摸屏品牌' }]"
      />

      <van-field
        name="controllerBrand"
        label="控制器品牌"
        placeholder="请选择或输入控制器品牌"
        is-link
        readonly
        required
        :rules="[{ required: true, message: '请选择或输入控制器品牌' }]"
        @click="showControllerBrandPicker = true"
      >
        <template #input>
          <span>{{ formData.controllerBrand || '请选择' }}</span>
        </template>
      </van-field>

      <van-field
        v-model="formData.controllerModel"
        name="controllerModel"
        label="控制器型号"
        placeholder="请输入控制器型号（选填）"
      />

      <van-cell-group inset title="提供的资料">
        <van-cell center title="点位表">
          <template #right-icon>
            <van-switch v-model="formData.hasPointTable" size="20" @change="updateValue" />
          </template>
        </van-cell>
        <van-cell center title="PLC源程序">
          <template #right-icon>
            <van-switch v-model="formData.hasPlcSource" size="20" @change="updateValue" />
          </template>
        </van-cell>
        <van-cell center title="触摸屏源程序">
          <template #right-icon>
            <van-switch v-model="formData.hasTouchScreenSource" size="20" @change="updateValue" />
          </template>
        </van-cell>
      </van-cell-group>
    </van-cell-group>

    <!-- 多媒体资料上传 -->
    <van-cell-group inset title="多媒体资料">
      <van-collapse v-model="activeCollapse" accordion>
        <van-collapse-item title="控制器照片/视频" name="controller">
          <van-uploader
            v-model="controllerFiles"
            multiple
            :max-count="9"
            accept="image/*,video/*"
            :max-size="100 * 1024 * 1024"
            :before-read="(file) => beforeRead(file, 'controller')"
            @oversize="(file) => handleOversize(file, 'controller')"
            @delete="(file) => handleDelete(file, 'controller')"
          />
        </van-collapse-item>

        <van-collapse-item title="触摸屏照片/视频" name="touchscreen">
          <van-uploader
            v-model="touchscreenFiles"
            multiple
            :max-count="9"
            accept="image/*,video/*"
            :max-size="100 * 1024 * 1024"
            :before-read="(file) => beforeRead(file, 'touchscreen')"
            @oversize="(file) => handleOversize(file, 'touchscreen')"
            @delete="(file) => handleDelete(file, 'touchscreen')"
          />
        </van-collapse-item>

        <van-collapse-item title="控制柜照片/视频" name="cabinet">
          <van-uploader
            v-model="cabinetFiles"
            multiple
            :max-count="9"
            accept="image/*,video/*"
            :max-size="100 * 1024 * 1024"
            :before-read="(file) => beforeRead(file, 'cabinet')"
            @oversize="(file) => handleOversize(file, 'cabinet')"
            @delete="(file) => handleDelete(file, 'cabinet')"
          />
        </van-collapse-item>
      </van-collapse>
    </van-cell-group>

    <!-- 接口类型选择器 -->
    <van-popup v-model:show="showInterfaceTypePicker" position="bottom">
      <van-picker
        :columns="interfaceTypeOptions"
        @confirm="onInterfaceTypeConfirm"
        @cancel="showInterfaceTypePicker = false"
      />
    </van-popup>

    <!-- 控制器品牌选择器 -->
    <van-popup v-model:show="showControllerBrandPicker" position="bottom">
      <van-picker
        :columns="controllerBrandOptions"
        @confirm="onControllerBrandConfirm"
        @cancel="showControllerBrandPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { showToast, showLoadingToast, closeToast, type UploaderFileListItem } from 'vant'
import type { DeviceResearchController } from '@/types/device'
import { isDingTalk, chooseMedia, type MediaResult } from '@/utils/dingtalk'

interface Props {
  modelValue: DeviceResearchController
}

interface Emits {
  (e: 'update:modelValue', value: DeviceResearchController): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formData = reactive<DeviceResearchController>({ ...props.modelValue })

// 多媒体文件
const controllerFiles = ref<UploaderFileListItem[]>([])
const touchscreenFiles = ref<UploaderFileListItem[]>([])
const cabinetFiles = ref<UploaderFileListItem[]>([])

// 折叠面板
const activeCollapse = ref('')

// 监听变化
const updateValue = () => {
  emit('update:modelValue', { ...formData })
}

// 接口类型选择器
const showInterfaceTypePicker = ref(false)
const interfaceTypeOptions = [
  { text: 'RJ45', value: 'RJ45' },
  { text: 'RS232', value: 'RS232' },
  { text: 'RS422', value: 'RS422' },
  { text: 'RS485', value: 'RS485' }
]

const onInterfaceTypeConfirm = ({ selectedOptions }: any) => {
  formData.interfaceType = selectedOptions[0].value
  showInterfaceTypePicker.value = false
  updateValue()
}

// 控制器品牌选择器
const showControllerBrandPicker = ref(false)
const controllerBrandOptions = [
  { text: '魏德米勒', value: '魏德米勒' },
  { text: '汇川', value: '汇川' },
  { text: '信捷', value: '信捷' },
  { text: '欧姆龙', value: '欧姆龙' },
  { text: '西门子', value: '西门子' },
  { text: '台达', value: '台达' },
  { text: '三菱', value: '三菱' }
]

const onControllerBrandConfirm = ({ selectedOptions }: any) => {
  formData.controllerBrand = selectedOptions[0].text
  showControllerBrandPicker.value = false
  updateValue()
}

// 处理媒体选择（钉钉环境）
const handleMediaChoose = async (type: string) => {
  if (!isDingTalk()) {
    showToast('请在钉钉中打开应用')
    return
  }

  showLoadingToast({ message: '加载中...', forbidClick: true })

  try {
    const results = await chooseMedia({
      multiple: true,
      max: 9,
      type: ['image', 'video']
    })

    // 转换为 uploader 需要的格式
    const files = results.map((item: MediaResult) => ({
      url: item.url,
      isImage: item.type === 'image',
      isVideo: item.type === 'video'
    }))

    // 更新对应类型的文件列表
    if (type === 'controller') {
      controllerFiles.value = [...controllerFiles.value, ...files].slice(0, 9)
    } else if (type === 'touchscreen') {
      touchscreenFiles.value = [...touchscreenFiles.value, ...files].slice(0, 9)
    } else if (type === 'cabinet') {
      cabinetFiles.value = [...cabinetFiles.value, ...files].slice(0, 9)
    }

    updateMediaUrls()
    closeToast()
  } catch (error: any) {
    closeToast()
    showToast(error.message || '选择媒体失败')
  }
}

// beforeRead 回调 - 拦截默认行为，使用钉钉 API
const beforeRead = async (file: UploaderFileListItem | UploaderFileListItem[], type: string) => {
  // 钉钉环境下使用 chooseMedia
  if (isDingTalk()) {
    // 阻止默认行为
    await handleMediaChoose(type)
    return false
  }
  // 非钉钉环境使用默认行为
  return true
}

// 处理文件大小超限
const handleOversize = (file: UploaderFileListItem, type: string) => {
  showToast(`文件大小不能超过100MB`)
}

// 处理文件删除
const handleDelete = (file: UploaderFileListItem, type: string) => {
  updateMediaUrls()
}

// 更新媒体URL
const updateMediaUrls = () => {
  const formatFiles = (files: UploaderFileListItem[]) => {
    return files
      .filter(f => f.url)
      .map(f => ({ url: f.url, type: f.file?.type?.startsWith('video') ? 'video' : 'image' }))
  }

  formData.controllerPhotos = JSON.stringify(formatFiles(controllerFiles.value))
  formData.touchscreenPhotos = JSON.stringify(formatFiles(touchscreenFiles.value))
  formData.cabinetPhotos = JSON.stringify(formatFiles(cabinetFiles.value))
  updateValue()
}

// 初始化
onMounted(() => {
  Object.assign(formData, props.modelValue)

  // 初始化媒体文件
  try {
    if (formData.controllerPhotos) {
      const photos = JSON.parse(formData.controllerPhotos)
      controllerFiles.value = photos.map((p: any) => ({ url: p.url }))
    }
  } catch (e) { /* ignore */ }

  try {
    if (formData.touchscreenPhotos) {
      const photos = JSON.parse(formData.touchscreenPhotos)
      touchscreenFiles.value = photos.map((p: any) => ({ url: p.url }))
    }
  } catch (e) { /* ignore */ }

  try {
    if (formData.cabinetPhotos) {
      const photos = JSON.parse(formData.cabinetPhotos)
      cabinetFiles.value = photos.map((p: any) => ({ url: p.url }))
    }
  } catch (e) { /* ignore */ }
})

// 暴露验证方法
defineExpose({
  validate: () => {
    if (formData.isInterfaceOccupied === undefined) {
      showToast('请选择接口被占用')
      return false
    }
    if (!formData.interfaceType) {
      showToast('请选择接口类型')
      return false
    }
    if (formData.hasTouchScreen === undefined) {
      showToast('请选择连接触摸屏')
      return false
    }
    if (formData.hasTouchScreen === 'true' && !formData.touchScreenBrand) {
      showToast('请输入触摸屏品牌')
      return false
    }
    if (!formData.controllerBrand) {
      showToast('请选择或输入控制器品牌')
      return false
    }
    return true
  }
})
</script>

<style scoped>
.controller-info-step {
  padding: 16px 0;
}

:deep(.van-cell-group) {
  margin-bottom: 12px;
}
</style>
