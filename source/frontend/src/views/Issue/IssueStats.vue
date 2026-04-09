<template>
  <div class="issue-stats">
    <el-row :gutter="20">
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">问题总数</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-value" style="color: #f56c6c">{{ stats.open }}</div>
          <div class="stat-label">待处理</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-value" style="color: #e6a23c">{{ stats.assigned }}</div>
          <div class="stat-label">已分配</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-value" style="color: #409eff">{{ stats.inProgress }}</div>
          <div class="stat-label">进行中</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-value" style="color: #67c23a">{{ stats.resolved }}</div>
          <div class="stat-label">已解决</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-value" style="color: #909399">{{ stats.closed }}</div>
          <div class="stat-label">已关闭</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>按问题类型统计</span>
          </template>
          <div ref="typeChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>按优先级统计</span>
          </template>
          <div ref="priorityChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>按状态统计</span>
          </template>
          <div ref="statusChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { issueApi } from '@/api/issue'
import * as echarts from 'echarts'

const stats = reactive({
  total: 0,
  open: 0,
  assigned: 0,
  inProgress: 0,
  resolved: 0,
  closed: 0,
  byPriority: {} as Record<string, number>,
  byType: {} as Record<string, number>
})

const typeChartRef = ref<HTMLElement>()
const priorityChartRef = ref<HTMLElement>()
const statusChartRef = ref<HTMLElement>()

let typeChart: echarts.ECharts | null = null
let priorityChart: echarts.ECharts | null = null
let statusChart: echarts.ECharts | null = null

onMounted(async () => {
  await loadStats()
  initCharts()
})

async function loadStats() {
  try {
    const data = await issueApi.getStats()
    stats.total = data?.total || 0
    stats.open = data?.open || 0
    stats.assigned = data?.assigned || 0
    stats.inProgress = data?.inProgress || 0
    stats.resolved = data?.resolved || 0
    stats.closed = data?.closed || 0
    stats.byPriority = data?.byPriority || {}
    stats.byType = data?.byType || {}
  } catch (e) {
    console.error('加载统计失败', e)
  }
}

function initCharts() {
  const typeData = Object.entries(stats.byType || {}).map(([key, value]) => {
    const labelMap: Record<string, string> = {
      device: '设备问题',
      plan: '计划问题',
      technical: '技术问题',
      resource: '资源问题',
      other: '其他问题'
    }
    return { value, name: labelMap[key] || key }
  })

  if (typeChartRef.value) {
    typeChart = echarts.init(typeChartRef.value)
    typeChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: '0%' },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        data: typeData.length > 0 ? typeData : [
          { value: 0, name: '无数据' }
        ]
      }]
    })
  }

  if (priorityChartRef.value) {
    priorityChart = echarts.init(priorityChartRef.value)
    priorityChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['低', '中', '高', '紧急'] },
      yAxis: { type: 'value' },
      series: [{
        type: 'bar',
        data: [
          stats.byPriority?.low || 0,
          stats.byPriority?.medium || 0,
          stats.byPriority?.high || 0,
          stats.byPriority?.urgent || 0
        ],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        }
      }]
    })
  }

  if (statusChartRef.value) {
    statusChart = echarts.init(statusChartRef.value)
    statusChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: '0%' },
      series: [{
        type: 'pie',
        radius: '70%',
        data: [
          { value: stats.open, name: '待处理', itemStyle: { color: '#f56c6c' } },
          { value: stats.assigned, name: '已分配', itemStyle: { color: '#e6a23c' } },
          { value: stats.inProgress, name: '进行中', itemStyle: { color: '#409eff' } },
          { value: stats.resolved, name: '已解决', itemStyle: { color: '#67c23a' } },
          { value: stats.closed, name: '已关闭', itemStyle: { color: '#909399' } }
        ]
      }]
    })
  }
}
</script>

<style scoped>
.issue-stats {
  padding: 16px;
}

.stat-card {
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 8px;
}
</style>
