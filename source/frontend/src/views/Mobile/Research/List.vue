<template>
  <div class="research-list">
    <!-- 搜索栏 -->
    <van-search
      v-model="searchKeyword"
      placeholder="搜索设备调研"
      @search="handleSearch"
    />

    <!-- 筛选栏 -->
    <van-dropdown-menu>
      <van-dropdown-item v-model="statusFilter" :options="statusOptions" @change="handleQuery" />
      <van-dropdown-item v-model="dateFilter" :options="dateOptions" @change="handleQuery" />
    </van-dropdown-menu>

    <!-- 调研列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-cell
          v-for="item in list"
          :key="item.id"
          :title="item.deviceName"
          is-link
          @click="goToDetail(item.id)"
        >
          <template #label>
            <div class="research-info">
              <span class="status" :class="item.status">{{ getStatusText(item.status) }}</span>
              <span class="date">{{ formatDate(item.createdAt) }}</span>
            </div>
          </template>
          <template #right-icon>
            <van-button
              v-if="item.status === 'pending'"
              size="small"
              type="primary"
              @click.stop="goToFill(item.id)"
            >
              填报
            </van-button>
          </template>
        </van-cell>
      </van-list>
    </van-pull-refresh>

    <!-- 浮动新建按钮 -->
    <van-floating-bubble
      icon="plus"
      magnetic="x"
      @click="goToCreate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()

// 搜索关键词
const searchKeyword = ref('')

// 状态筛选
const statusFilter = ref(0)
const statusOptions = [
  { text: '全部状态', value: 0 },
  { text: '待填报', value: 'pending' },
  { text: '已完成', value: 'completed' }
]

// 日期筛选
const dateFilter = ref(0)
const dateOptions = [
  { text: '全部时间', value: 0 },
  { text: '今天', value: 1 },
  { text: '本周', value: 2 },
  { text: '本月', value: 3 }
]

// 列表数据
const list = ref<any[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

// 分页参数
const pageNum = ref(1)
const pageSize = ref(10)

// 获取调研列表
const fetchList = async () => {
  loading.value = true
  try {
    // TODO: 调用API获取调研列表
    // const result = await researchApi.list({
    //   keyword: searchKeyword.value,
    //   status: statusFilter.value || undefined,
    //   pageNum: pageNum.value,
    //   pageSize: pageSize.value
    // })

    // 模拟数据
    const mockData = [
      { id: 1, deviceName: '数控机床-001', status: 'pending', createdAt: '2026-04-07 10:00:00' },
      { id: 2, deviceName: '加工中心-A02', status: 'completed', createdAt: '2026-04-06 14:30:00' },
      { id: 3, deviceName: '冲压设备-B01', status: 'pending', createdAt: '2026-04-07 09:15:00' }
    ]

    if (pageNum.value === 1) {
      list.value = mockData
    } else {
      list.value.push(...mockData)
    }

    if (mockData.length < pageSize.value) {
      finished.value = true
    }
  } catch (error) {
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

// 加载更多
const onLoad = () => {
  pageNum.value++
  fetchList()
}

// 下拉刷新
const onRefresh = () => {
  pageNum.value = 1
  finished.value = false
  fetchList().then(() => {
    refreshing.value = false
  })
}

// 搜索
const handleSearch = () => {
  pageNum.value = 1
  finished.value = false
  list.value = []
  fetchList()
}

// 筛选
const handleQuery = () => {
  pageNum.value = 1
  finished.value = false
  list.value = []
  fetchList()
}

// 跳转详情
const goToDetail = (id: number) => {
  router.push(`/mobile/research/detail/${id}`)
}

// 跳转填报
const goToFill = (id: number) => {
  router.push(`/mobile/research/detail/${id}`)
}

// 跳转新建
const goToCreate = () => {
  router.push('/mobile/research/create')
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待填报',
    completed: '已完成'
  }
  return statusMap[status] || status
}

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return '今天'
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return dateStr.split(' ')[0]
  }
}

// 初始化
onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.research-list {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.research-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
}

.status.pending {
  color: #ff976a;
  background-color: #fff3e0;
}

.status.completed {
  color: #07c160;
  background-color: #e8f5e9;
}

.date {
  font-size: 12px;
  color: #969799;
}
</style>
