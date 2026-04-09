<template>
  <div class="task-list-page">
    <!-- 状态筛选 -->
    <van-tabs v-model:active="activeStatus" @change="onStatusChange" :before-change="onBeforeChange">
      <van-tab title="全部" name="" />
      <van-tab title="待处理" name="pending" />
      <van-tab title="进行中" name="in_progress" />
      <van-tab title="已完成" name="completed" />
    </van-tabs>

    <!-- 任务列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        :immediate-check="false"
        @load="onLoad"
      >
        <div
          v-for="task in tasks"
          :key="task.id"
          class="task-item"
          @click="goToDetail(task.id)"
        >
          <div class="task-header">
            <span class="task-stage">{{ task.stageName || '未分类' }}</span>
            <van-tag :type="getStatusType(task.status)">
              {{ getStatusText(task.status) }}
            </van-tag>
          </div>
          <div class="task-title">{{ task.name }}</div>
          <div class="task-info">
            <span v-if="task.managerName" class="info-item">
              <van-icon name="manager-o" />
              负责人: {{ task.managerName }}
            </span>
          </div>
          <div class="task-progress">
            <van-progress :percentage="task.progress" :color="getProgressColor(task.progress)" />
          </div>
          <div class="task-footer">
            <span class="task-date">
              截止: {{ formatDate(task.endDate) }}
            </span>
            <van-button
              v-if="task.status !== 'completed'"
              size="small"
              type="primary"
              @click.stop="goToReport(task.id)"
            >
              填报
            </van-button>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>

    <!-- 空状态 -->
    <van-empty v-if="tasks.length === 0 && !loading" description="暂无任务" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { mobileTaskApi, type MobileTask, type TaskStatus } from '@/api/task'

const router = useRouter()

// 当前选中的状态
const activeStatus = ref<TaskStatus | ''>('')

// 查询参数
const queryParams = reactive({
  status: undefined as TaskStatus | undefined,
  pageNum: 1,
  pageSize: 10
})

// 任务列表
const tasks = ref<MobileTask[]>([])

// 分页状态
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

// 是否首次加载（用于防止 van-list 的 immediate-check 自动触发）
const isFirstLoad = ref(true)

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

// 获取进度颜色
const getProgressColor = (progress: number) => {
  if (progress >= 100) return '#07c160'
  if (progress >= 50) return '#1989fa'
  return '#ff976a'
}

// 格式化日期
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '无截止日期'
  return dateStr
}

// 状态变化
const onStatusChange = () => {
  queryParams.status = activeStatus.value || undefined
  queryParams.pageNum = 1
  tasks.value = []
  finished.value = false
  // 使用 nextTick 确保状态更新后再触发加载
  nextTick(() => {
    onLoad()
  })
}

// 跳转到详情
const goToDetail = (id: number) => {
  router.push(`/mobile/task/detail/${id}`)
}

// 跳转到填报
const goToReport = (id: number) => {
  router.push(`/mobile/task/report/${id}`)
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
    tasks.value = []
    refreshing.value = false
  }

  loading.value = true

  try {
    const result = await mobileTaskApi.myTasks(queryParams)
    const newTasks = result.records || []

    if (queryParams.pageNum === 1) {
      tasks.value = newTasks
    } else {
      tasks.value.push(...newTasks)
    }

    // 判断是否加载完成
    if (newTasks.length < queryParams.pageSize) {
      finished.value = true
    } else {
      queryParams.pageNum++
    }
  } catch (error) {
    console.error('加载任务失败:', error)
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
onMounted(() => {
  isFirstLoad.value = false
  onLoad()
})
</script>

<style scoped>
.task-list-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.task-item {
  margin: 12px;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.task-code {
  font-size: 12px;
  color: #999;
}

.task-stage {
  font-size: 12px;
  color: #1989fa;
  font-weight: 500;
}

.task-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.task-info {
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

.task-progress {
  margin-bottom: 12px;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-date {
  font-size: 12px;
  color: #999;
}
</style>
