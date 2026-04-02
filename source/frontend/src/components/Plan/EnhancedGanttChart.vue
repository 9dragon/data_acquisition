<template>
  <div ref="chartRef" class="gantt-chart" :style="{ height: chartHeight }" />
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount, computed } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import type { GanttTaskItem } from '@/types/plan'
import { ImplementationStageMap } from '@/types/task'

interface Props {
  tasks: GanttTaskItem[]
  height?: string
  showComparison?: boolean // 是否显示计划vs实际对比
  planStartDate?: string // 项目计划开始日期
  planEndDate?: string   // 项目计划结束日期
}

const props = withDefaults(defineProps<Props>(), {
  height: '400px',
  showComparison: true,
  planStartDate: '',
  planEndDate: ''
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
  const { yAxisData, seriesData, dateRange } = buildChartData(stageGroups, props.planStartDate, props.planEndDate)

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (!params || !params.data) return ''
        const data = params.data
        const task = data.task || data

        // 状态映射
        const statusMap: Record<string, { label: string; color: string; lineType: string }> = {
          pending: { label: '未开始', color: '#909399', lineType: '虚线边框' },
          in_progress: { label: '进行中', color: '#409EFF', lineType: '实线边框' },
          completed: { label: '已完成', color: '#67C23A', lineType: '实线边框' },
          cancelled: { label: '已取消', color: '#F56C6C', lineType: '点线边框' }
        }
        const statusInfo = statusMap[task.status] || { label: task.status, color: '#999', lineType: '' }

        return `
          <div style="padding: 8px; min-width: 200px;">
            <div style="font-weight: 500; margin-bottom: 6px; font-size: 13px;">${task.name || '-'}</div>
            <div style="font-size: 12px; color: #666; line-height: 1.8;">
              <span style="display: inline-block; width: 8px; height: 8px; background: ${statusInfo.color}; border-radius: 50%; margin-right: 4px;"></span>
              <span style="font-weight: 500;">${statusInfo.label}</span>
              ${statusInfo.lineType ? `<span style="color: #999; font-size: 11px;">（${statusInfo.lineType}）</span>` : ''}<br/>
              阶段：${task.stageName || '-'}<br/>
              计划：${task.plannedStart || '-'} ~ ${task.plannedEnd || '-'}<br/>
              ${task.actualStart ? `实际：${task.actualStart} ~ ${task.actualEnd || '进行中'}<br/>` : ''}
              进度：${task.progress || 0}%
              ${task.isDelayed ? `<br/><span style="color: #F56C6C;">⚠ 延期任务（红色边框）</span>` : ''}
            </div>
          </div>
        `
      }
    },
    grid: {
      left: '180px',
      right: '40px',
      top: '20px',
      bottom: '60px',
      containLabel: false
    },
    legend: {
      show: false,
    },
    xAxis: {
      type: 'time',
      min: dateRange.min,
      max: dateRange.max,
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          color: '#e0e0e0'
        }
      },
      axisLabel: {
        formatter: '{MM}-{dd}',
        fontSize: 11
      },
      axisLine: {
        lineStyle: {
          color: '#999'
        }
      }
    },
    yAxis: {
      type: 'category',
      data: yAxisData,
      axisLine: {
        show: true,
        lineStyle: {
          color: '#ddd'
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        fontSize: 12,
        width: 200,
        overflow: 'truncate',
        ellipsis: '..'
      }
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true
      },
      {
        type: 'slider',
        start: 0,
        end: 100,
        height: 25,
        bottom: 40,
        textStyle: {
          fontSize: 11
        }
      }
    ],
    series: buildSeries(seriesData, yAxisData, props.showComparison)
  }

  chartInstance.setOption(option, true)
}

// 按阶段分组任务
function groupTasksByStage(tasks: GanttTaskItem[]) {
  const groups: Record<string, GanttTaskItem[]> = {}

  tasks.forEach(task => {
    if (!groups[task.stageKey]) {
      groups[task.stageKey] = []
    }
    groups[task.stageKey].push(task)
  })

  return groups
}

// 构建图表数据
function buildChartData(stageGroups: Record<string, GanttTaskItem[]>, planStartDate?: string, planEndDate?: string) {
  const yAxisData: string[] = []
  const seriesData: GanttTaskItem[] = []
  const taskDates: number[] = []

  Object.entries(stageGroups).forEach(([stageKey, tasks]) => {
    const stageName = ImplementationStageMap[stageKey as keyof typeof ImplementationStageMap]?.label || stageKey

    tasks.forEach(task => {
      yAxisData.push(`${stageName} / ${task.name}`)
      seriesData.push({ ...task, yAxisIndex: yAxisData.length - 1 })

      // 收集所有任务的日期（用于确定X轴范围）
      taskDates.push(parseLocalDate(task.plannedStart))
      taskDates.push(parseEndDate(task.plannedEnd))
      if (task.actualStart) taskDates.push(parseLocalDate(task.actualStart))
      if (task.actualEnd) taskDates.push(parseEndDate(task.actualEnd))
    })
  })

  // 计算日期范围
  let min: number, max: number
  const dayMs = 24 * 60 * 60 * 1000

  // 获取项目计划时间范围（带边距）
  let planMin: number | undefined, planMax: number | undefined
  if (planStartDate && planEndDate) {
    planMin = parseLocalDate(planStartDate) - 3 * dayMs
    planMax = parseEndDate(planEndDate) + 7 * dayMs
  }

  // 获取任务时间范围（带边距）
  let taskMin: number | undefined, taskMax: number | undefined
  if (taskDates.length > 0) {
    taskMin = Math.min(...taskDates) - 2 * dayMs
    taskMax = Math.max(...taskDates) + 2 * dayMs
  }

  // 使用并集：确保X轴范围同时包含项目计划时间和任务时间
  if (taskMin !== undefined && taskMax !== undefined) {
    if (planMin !== undefined && planMax !== undefined) {
      min = Math.min(planMin, taskMin)
      max = Math.max(planMax, taskMax)
    } else {
      min = taskMin
      max = taskMax
    }
  } else if (planMin !== undefined && planMax !== undefined) {
    min = planMin
    max = planMax
  } else {
    const now = new Date()
    min = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    max = new Date(now.getFullYear(), now.getMonth() + 3, 0).getTime()
  }

  return { yAxisData, seriesData, dateRange: { min, max } }
}

// 解析本地日期字符串（避免UTC时区偏移）
function parseLocalDate(dateStr: string): number {
  // 支持 "2026-05-07" 或 "2026-05-07 00:00:00" 格式
  const parts = dateStr.split(' ')[0].split('-')
  if (parts.length === 3) {
    const year = parseInt(parts[0])
    const month = parseInt(parts[1]) - 1 // 月份从0开始
    const day = parseInt(parts[2])
    return new Date(year, month, day).getTime()
  }
  return new Date(dateStr).getTime()
}

// 解析结束日期（包含当天的完整时间，即23:59:59）
function parseEndDate(dateStr: string): number {
  const startTime = parseLocalDate(dateStr)
  // 如果是日期格式，添加一天的毫秒数减1毫秒，使其包含当天完整时间
  // 例如：5月7日 → 5月7日 23:59:59.999
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return startTime + 24 * 60 * 60 * 1000 - 1
  }
  return startTime
}

// 构建系列数据
function buildSeries(tasks: GanttTaskItem[], yAxisData: string[], showComparison: boolean) {
  const getColor = (task: GanttTaskItem) => {
    const colorMap: Record<string, string> = {
      pending: '#909399',
      in_progress: '#409EFF',
      completed: '#67C23A',
      cancelled: '#F56C6C'
    }
    return colorMap[task.status] || '#409EFF'
  }

  // 获取状态图标
  const getStatusIcon = (status: string, isDelayed: boolean): string => {
    if (isDelayed) return '⚠'
    const iconMap: Record<string, string> = {
      pending: '⏳',
      in_progress: '▶',
      completed: '✓',
      cancelled: '✖'
    }
    return iconMap[status] || '?'
  }

  if (showComparison) {
    // 计划时间数据
    const planData = tasks.map((task, index) => {
      // 确保时间值有效
      if (!task.plannedStart || !task.plannedEnd) return null
      // 使用本地时间解析日期字符串（避免UTC时区偏移）
      let startTime = parseLocalDate(task.plannedStart)
      let endTime = parseEndDate(task.plannedEnd)
      // 验证时间戳有效
      if (isNaN(startTime) || isNaN(endTime)) return null
      // 如果开始和结束时间相同，添加至少1天的宽度
      if (startTime >= endTime) {
        endTime = startTime + 24 * 60 * 60 * 1000 - 1
      }
      return {
        value: [startTime, endTime, index],
        task
      }
    }).filter((item): item is NonNullable<typeof item> => item !== null)

    // 实际时间数据
    const actualData = tasks.map((task, index) => {
      const start = task.actualStart || task.plannedStart
      const end = task.actualEnd || task.plannedEnd
      // 确保时间值有效
      if (!start || !end) return null
      // 使用本地时间解析日期字符串（避免UTC时区偏移）
      let startTime = parseLocalDate(start)
      let endTime = parseEndDate(end)
      // 验证时间戳有效
      if (isNaN(startTime) || isNaN(endTime)) return null
      // 如果开始和结束时间相同，添加至少1天的宽度
      if (startTime >= endTime) {
        endTime = startTime + 24 * 60 * 60 * 1000 - 1
      }
      return {
        value: [startTime, endTime, index],
        task
      }
    }).filter((item): item is NonNullable<typeof item> => item !== null)

    return [
      {
        name: '计划时间',
        type: 'custom',
        renderItem: (params: any, api: any) => {
          const currentIndex = api.value(2)
          const start = api.coord([api.value(0), currentIndex])
          const end = api.coord([api.value(1), currentIndex])

          // 计算当前类别的顶部和底部位置
          const currentY = api.coord([0, currentIndex])[1]
          const nextY = currentIndex + 1 < yAxisData.length
            ? api.coord([0, currentIndex + 1])[1]
            : currentY + 40 // 默认高度
          const categoryHeight = Math.abs(nextY - currentY)
          const height = categoryHeight * 0.6

          return {
            type: 'rect',
            shape: {
              x: start[0],
              y: currentY - height / 2,
              width: end[0] - start[0],
              height: height
            },
            style: {
              fill: 'rgba(200, 200, 200, 0.35)',
              stroke: '#ccc',
              lineWidth: 1
            }
          }
        },
        data: planData,
        z: 1
      },
      {
        name: '实际时间',
        type: 'custom',
        renderItem: (params: any, api: any) => {
          const dataIndex = params.dataIndex
          const task = tasks[dataIndex]
          const color = getColor(task)
          const icon = getStatusIcon(task.status, task.isDelayed)

          const currentIndex = api.value(2)
          const start = api.coord([api.value(0), currentIndex])
          const end = api.coord([api.value(1), currentIndex])

          // 计算当前类别的顶部和底部位置
          const currentY = api.coord([0, currentIndex])[1]
          const nextY = currentIndex + 1 < yAxisData.length
            ? api.coord([0, currentIndex + 1])[1]
            : currentY + 40 // 默认高度
          const categoryHeight = Math.abs(nextY - currentY)
          const height = categoryHeight * 0.45

          return {
            type: 'group',
            children: [
              // 背景矩形
              {
                type: 'rect',
                shape: {
                  x: start[0],
                  y: currentY - height / 2,
                  width: end[0] - start[0],
                  height: height
                },
                style: {
                  fill: color,
                  opacity: 0.9
                }
              },
              // 左侧状态图标
              {
                type: 'text',
                style: {
                  text: icon,
                  x: start[0] + 6,
                  y: currentY,
                  fontSize: 14,
                  fill: '#fff',
                  textVerticalAlign: 'middle',
                  fontWeight: 'bold'
                }
              }
            ]
          }
        },
        data: actualData,
        z: 2
      }
    ]
  } else {
    // 单轨显示
    const data = tasks.map((task, index) => {
      const start = task.actualStart || task.plannedStart
      const end = task.actualEnd || task.plannedEnd
      // 确保时间值有效
      if (!start || !end) return null
      // 使用本地时间解析日期字符串（避免UTC时区偏移）
      let startTime = parseLocalDate(start)
      let endTime = parseEndDate(end)
      // 验证时间戳有效
      if (isNaN(startTime) || isNaN(endTime)) return null
      // 如果开始和结束时间相同，添加至少1天的宽度
      if (startTime >= endTime) {
        endTime = startTime + 24 * 60 * 60 * 1000 - 1
      }
      return {
        value: [startTime, endTime, index],
        task
      }
    }).filter((item): item is NonNullable<typeof item> => item !== null)

    return [
      {
        name: '执行时间',
        type: 'custom',
        renderItem: (params: any, api: any) => {
          const dataIndex = params.dataIndex
          const task = tasks[dataIndex]
          const color = getColor(task)
          const icon = getStatusIcon(task.status, task.isDelayed)

          const currentIndex = api.value(2)
          const start = api.coord([api.value(0), currentIndex])
          const end = api.coord([api.value(1), currentIndex])

          // 计算当前类别的顶部和底部位置
          const currentY = api.coord([0, currentIndex])[1]
          const nextY = currentIndex + 1 < yAxisData.length
            ? api.coord([0, currentIndex + 1])[1]
            : currentY + 40 // 默认高度
          const categoryHeight = Math.abs(nextY - currentY)
          const height = categoryHeight * 0.5

          return {
            type: 'group',
            children: [
              // 背景矩形
              {
                type: 'rect',
                shape: {
                  x: start[0],
                  y: currentY - height / 2,
                  width: end[0] - start[0],
                  height: height
                },
                style: {
                  fill: color,
                  opacity: 0.9
                }
              },
              // 左侧状态图标
              {
                type: 'text',
                style: {
                  text: icon,
                  x: start[0] + 6,
                  y: currentY,
                  fontSize: 14,
                  fill: '#fff',
                  textVerticalAlign: 'middle',
                  fontWeight: 'bold'
                }
              }
            ]
          }
        },
        data,
        z: 2
      }
    ]
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

// 监听对比模式变化
watch(() => props.showComparison, () => {
  renderChart()
})

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
  min-height: 300px;
}
</style>
