<template>
  <div class="task-list-view">
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-select
        v-model="filters.stageKey"
        placeholder="筛选阶段"
        clearable
        size="small"
        style="width: 150px"
        @change="handleFilterChange"
      >
        <el-option
          v-for="stage in uniqueStages"
          :key="stage.stageKey"
          :label="stage.stageName"
          :value="stage.stageKey"
        />
      </el-select>

      <el-select
        v-model="filters.status"
        placeholder="筛选状态"
        clearable
        size="small"
        style="width: 130px"
        @change="handleFilterChange"
      >
        <el-option label="未开始" value="pending" />
        <el-option label="进行中" value="in_progress" />
        <el-option label="已完成" value="completed" />
        <el-option label="已取消" value="cancelled" />
      </el-select>

      <el-select
        v-model="filters.delayed"
        placeholder="筛选延期"
        clearable
        size="small"
        style="width: 120px"
        @change="handleFilterChange"
      >
        <el-option label="已延期" :value="true" />
        <el-option label="正常" :value="false" />
      </el-select>

      <el-input
        v-model="filters.keyword"
        placeholder="搜索任务名称"
        clearable
        size="small"
        style="width: 200px"
        @input="handleFilterChange"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-button size="small" @click="handleResetFilter">重置</el-button>
    </div>

    <!-- 任务表格 -->
    <el-table
      :data="filteredTasks"
      stripe
      border
      size="small"
      :row-class-name="getRowClassName"
      style="width: 100%"
    >
      <el-table-column prop="name" label="任务名称" min-width="180">
        <template #default="{ row }">
          <div class="task-name-cell">
            <el-icon :color="getStatusColor(row.status)" style="margin-right: 6px">
              <component :is="getStatusIcon(row.status)" />
            </el-icon>
            <span>{{ row.name }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="stageName" label="所属阶段" width="120">
        <template #default="{ row }">
          <el-tag :type="getStageTagType(row.stageKey)" size="small">
            {{ row.stageName }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="计划时间" width="180">
        <template #default="{ row }">
          <div class="time-cell">
            <div>{{ row.plannedStart }}</div>
            <div class="text-muted">{{ row.plannedEnd }}</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="实际时间" width="180">
        <template #default="{ row }">
          <div v-if="row.actualStart" class="time-cell">
            <div>{{ row.actualStart }}</div>
            <div class="text-muted">{{ row.actualEnd || '进行中' }}</div>
          </div>
          <span v-else class="text-muted">未开始</span>
        </template>
      </el-table-column>

      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)" size="small">
            {{ TaskStatusMap[row.status]?.label || row.status }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="进度" width="120">
        <template #default="{ row }">
          <el-progress
            :percentage="row.progress"
            :stroke-width="8"
            :show-text="true"
            :color="getProgressColor(row.progress)"
          />
        </template>
      </el-table-column>

      <el-table-column label="延期情况" width="100">
        <template #default="{ row }">
          <span v-if="row.isDelayed && row.delayDays" class="delay-badge">
            {{ row.delayDays > 0 ? '+' : '' }}{{ row.delayDays }}天
          </span>
          <span v-else-if="row.actualEnd" class="text-success">正常</span>
          <span v-else class="text-muted">-</span>
        </template>
      </el-table-column>

      <el-table-column prop="assigneeNames" label="负责人" width="120" show-overflow-tooltip />

      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">
            查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 统计信息 -->
    <div class="table-footer">
      <div class="stats">
        <span>共 {{ filteredTasks.length }} 个任务</span>
        <el-divider direction="vertical" />
        <span class="text-success">已完成 {{ completedCount }}</span>
        <el-divider direction="vertical" />
        <span class="text-warning">进行中 {{ inProgressCount }}</span>
        <el-divider direction="vertical" />
        <span class="text-danger">已延期 {{ delayedCount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, CircleCheck, CircleClose, Loading, Clock } from '@element-plus/icons-vue'
import type { GanttTaskItem } from '@/types/plan'
import { TaskStatusMap } from '@/types/task'

interface Props {
  tasks: GanttTaskItem[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  view: [task: GanttTaskItem]
}>()

// 筛选条件
const filters = ref<{
  stageKey?: string
  status?: string
  delayed?: boolean
  keyword?: string
}>({})

// 获取唯一阶段列表
const uniqueStages = computed(() => {
  const stageMap = new Map<string, { stageKey: string; stageName: string }>()
  props.tasks.forEach(task => {
    if (!stageMap.has(task.stageKey)) {
      stageMap.set(task.stageKey, {
        stageKey: task.stageKey,
        stageName: task.stageName
      })
    }
  })
  return Array.from(stageMap.values())
})

// 筛选后的任务列表
const filteredTasks = computed(() => {
  let result = [...props.tasks]

  // 阶段筛选
  if (filters.value.stageKey) {
    result = result.filter(t => t.stageKey === filters.value.stageKey)
  }

  // 状态筛选
  if (filters.value.status) {
    result = result.filter(t => t.status === filters.value.status)
  }

  // 延期筛选
  if (filters.value.delayed !== undefined) {
    result = result.filter(t => t.isDelayed === filters.value.delayed)
  }

  // 关键词搜索
  if (filters.value.keyword) {
    const keyword = filters.value.keyword.toLowerCase()
    result = result.filter(t =>
      t.name.toLowerCase().includes(keyword) ||
      t.stageName.toLowerCase().includes(keyword)
    )
  }

  return result
})

// 统计数据
const completedCount = computed(() =>
  filteredTasks.value.filter(t => t.status === 'completed').length
)

const inProgressCount = computed(() =>
  filteredTasks.value.filter(t => t.status === 'in_progress').length
)

const delayedCount = computed(() =>
  filteredTasks.value.filter(t => t.isDelayed).length
)

// 获取行样式类名
function getRowClassName({ row }: { row: GanttTaskItem }) {
  return row.isDelayed ? 'delayed-row' : ''
}

// 获取状态图标
function getStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return CircleCheck
    case 'in_progress':
      return Loading
    case 'cancelled':
      return CircleClose
    default:
      return Clock
  }
}

// 获取状态颜色
function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return '#67C23A'
    case 'in_progress':
      return '#409EFF'
    case 'cancelled':
      return '#F56C6C'
    default:
      return '#909399'
  }
}

// 获取状态标签类型
function getStatusTagType(status: string): 'success' | 'warning' | 'info' | 'danger' {
  switch (status) {
    case 'completed':
      return 'success'
    case 'in_progress':
      return 'warning'
    case 'cancelled':
      return 'danger'
    default:
      return 'info'
  }
}

// 获取阶段标签类型
function getStageTagType(stageKey: string): 'primary' | 'success' | 'warning' | 'info' {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
    preparation: 'primary',
    construction: 'success',
    configuration: 'warning',
    verification: 'info'
  }
  return typeMap[stageKey] || 'info'
}

// 获取进度颜色
function getProgressColor(progress: number): string {
  if (progress >= 100) return '#67C23A'
  if (progress >= 50) return '#409EFF'
  return '#E6A23C'
}

// 筛选变化
function handleFilterChange() {
  // 筛选条件变化会自动触发 computed 重新计算
}

// 重置筛选
function handleResetFilter() {
  filters.value = {}
}

// 查看任务
function handleView(task: GanttTaskItem) {
  emit('view', task)
}
</script>

<style scoped>
.task-list-view {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.task-name-cell {
  display: flex;
  align-items: center;
}

.time-cell {
  font-size: 12px;
  line-height: 1.5;
}

.text-muted {
  color: #909399;
}

.text-success {
  color: #67C23A;
}

.text-warning {
  color: #E6A23C;
}

.text-danger {
  color: #F56C6C;
}

.delay-badge {
  color: #F56C6C;
  font-weight: 500;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 13px;
}

.stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 延期行样式 */
:deep(.delayed-row) {
  background-color: #fef0f0 !important;
}

:deep(.delayed-row:hover) {
  background-color: #fde2e2 !important;
}
</style>
