<template>
  <div class="issue-report-page">
    <!-- 问题描述 -->
    <van-cell-group inset title="问题描述">
      <van-field
        v-model="formData.title"
        label="标题"
        placeholder="请输入问题标题"
        required
      />
      <van-cell
        is-link
        title="问题类型"
        :value="selectedTypeText || '请选择'"
        required
        @click="showTypePicker = true"
      />
      <van-cell
        is-link
        title="优先级"
        :value="getPriorityText(formData.priority)"
        @click="showPriorityPicker = true"
      />
      <van-field
        v-model="formData.description"
        type="textarea"
        label="详细描述"
        placeholder="请详细描述问题情况"
        rows="4"
        maxlength="1000"
        show-word-limit
      />
    </van-cell-group>

    <!-- 关联信息 -->
    <van-cell-group inset title="关联信息">
      <van-cell
        is-link
        title="关联设备"
        :value="selectedDevice || '选填'"
        @click="showDevicePicker = true"
      />
    </van-cell-group>

    <!-- 现场照片 -->
    <van-cell-group inset title="现场照片">
      <div class="photo-section">
        <van-uploader
          v-model="fileList"
          :after-read="afterRead"
          :before-delete="beforeDelete"
          multiple
          max-count="9"
          accept="image/*"
        />
      </div>
    </van-cell-group>

    <!-- 提交按钮 -->
    <div class="submit-section">
      <van-button
        type="primary"
        size="large"
        round
        block
        :loading="submitting"
        @click="handleSubmit"
      >
        提交上报
      </van-button>
    </div>

    <!-- 设备选择弹窗 -->
    <van-popup v-model:show="showDevicePicker" position="bottom">
      <van-picker
        :columns="deviceList"
        @confirm="onDeviceConfirm"
        @cancel="showDevicePicker = false"
      />
    </van-popup>

    <!-- 类型选择弹窗 -->
    <van-popup v-model:show="showTypePicker" position="bottom">
      <van-picker
        :columns="typeOptions"
        @confirm="onTypeConfirm"
        @cancel="showTypePicker = false"
      />
    </van-popup>

    <!-- 优先级选择弹窗 -->
    <van-popup v-model:show="showPriorityPicker" position="bottom">
      <van-picker
        :columns="priorityOptions"
        @confirm="onPriorityConfirm"
        @cancel="showPriorityPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast, type UploaderFileListItem } from 'vant'
import { mobileIssueApi, type IssueReportRequest, type IssuePriority } from '@/api/issue'
import { useMobileProjectStore } from '@/stores/mobileProject'

const router = useRouter()
const projectStore = useMobileProjectStore()

const submitting = ref(false)
const showDevicePicker = ref(false)
const showTypePicker = ref(false)
const showPriorityPicker = ref(false)

// 表单数据
const formData = reactive<IssueReportRequest>({
  title: '',
  type: '',
  priority: 'medium',
  description: '',
  projectId: 0,
  deviceId: undefined,
  photos: []
})

// 选中的显示文本
const selectedDevice = ref('')
const selectedTypeText = computed(() => {
  return typeOptions.find(t => t.value === formData.type)?.text || ''
})

// 文件列表
const fileList = ref<UploaderFileListItem[]>([])

// 设备列表
const deviceList = ref([
  { text: '设备1', value: 1 },
  { text: '设备2', value: 2 },
  { text: '设备3', value: 3 }
])

// 问题类型选项
const typeOptions = [
  { text: '设备故障', value: 'device_fault' },
  { text: '质量问题', value: 'quality' },
  { text: '安全问题', value: 'safety' },
  { text: '进度问题', value: 'schedule' },
  { text: '其他', value: 'other' }
]

// 优先级选项
const priorityOptions = [
  { text: '低', value: 'low' },
  { text: '中', value: 'medium' },
  { text: '高', value: 'high' },
  { text: '紧急', value: 'urgent' }
]

// 获取优先级文本
const getPriorityText = (priority: IssuePriority) => {
  const textMap: Record<IssuePriority, string> = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急'
  }
  return textMap[priority]
}

// 选择设备
const onDeviceConfirm = ({ selectedOptions }: any) => {
  if (selectedOptions[0].value) {
    selectedDevice.value = selectedOptions[0].text
    formData.deviceId = selectedOptions[0].value
  }
  showDevicePicker.value = false
}

// 选择类型
const onTypeConfirm = ({ selectedOptions }: any) => {
  formData.type = selectedOptions[0].value
  showTypePicker.value = false
}

// 选择优先级
const onPriorityConfirm = ({ selectedOptions }: any) => {
  formData.priority = selectedOptions[0].value
  showPriorityPicker.value = false
}

// 文件上传后
const afterRead = async (file: UploaderFileListItem | UploaderFileListItem[]) => {
  const files = Array.isArray(file) ? file : [file]

  for (const item of files) {
    if (item.status === 'uploading') {
      try {
        const result = await mobileIssueApi.uploadPhoto(item.file as File)
        item.status = 'done'
        formData.photos?.push(result.url)
      } catch (error) {
        item.status = 'failed'
        showToast('上传失败')
      }
    }
  }
}

// 删除文件
const beforeDelete = (file: UploaderFileListItem) => {
  const index = fileList.value.indexOf(file)
  if (index > -1) {
    formData.photos?.splice(index, 1)
  }
  return true
}

// 提交上报
const handleSubmit = async () => {
  if (!formData.title) {
    showToast('请输入问题标题')
    return
  }
  if (!formData.type) {
    showToast('请选择问题类型')
    return
  }

  submitting.value = true
  showLoadingToast({
    message: '提交中...',
    forbidClick: true,
    duration: 0
  })

  try {
    await mobileIssueApi.report(formData)
    closeToast()
    showToast('上报成功')

    setTimeout(() => {
      router.back()
    }, 1500)
  } catch (error: any) {
    closeToast()
    showToast(error.message || '上报失败')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await projectStore.fetchCurrentProject()
  if (projectStore.currentProject?.id) {
    formData.projectId = projectStore.currentProject.id
  }
})
</script>

<style scoped>
.issue-report-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 80px;
}

.photo-section {
  padding: 16px;
}

.submit-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}
</style>
