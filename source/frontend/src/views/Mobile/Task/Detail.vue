<template>
  <div class="task-detail-page">
    <div v-if="task" class="detail-content">
      <!-- 状态卡片 -->
      <div class="status-card" :class="`status-${task.status}`">
        <div class="status-info">
          <div class="status-text">{{ getStatusText(task.status) }}</div>
          <div class="task-code">{{ task.code }}</div>
        </div>
        <div class="progress-circle">
          <van-circle
            :rate="task.progress"
            :color="getProgressColor(task.progress)"
            :text="`${task.progress}%`"
            size="60"
          />
        </div>
      </div>

      <!-- 基本信息 -->
      <van-cell-group title="基本信息" inset>
        <van-cell title="任务名称" :value="task.title" />
        <van-cell title="所属项目" :value="task.projectName" v-if="task.projectName" />
        <van-cell title="关联设备" :value="task.deviceName" v-if="task.deviceName" />
        <van-cell title="负责人" :value="task.assigneeName" v-if="task.assigneeName" />
        <van-cell title="优先级" :value="getPriorityText(task.priority)" />
      </van-cell-group>

      <!-- 时间信息 -->
      <van-cell-group title="时间信息" inset>
        <van-cell title="计划开始" :value="formatDateTime(task.plannedStartDate)" />
        <van-cell title="计划结束" :value="formatDateTime(task.plannedEndDate)" />
        <van-cell title="实际开始" :value="formatDateTime(task.actualStartDate)" />
        <van-cell title="实际结束" :value="formatDateTime(task.actualEndDate)" />
      </van-cell-group>

      <!-- 任务描述 -->
      <van-cell-group title="任务描述" inset v-if="task.description">
        <van-cell>
          <template #value>
            <div class="description">{{ task.description }}</div>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 备注 -->
      <van-cell-group title="备注" inset v-if="task.remarks">
        <van-cell>
          <template #value>
            <div class="remarks">{{ task.remarks }}</div>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 操作按钮 -->
      <div class="action-buttons" v-if="task.status !== 'completed'">
        <van-button
          type="primary"
          size="large"
          round
          block
          @click="goToReport"
        >
          填报进度
        </van-button>
      </div>
    </div>

    <!-- 加载中 -->
    <van-loading v-else type="spinner" size="24" vertical>
      加载中...
    </van-loading>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { mobileTaskApi, type MobileTask } from '@/api/task'

const router = useRouter()
const route = useRoute()

const task = ref<MobileTask>()

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

// 获取优先级文本
const getPriorityText = (priority: string) => {
  const textMap: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急'
  }
  return textMap[priority] || priority
}

// 获取进度颜色
const getProgressColor = (progress: number) => {
  if (progress >= 100) return '#07c160'
  if (progress >= 50) return '#1989fa'
  return '#ff976a'
}

// 格式化日期时间
const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return '未设置'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 跳转到填报页面
const goToReport = () => {
  router.push(`/mobile/task/report/${route.params.id}`)
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
  } catch (error) {
    showToast('加载失败')
    router.back()
  }
})
</script>

<style scoped>
.task-detail-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 80px;
}

.status-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px;
  padding: 20px;
  border-radius: 12px;
  color: #fff;
}

.status-pending {
  background: linear-gradient(135deg, #ff976a 0%, #ffad89 100%);
}

.status-in_progress {
  background: linear-gradient(135deg, #1989fa 0%, #40a9ff 100%);
}

.status-completed {
  background: linear-gradient(135deg, #07c160 0%, #3ad068 100%);
}

.status-cancelled {
  background: linear-gradient(135deg, #969799 0%, #b3b3b5 100%);
}

.status-info {
  flex: 1;
}

.status-text {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}

.task-code {
  font-size: 14px;
  opacity: 0.9;
}

.description,
.remarks {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
  color: #666;
}

.action-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}
</style>
