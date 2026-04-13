<template>
  <div class="task-report-page">
    <div v-if="task" class="report-content">
      <!-- 任务信息 -->
      <div class="task-info">
        <div class="task-title">{{ task.title }}</div>
        <div class="task-meta">
          <span class="task-code">{{ task.code }}</span>
          <van-tag :type="getStatusType(task.status)">
            {{ getStatusText(task.status) }}
          </van-tag>
        </div>
      </div>

      <!-- 进度调整 -->
      <van-cell-group title="进度更新" inset>
        <van-cell title="当前进度" :value="`${task.progress}%`" />
        <van-cell title="更新进度">
          <template #value>
            <van-slider
              v-model="formData.progress"
              :min="task.progress"
              :max="100"
              :step="5"
              bar-height="4px"
              active-color="#1989fa"
            />
          </template>
        </van-cell>
        <van-cell title="新进度" :value="`${formData.progress}%`" />
      </van-cell-group>

      <!-- 工时填报 -->
      <van-cell-group title="工时填报" inset>
        <van-field
          v-model="formData.actualHours"
          type="number"
          label="实际工时"
          placeholder="请输入实际工时（小时）"
          input-align="right"
        />
      </van-cell-group>

      <!-- 状态更新 -->
      <van-cell-group title="状态更新" inset>
        <van-cell
          title="任务状态"
          is-link
          :value="getStatusText(formData.status || task.status)"
          @click="showStatusPicker = true"
        />
      </van-cell-group>

      <!-- 备注 -->
      <van-cell-group title="备注说明" inset>
        <van-field
          v-model="formData.remarks"
          type="textarea"
          placeholder="请输入备注说明（选填）"
          rows="3"
          maxlength="500"
          show-word-limit
        />
      </van-cell-group>

      <!-- 附件上传 -->
      <van-cell-group title="附件上传" inset>
        <van-uploader
          v-model="fileList"
          :after-read="afterRead"
          :before-delete="beforeDelete"
          multiple
          max-count="9"
        />
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
          提交填报
        </van-button>
      </div>
    </div>

    <!-- 状态选择器 -->
    <van-popup v-model:show="showStatusPicker" position="bottom">
      <van-picker
        :columns="statusOptions"
        @confirm="onStatusConfirm"
        @cancel="showStatusPicker = false"
      />
    </van-popup>

    <!-- 加载中 -->
    <van-loading v-if="!task" type="spinner" size="24" vertical>
      加载中...
    </van-loading>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showLoadingToast, closeToast, type UploaderFileListItem } from 'vant'
import { mobileTaskApi, type MobileTask, type TaskReportRequest, type TaskStatus } from '@/api/task'

const router = useRouter()
const route = useRoute()

const task = ref<MobileTask>()
const submitting = ref(false)
const showStatusPicker = ref(false)

// 表单数据
const formData = reactive<TaskReportRequest>({
  progress: 0,
  actualHours: undefined,
  status: undefined,
  remarks: '',
  attachments: []
})

// 文件列表
const fileList = ref<UploaderFileListItem[]>([])

// 状态选项
const statusOptions = [
  { text: '待处理', value: 'pending' },
  { text: '进行中', value: 'in_progress' },
  { text: '已完成', value: 'completed' }
]

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    pending: 'warning',
    in_progress: 'primary',
    completed: 'success',
    cancelled: 'default'
  }
  return typeMap[status] || 'default'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待处理',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return textMap[status] || status
}

// 状态选择确认
const onStatusConfirm = ({ selectedOptions }: any) => {
  formData.status = selectedOptions[0].value
  showStatusPicker.value = false
}

// 文件上传后
const afterRead = async (file: UploaderFileListItem | UploaderFileListItem[]) => {
  const files = Array.isArray(file) ? file : [file]

  for (const item of files) {
    if (item.status === 'uploading') {
      try {
        const result = await mobileTaskApi.uploadAttachment(item.file as File)
        item.status = 'done'
        formData.attachments?.push(result.url)
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
    formData.attachments?.splice(index, 1)
  }
  return true
}

// 提交填报
const handleSubmit = async () => {
  // 验证
  if (formData.progress <= task.value!.progress) {
    showToast('请更新进度')
    return
  }

  submitting.value = true
  showLoadingToast({
    message: '提交中...',
    forbidClick: true,
    duration: 0
  })

  try {
    await mobileTaskApi.report(Number(route.params.id), formData)
    closeToast()
    showToast('填报成功')

    setTimeout(() => {
      router.back()
    }, 1500)
  } catch (error: any) {
    closeToast()
    showToast(error.message || '填报失败')
  } finally {
    submitting.value = false
  }
}

// 加载任务详情
onMounted(async () => {
  const id = Number(route.params.id)
  if (isNaN(id)) {
    showToast('任务ID无效')
    router.back()
    return
  }

  try {
    task.value = await mobileTaskApi.detail(id)
    formData.progress = task.value.progress
  } catch (error) {
    showToast('加载失败')
    router.back()
  }
})
</script>

<style scoped>
.task-report-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 80px;
}

.task-info {
  background: linear-gradient(135deg, #1989fa 0%, #40a9ff 100%);
  margin: 16px;
  padding: 20px;
  border-radius: 12px;
  color: #fff;
}

.task-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-code {
  font-size: 14px;
  opacity: 0.9;
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

:deep(.van-slider) {
  margin: 0 16px;
}
</style>
