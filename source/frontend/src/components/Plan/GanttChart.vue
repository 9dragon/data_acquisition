<template>
  <div ref="chartRef" class="gantt-chart" :style="{ height: chartHeight }" />
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount, computed } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import type { ProjectPlanTask } from '@/types/task'
import { ImplementationStageMap } from '@/types/task'

interface Props {
  tasks: ProjectPlanTask[]
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: '400px'
})

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

const chartHeight = computed(() => props.height)

// 初始化图表
function initChart() {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)
  renderChart()

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
}

// 渲染图表
function renderChart() {
  if (!chartInstance || !props.tasks.length) return

  // 按阶段分组任务
  const stageGroups = groupTasksByStage(props.tasks)

  // 构建数据
  const { yAxisData, seriesData } = buildChartData(stageGroups)

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        const data = params[0]
        const task = data.data
        return `
          <div style="padding: 8px;">
            <div style="font-weight: 500; margin-bottom: 4px;">${task.name}</div>
            <div style="font-size: 12px; color: #666;">
              阶段：${task.stageName}<br/>
              时间：${task.startDate} ~ ${task.endDate}<br/>
              进度：${task.progress}%
            </div>
          </div>
        `
      }
    },
    grid: {
      left: '120px',
      right: '30px',
      top: '40px',
      bottom: '40px',
      containLabel: true
    },
    xAxis: {
      type: 'time',
      min: getDateRange(props.tasks).min,
      max: getDateRange(props.tasks).max,
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed'
        }
      },
      axisLabel: {
        formatter: '{yyyy}-{MM}-{dd}'
      }
    },
    yAxis: {
      type: 'category',
      data: yAxisData,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      }
    },
    series: [
      {
        type: 'custom',
        renderItem: (params: any, api: any) => {
          const taskIndex = params.dataIndex
          const task = params.data.task

          // 获取任务的开始时间和结束时间
          const startDate = new Date(task.startDate).getTime()
          const endDate = new Date(task.endDate).getTime()

          // 计算位置
          const startX = api.coord([startDate, taskIndex])[0]
          const endX = api.coord([endDate, taskIndex])[0]
          const y = api.coord([0, taskIndex])[1]

          const height = api.size([0, 1])[1] * 0.6

          // 根据状态设置颜色
          const colorMap: Record<string, string> = {
            pending: '#909399',
            in_progress: '#409EFF',
            completed: '#67C23A',
            cancelled: '#F56C6C'
          }
          const color = colorMap[task.status] || '#409EFF'

          return {
            type: 'rect',
            shape: {
              x: startX,
              y: y - height / 2,
              width: endX - startX,
              height: height
            },
            style: {
              fill: color,
              opacity: 0.8
            },
            styleEmphasis: {
              fill: color,
              opacity: 1
            }
          }
        },
        data: seriesData,
        encode: {
          x: [0, 1],
          y: 2
        },
        z: 100
      }
    ]
  }

  chartInstance.setOption(option)
}

// 按阶段分组任务
function groupTasksByStage(tasks: ProjectPlanTask[]) {
  const groups: Record<string, ProjectPlanTask[]> = {}

  tasks.forEach(task => {
    if (!groups[task.stageKey]) {
      groups[task.stageKey] = []
    }
    groups[task.stageKey].push(task)
  })

  return groups
}

// 构建图表数据
function buildChartData(stageGroups: Record<string, ProjectPlanTask[]>) {
  const yAxisData: string[] = []
  const seriesData: any[] = []

  Object.entries(stageGroups).forEach(([stageKey, tasks]) => {
    const stageName = ImplementationStageMap[stageKey as keyof typeof ImplementationStageMap]?.label || stageKey

    tasks.forEach(task => {
      yAxisData.push(`${stageName} / ${task.name}`)
      seriesData.push({
        task,
        stageName,
        value: [task.startDate, task.endDate, yAxisData.length - 1]
      })
    })
  })

  return { yAxisData, seriesData }
}

// 获取日期范围
function getDateRange(tasks: ProjectPlanTask[]) {
  if (!tasks.length) {
    const now = new Date()
    return {
      min: new Date(now.getFullYear(), now.getMonth(), 1).getTime(),
      max: new Date(now.getFullYear(), now.getMonth() + 3, 0).getTime()
    }
  }

  const dates = tasks.flatMap(t => [
    new Date(t.startDate).getTime(),
    new Date(t.endDate).getTime()
  ])

  const min = Math.min(...dates)
  const max = Math.max(...dates)

  // 添加一些边距
  const dayMs = 24 * 60 * 60 * 1000
  return {
    min: min - 2 * dayMs,
    max: max + 2 * dayMs
  }
}

// 处理窗口大小变化
function handleResize() {
  chartInstance?.resize()
}

// 监听任务变化
watch(() => props.tasks, () => {
  renderChart()
}, { deep: true })

onMounted(() => {
  initChart()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})
</script>

<style scoped>
.gantt-chart {
  width: 100%;
}
</style>
