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
      <div class="action-buttons" v-if="issue.status !== 'closed'">
        <van-button
          v-if="issue.status === 'open'"
          type="primary"
          size="large"
          round
          block
          @click="handleStart"
        >
          开始处理
        </van-button>
        <van-button
          v-if="issue.status === 'in_progress'"
          type="success"
          size="large"
          round
          block
          @click="handleResolve"
        >
          标记已解决
        </van-button>
        <van-button
          v-if="issue.status === 'resolved'"
          type="primary"
          size="large"
          round
          block
          @click="handleClose"
        >
          关闭问题
        </van-button>
        <van-button
          v-if="issue.status === 'resolved'"
          size="large"
          round
          block
          @click="handleReopen"
        >
          重新打开
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
import { mobileIssueApi, issueApi, type MobileIssue } from '@/api/issue'

const router = useRouter()
const route = useRoute()

const issue = ref<MobileIssue>()
const currentUserId = Number(localStorage.getItem('userId')) || 1

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    open: 'warning',
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

// 开始处理
const handleStart = () => {
  showConfirmDialog({
    title: '确认操作',
    message: '确定要开始处理此问题吗？'
  }).then(async () => {
    try {
      await issueApi.updateStatus(issue.value!.id, 'in_progress', currentUserId, '开始处理')
      showToast('已开始处理')
      loadData()
    } catch (e: any) {
      showToast(e.message || '操作失败')
    }
  }).catch(() => {})
}

// 标记已解决
const handleResolve = () => {
  showConfirmDialog({
    title: '确认操作',
    message: '确定要将此问题标记为已解决吗？'
  }).then(async () => {
    try {
      await issueApi.updateStatus(issue.value!.id, 'resolved', currentUserId, '问题已解决')
      showToast('已标记为解决')
      loadData()
    } catch (e: any) {
      showToast(e.message || '操作失败')
    }
  }).catch(() => {})
}

// 关闭问题
const handleClose = () => {
  showConfirmDialog({
    title: '确认操作',
    message: '确定要关闭此问题吗？'
  }).then(async () => {
    try {
      await issueApi.updateStatus(issue.value!.id, 'closed', currentUserId, '关闭问题')
      showToast('已关闭')
      loadData()
    } catch (e: any) {
      showToast(e.message || '操作失败')
    }
  }).catch(() => {})
}

// 重新打开
const handleReopen = () => {
  showConfirmDialog({
    title: '确认操作',
    message: '确定要重新打开此问题吗？'
  }).then(async () => {
    try {
      await issueApi.updateStatus(issue.value!.id, 'in_progress', currentUserId, '重新打开')
      showToast('已重新打开')
      loadData()
    } catch (e: any) {
      showToast(e.message || '操作失败')
    }
  }).catch(() => {})
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
