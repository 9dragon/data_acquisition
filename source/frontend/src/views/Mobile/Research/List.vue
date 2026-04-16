<template>
  <div class="research-list-page">
    <!-- 状态筛选 -->
    <van-tabs v-model:active="activeStatus" @change="onStatusChange" :before-change="onBeforeChange">
      <van-tab title="全部" name="" />
      <van-tab title="进行中" name="in_progress" />
      <van-tab title="已完成" name="completed" />
    </van-tabs>

    <!-- 调研列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        :immediate-check="false"
        @load="onLoad"
      >
        <div
          v-for="item in list"
          :key="item.id"
          class="research-item"
          @click="goToDetail(item.id)"
        >
          <div class="research-header">
            <span class="research-workshop">{{ item.workshopName || '-' }}</span>
            <van-tag :type="getStatusType(item.researchProgress)">
              {{ getStatusText(item.researchProgress) }}
            </van-tag>
          </div>

          <div class="research-title">
            {{ item.deviceTypeName || '-' }}
            <span v-if="item.quantity">（{{ item.quantity }}台）</span>
          </div>

          <div class="research-info" v-if="item.deviceManufacturer">
            <span class="info-item">
              <van-icon name="building-o" />
              {{ item.deviceManufacturer }}
            </span>
          </div>

          <div class="research-progress">
            <van-progress
              :percentage="item.researchProgress || 0"
              :color="getProgressColor(item.researchProgress)"
              :pivot-text="`${item.researchProgress || 0}%`"
              pivot-color="#1989fa"
            />
          </div>

          <div class="research-footer">
            <span class="research-date">{{ formatDate(item.createdAt) }}</span>
            <van-button
              v-if="(item.researchProgress || 0) < 100"
              size="small"
              type="primary"
              @click.stop="goToEdit(item.id)"
            >
              {{ (item.researchProgress || 0) === 0 ? '开始填报' : '继续填报' }}
            </van-button>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>

    <!-- 浮动新建按钮 -->
    <van-floating-bubble
      icon="plus"
      magnetic="x"
      :offset="{ x: 24, y: 80 }"
      @click="goToCreate"
    />

    <!-- 空状态 -->
    <van-empty v-if="list.length === 0 && !loading" description="暂无调研记录" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { deviceResearchApi } from '@/api/deviceResearch'
import { useMobileProjectStore } from '@/stores/mobileProject'
import type { DeviceResearch } from '@/types/device'

const router = useRouter()
const projectStore = useMobileProjectStore()

// 当前项目
const currentProject = computed(() => projectStore.currentProject)

// 当前选中的状态
type ResearchStatus = '' | 'in_progress' | 'completed'
const activeStatus = ref<ResearchStatus>('')

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  projectId: undefined as number | undefined,
  workshop: ''
})

// 列表数据
const list = ref<DeviceResearch[]>([])

// 分页状态
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

// 是否首次加载
const isFirstLoad = ref(true)

// 获取状态类型
const getStatusType = (progress?: number) => {
  if (!progress) return 'default'
  if (progress >= 100) return 'success'  // 已完成：绿色
  return 'primary'                       // 进行中：蓝色
}

// 获取状态文本
const getStatusText = (progress?: number) => {
  if (!progress) return '-'
  if (progress >= 100) return '已完成'
  return '进行中'
}

// 获取进度颜色
const getProgressColor = (progress?: number) => {
  if (!progress) return '#ddd'
  if (progress >= 100) return '#07c160'  // 已完成：绿色
  return '#1989fa'                       // 进行中：蓝色
}

// 格式化日期
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
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
  queryParams.pageNum = 1
  list.value = []
  finished.value = false
  nextTick(() => {
    onLoad()
  })
}

// 标签切换前的钩子
const onBeforeChange = () => {
  return true
}

// 跳转详情
const goToDetail = (id: number) => {
  router.push(`/mobile/research/detail/${id}`)
}

// 跳转编辑
const goToEdit = (id: number) => {
  router.push(`/mobile/research/create?id=${id}`)
}

// 跳转新建
const goToCreate = () => {
  if (!currentProject.value) {
    showToast('请先选择项目')
    return
  }
  router.push('/mobile/research/create')
}

// 加载数据
const onLoad = async () => {
  if (isFirstLoad.value) {
    return
  }

  if (loading.value || finished.value) {
    return
  }

  if (refreshing.value) {
    list.value = []
    refreshing.value = false
  }

  loading.value = true

  try {
    const result = await deviceResearchApi.getPage(queryParams)
    let newList = result.records || []

    // 根据状态筛选
    if (activeStatus.value === 'in_progress') {
      newList = newList.filter(item => (item.researchProgress || 0) < 100)
    } else if (activeStatus.value === 'completed') {
      newList = newList.filter(item => (item.researchProgress || 0) >= 100)
    }

    if (queryParams.pageNum === 1) {
      list.value = newList
    } else {
      list.value.push(...newList)
    }

    if (newList.length < queryParams.pageSize) {
      finished.value = true
    } else {
      queryParams.pageNum++
    }
  } catch (error) {
    console.error('加载调研列表失败:', error)
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

// 初始化
onMounted(async () => {
  // 获取当前项目
  await projectStore.fetchCurrentProject()

  // 设置项目ID用于筛选
  if (currentProject.value?.id) {
    queryParams.projectId = currentProject.value.id
  }

  isFirstLoad.value = false
  onLoad()
})
</script>

<style scoped>
.research-list-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 调研卡片 */
.research-item {
  margin: 12px;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
}

.research-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.research-workshop {
  font-size: 14px;
  color: #1989fa;
  font-weight: 500;
}

.research-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.research-info {
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

.research-progress {
  margin-bottom: 12px;
}

.research-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.research-date {
  font-size: 12px;
  color: #999;
}
</style>
