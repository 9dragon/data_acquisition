<template>
  <div class="media-upload">
    <el-upload
      v-model:file-list="fileList"
      :action="uploadUrl"
      :list-type="listType"
      :accept="accept"
      :limit="maxCount"
      :disabled="disabled"
      :on-preview="handlePreview"
      :on-success="handleSuccess"
      :on-remove="handleRemove"
      :before-upload="beforeUpload"
      multiple
    >
      <el-button v-if="fileList.length < maxCount" type="primary" :icon="Upload">
        上传{{ typeLabel }}
      </el-button>
      <template #tip>
        <div class="el-upload__tip">
          只能上传 {{ acceptLabel }} 文件，大小不超过 {{ maxSize }}MB，最多 {{ maxCount }} 个
        </div>
      </template>
    </el-upload>

    <!-- 预览弹窗 -->
    <el-dialog v-model="previewVisible" title="预览" width="800px">
      <img v-if="previewType === 'image'" :src="previewUrl" style="width: 100%" />
      <video v-else-if="previewType === 'video'" :src="previewUrl" controls style="width: 100%" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { UploadUserFile, UploadProps } from 'element-plus'

/**
 * 多媒体附件接口
 */
export interface MediaAttachment {
  id: string
  name: string
  url: string
  type: 'image' | 'video'
}

interface Props {
  modelValue?: MediaAttachment[]
  acceptType?: 'image' | 'video'
  maxCount?: number
  maxSize?: number // MB
  disabled?: boolean
  listType?: 'picture-card' | 'text'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  acceptType: 'image',
  maxCount: 10,
  maxSize: 10,
  disabled: false,
  listType: 'picture-card'
})

const emit = defineEmits<{
  'update:modelValue': [value: MediaAttachment[]]
}>()

const uploadUrl = '/api/v1/upload'
const previewVisible = ref(false)
const previewUrl = ref('')
const previewType = ref<'image' | 'video'>('image')

const fileList = ref<UploadUserFile[]>([])

const accept = computed(() => {
  if (props.acceptType === 'image') return 'image/*'
  return 'video/*'
})

const acceptLabel = computed(() => {
  if (props.acceptType === 'image') return '图片'
  return '视频'
})

const typeLabel = computed(() => {
  return props.acceptType === 'image' ? '图片' : '视频'
})

// 初始化文件列表
watch(() => props.modelValue, (newVal) => {
  fileList.value = newVal.map(item => ({
    name: item.name,
    url: item.url,
    uid: item.id
  }))
}, { immediate: true })

const handlePreview: UploadProps['onPreview'] = (file) => {
  previewUrl.value = file.url || ''
  previewType.value = props.acceptType
  previewVisible.value = true
}

const handleSuccess = (response: any, file: any) => {
  const attachment: MediaAttachment = {
    id: response.id || file.uid,
    name: file.name,
    url: response.url || file.url,
    type: props.acceptType
  }
  emitValue([...props.modelValue, attachment])
}

const handleRemove = (file: any) => {
  const index = fileList.value.findIndex(f => f.uid === file.uid)
  if (index > -1) {
    const newValue = [...props.modelValue]
    newValue.splice(index, 1)
    emitValue(newValue)
  }
}

const beforeUpload = (file: File) => {
  const isRightType = props.acceptType === 'image'
    ? file.type.startsWith('image/')
    : file.type.startsWith('video/')

  if (!isRightType) {
    ElMessage.error(`只能上传${typeLabel.value}文件!`)
    return false
  }

  const isRightSize = file.size / 1024 / 1024 < props.maxSize
  if (!isRightSize) {
    ElMessage.error(`文件大小不能超过 ${props.maxSize}MB!`)
    return false
  }

  return true
}

const emitValue = (value: MediaAttachment[]) => {
  emit('update:modelValue', value)
}
</script>

<style scoped>
.media-upload {
  width: 100%;
}

.el-upload__tip {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}
</style>
