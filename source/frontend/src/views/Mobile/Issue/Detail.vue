<template>
  <div class="issue-detail-page">
    <div v-if="issue" class="detail-content">
      <!-- 状态卡片 -->
      <div class="status-card" :class="`status-${issue.status}`">
        <div class="status-info">
          <div class="status-text">{{ getStatusText(issue.status) }}</div>
          <div class="issue-code">{{ issue.code }}</div>
        </div>
        <van-tag :type="getPriorityType(issue.priority)" size="large">
          {{ getPriorityText(issue.priority) }}
        </van-tag>
      </div>

      <!-- 基本信息 -->
      <van-cell-group title="基本信息" inset>
        <van-cell title="问题标题" :value="issue.title" />
        <van-cell title="问题类型" :value="getTypeText(issue.type)" />
        <van-cell title="所属项目" :value="issue.projectName" v-if="issue.projectName" />
        <van-cell title="关联设备" :value="issue.deviceName" v-if="issue.deviceName" />
        <van-cell title="上报人" :value="issue.reporterName" v-if="issue.reporterName" />
        <van-cell title="处理人" :value="issue.assigneeName" v-if="issue.assigneeName" />
      </van-cell-group>

      <!-- 时间信息 -->
      <van-cell-group title="时间信息" inset>
        <van-cell title="上报时间" :value="formatDateTime(issue.createdAt)" />
        <van-cell title="截止日期" :value="formatDate(issue.dueDate)" v-if="issue.dueDate" />
        <van-cell title="解决时间" :value="formatDateTime(issue.resolvedAt)" v-if="issue.resolvedAt" />
        <van-cell title="关闭时间" :value="formatDateTime(issue.closedAt)" v-if="issue.closedAt" />
      </van-cell-group>

      <!-- 问题描述 -->
      <van-cell-group title="问题描述" inset v-if="issue.description">
        <van-cell>
          <template #value>
            <div class="description">{{ issue.description }}</div>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 位置信息 -->
      <van-cell-group title="位置信息" inset v-if="issue.address">
        <van-cell title="详细地址" :value="issue.address" />
        <van-cell title="经纬度">
          <template #value>
            <span v-if="issue.latitude && issue.longitude">
              {{ issue.latitude.toFixed(6) }}, {{ issue.longitude.toFixed(6) }}
            </span>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 操作按钮 -->
      <div class="action-buttons" v-if="issue.status !== 'closed' && issue.status !== 'resolved'">
        <van-button
          type="primary"
          size="large"
          round
          block
          @click="handleResolve"
        >
          标记已解决
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
import { showToast, showConfirmDialog } from 'vant'
import { mobileIssueApi, type MobileIssue } from '@/api/issue'

const router = useRouter()
const route = useRoute()

const issue = ref<MobileIssue>()

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    open: 'warning',
    assigned: 'primary',
    in_progress: 'primary',
    resolved: 'success',
    closed: 'default'
  }
  return typeMap[status] || 'default'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    open: '待处理',
    assigned: '已分配',
    in_progress: '处理中',
    resolved: '已解决',
    closed: '已关闭'
  }
  return textMap[status] || status
}

// 获取优先级类型
const getPriorityType = (priority: string) => {
  const typeMap: Record<string, string> = {
    low: 'success',
    medium: 'primary',
    high: 'warning',
    urgent: 'danger'
  }
  return typeMap[priority] || 'default'
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

// 获取类型文本
const getTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    device_fault: '设备故障',
    quality: '质量问题',
    safety: '安全问题',
    schedule: '进度问题',
    other: '其他'
  }
  return textMap[type] || type
}

// 格式化日期时间
const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return '--'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 格式化日期
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '--'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 标记已解决
const handleResolve = () => {
  showConfirmDialog({
    title: '确认操作',
    message: '确定要将此问题标记为已解决吗？'
  }).then(() => {
    showToast('功能开发中...')
    // TODO: 调用API更新状态
  }).catch(() => {
    // 取消
  })
}

// 加载问题详情
onMounted(async () => {
  const id = Number(route.params.id)
  if (isNaN(id)) {
    showToast('问题ID无效')
    router.back()
    return
  }

  try {
    issue.value = await mobileIssueApi.detail(id)
  } catch (error) {
    showToast('加载失败')
    router.back()
  }
})
</script>

<style scoped>
.issue-detail-page {
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

.status-open {
  background: linear-gradient(135deg, #ff976a 0%, #ffad89 100%);
}

.status-assigned {
  background: linear-gradient(135deg, #1989fa 0%, #40a9ff 100%);
}

.status-in_progress {
  background: linear-gradient(135deg, #07c160 0%, #3ad068 100%);
}

.status-resolved {
  background: linear-gradient(135deg, #5cb85c 0%, #7ed67e 100%);
}

.status-closed {
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

.issue-code {
  font-size: 14px;
  opacity: 0.9;
}

.description {
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
