<template>
  <div class="issue-list-page">
    <!-- 状态筛选 -->
    <van-tabs v-model:active="activeStatus" lazy-render @change="onStatusChange">
      <van-tab title="全部" name="" />
      <van-tab title="待处理" name="open" />
      <van-tab title="处理中" name="in_progress" />
      <van-tab title="已解决" name="resolved" />
      <van-tab title="已关闭" name="closed" />
    </van-tabs>

    <!-- 问题列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        :immediate-check="false"
        @load="onLoad"
      >
        <div
          v-for="issue in issues"
          :key="issue.id"
          class="issue-item"
          @click="goToDetail(issue.id)"
        >
          <div class="issue-header">
            <span class="issue-code">{{ issue.code }}</span>
            <div class="tags">
              <van-tag :type="getPriorityType(issue.priority)" size="small">
                {{ getPriorityText(issue.priority) }}
              </van-tag>
              <van-tag :type="getStatusType(issue.status)" size="small">
                {{ getStatusText(issue.status) }}
              </van-tag>
            </div>
          </div>
          <div class="issue-title">{{ issue.title }}</div>
          <div class="issue-info">
            <span v-if="issue.deviceName" class="info-item">
              <van-icon name="monitor-o" />
              {{ issue.deviceName }}
            </span>
          </div>
          <div class="issue-footer">
            <span class="issue-date">{{ formatDate(issue.createdAt) }}</span>
            <div class="footer-users">
              <span v-if="issue.assigneeName" class="info-item">
                <van-icon name="manager-o" />
                {{ issue.assigneeName }}
              </span>
              <span v-if="issue.reporterName" class="info-item">
                <van-icon name="user-o" />
                {{ issue.reporterName }}
              </span>
            </div>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>

    <!-- 浮动按钮 - 上报问题 -->
    <div class="fab-container" @click="goToReport">
      <van-icon name="plus" size="24" color="#fff" />
    </div>

    <!-- 空状态 -->
    <van-empty v-if="issues.length === 0 && !loading" description="暂无问题" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { issueApi, type IssueQueryParams } from '@/api/issue'
import type { Issue, IssueStatus } from '@/types/issue'
import { useMobileProjectStore } from '@/stores/mobileProject'

const router = useRouter()
const projectStore = useMobileProjectStore()
const currentProject = computed(() => projectStore.currentProject)

// 当前选中的状态
const activeStatus = ref<IssueStatus | ''>('')

// 查询参数
const queryParams = reactive({
  status: undefined as IssueStatus | undefined,
  projectId: undefined as number | undefined,
  pageNum: 1,
  pageSize: 10
})

// 问题列表
const issues = ref<Issue[]>([])

// 分页状态
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

// 是否首次加载（用于防止 van-list 的 immediate-check 自动触发）
const isFirstLoad = ref(true)

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

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return '今天'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
}

// 状态变化
const onStatusChange = () => {
  queryParams.status = activeStatus.value || undefined
  queryParams.pageNum = 1
  issues.value = []
  finished.value = false
  // 使用 nextTick 确保状态更新后再触发加载
  nextTick(() => {
    onLoad()
  })
}

// 跳转到详情
const goToDetail = (id: number) => {
  router.push(`/mobile/issue/detail/${id}`)
}

// 跳转到上报
const goToReport = () => {
  router.push('/mobile/issue/report')
}

// 加载数据
const onLoad = async () => {
  // 初始加载由 onMounted 控制
  if (isFirstLoad.value) {
    return
  }

  // 防止重复加载
  if (loading.value || finished.value) {
    return
  }

  if (refreshing.value) {
    issues.value = []
    refreshing.value = false
  }

  loading.value = true

  try {
    const result = await issueApi.page(queryParams)
    const newIssues = result.records || result.data || []

    if (queryParams.pageNum === 1) {
      issues.value = newIssues
    } else {
      issues.value.push(...newIssues)
    }

    // 判断是否加载完成
    if (newIssues.length < queryParams.pageSize) {
      finished.value = true
    } else {
      queryParams.pageNum++
    }
  } catch (error) {
    console.error('加载问题失败:', error)
    // 关键修复：错误时也要设置 finished，防止无限重试
    finished.value = true
  } finally {
    loading.value = false
  }
}

// 下拉刷新
const onRefresh = () => {
  queryParams.pageNum = 1
  finished.value = false
  onLoad()
}

// 初始化加载
onMounted(async () => {
  await projectStore.fetchCurrentProject()
  if (currentProject.value?.id) {
    queryParams.projectId = currentProject.value.id
  }
  isFirstLoad.value = false
  onLoad()
})
</script>

<style scoped>
.issue-list-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.issue-item {
  margin: 12px;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
}

.issue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.issue-code {
  font-size: 12px;
  color: #999;
}

.tags {
  display: flex;
  gap: 4px;
}

.issue-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.issue-info {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #666;
}

.info-item :deep(.van-icon) {
  margin-right: 4px;
  font-size: 14px;
}

.issue-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.footer-users {
  display: flex;
  gap: 12px;
}

/* 浮动新建按钮 */
.fab-container {
  position: fixed;
  right: 24px;
  bottom: 70px;
  width: 48px;
  height: 48px;
  background: #1989fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(25, 137, 250, 0.4);
  z-index: 999;
  cursor: pointer;
}
</style>
