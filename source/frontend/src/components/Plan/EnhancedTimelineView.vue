<template>
  <div class="timeline-view">
    <el-timeline>
      <el-timeline-item
        v-for="stage in comparisons"
        :key="stage.stageKey"
        :timestamp="formatDateRange(stage)"
        placement="top"
        :type="getTimelineType(stage.status)"
        :icon="getStageIcon(stage)"
        :color="stage.color"
      >
        <div class="stage-item">
          <!-- 阶段标题 -->
          <div class="stage-header">
            <div class="stage-title">
              <el-tag :type="getStageTagType(stage.stageKey)" size="large">
                {{ stage.stageName }}
              </el-tag>
              <el-tag v-if="stage.progressMode === 'by_device'" type="info" size="small" style="margin-left: 8px">
                按设备推进
              </el-tag>
            </div>
            <div class="stage-stats">
              <span class="stat">{{ stage.completedTasks }}/{{ stage.totalTasks }} 任务</span>
              <span class="stat" :class="{ 'text-danger': stage.isDelayed }">
                {{ stage.progress }}%
              </span>
            </div>
          </div>

          <!-- 时间对比 -->
          <div class="time-comparison">
            <div class="time-row">
              <span class="time-label">计划：</span>
              <span class="time-value">
                {{ stage.plannedStart || '未设置' }}
                <template v-if="stage.plannedEnd"> ~ {{ stage.plannedEnd }}</template>
              </span>
            </div>
            <div class="time-row">
              <span class="time-label">实际：</span>
              <span class="time-value">
                <template v-if="stage.actualStart || stage.actualEnd">
                  {{ stage.actualStart }}
                  <template v-if="stage.actualEnd"> ~ {{ stage.actualEnd }}</template>
                  <template v-else-if="stage.actualStart"> ~ </template>
                  <el-tag v-if="stage.isDelayed && stage.delayDays" type="danger" size="small" style="margin-left: 8px">
                    {{ stage.delayDays > 0 ? '+' : '' }}{{ stage.delayDays }}天
                  </el-tag>
                </template>
                <template v-else>
                  <span class="text-muted">—</span>
                </template>
              </span>
            </div>
          </div>

          <!-- 进度条 -->
          <div class="stage-progress">
            <el-progress
              :percentage="stage.progress"
              :stroke-width="10"
              :color="stage.color"
              :show-text="true"
            />
          </div>

          <!-- 任务列表 -->
          <div class="task-list">
            <div
              v-for="task in stage.tasks"
              :key="task.id"
              class="task-item"
              :class="{ 'task-delayed': task.isDelayed }"
            >
              <div class="task-header">
                <div class="task-title">
                  <el-icon class="task-status-icon" :color="getTaskStatusColor(task.status)">
                    <component :is="getTaskStatusIcon(task.status)" />
                  </el-icon>
                  <span class="task-name">{{ task.name }}</span>
                </div>
                <div class="task-meta">
                  <el-tag v-if="task.status" :type="getTaskTagType(task.status)" size="small">
                    {{ TaskStatusMap[task.status]?.label || task.status }}
                  </el-tag>
                  <span class="task-progress">{{ task.progress }}%</span>
                </div>
              </div>

              <!-- 任务时间对比 -->
              <div class="task-time">
                <span class="task-time-label">计划：{{ task.plannedStart }} ~ {{ task.plannedEnd }}</span>
                <span class="task-time-actual">
                  实际：
                  <template v-if="task.actualStart || task.actualEnd">
                    {{ task.actualStart }}
                    <template v-if="task.actualEnd"> ~ {{ task.actualEnd }}</template>
                    <template v-else-if="task.actualStart"> ~ </template>
                    <span v-if="task.isDelayed && task.delayDays" class="delay-badge">
                      ({{ task.delayDays > 0 ? '+' : '' }}{{ task.delayDays }}天)
                    </span>
                  </template>
                  <template v-else>—</template>
                </span>
              </div>

              <!-- 任务进度条 -->
              <el-progress
                v-if="task.status === 'in_progress' || task.status === 'completed'"
                :percentage="task.progress"
                :stroke-width="6"
                :show-text="false"
                :color="getTaskProgressColor(task.status)"
              />
            </div>
          </div>
        </div>
      </el-timeline-item>
    </el-timeline>

    <!-- 空状态 -->
    <el-empty v-if="comparisons.length === 0" description="暂无阶段数据" :image-size="60" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CircleCheck, CircleClose, Warning, Clock, Loading } from '@element-plus/icons-vue'
import type { StageComparison } from '@/types/plan'
import { TaskStatusMap } from '@/types/task'

interface Props {
  comparisons: StageComparison[]
}

const props = defineProps<Props>()

function formatDateRange(stage: StageComparison): string {
  // 优先显示实际时间
  if (stage.actualEnd) {
    return stage.actualEnd
  }
  if (stage.actualStart) {
    return `${stage.actualStart} 开始`
  }
  // 没有实际时间时，显示计划时间
  if (stage.plannedEnd) {
    return `计划 ${stage.plannedEnd}`
  }
  if (stage.plannedStart) {
    return `计划 ${stage.plannedStart}`
  }
  return '未开始'
}

function getTimelineType(status: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'completed':
      return 'success'
    case 'in_progress':
      return 'primary'
    case 'delayed':
      return 'danger'
    default:
      return 'info'
  }
}

function getStageTagType(stageKey: string): 'primary' | 'success' | 'warning' | 'info' {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
    preparation: 'primary',
    construction: 'success',
    configuration: 'warning',
    verification: 'info'
  }
  return typeMap[stageKey] || 'info'
}

function getStageIcon(stage: StageComparison) {
  if (stage.status === 'completed') return CircleCheck
  if (stage.status === 'delayed') return Warning
  if (stage.status === 'in_progress') return Loading
  return Clock
}

function getTaskStatusIcon(status: string) {
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

function getTaskStatusColor(status: string): string {
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

function getTaskTagType(status: string): 'success' | 'warning' | 'info' | 'danger' {
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

function getTaskProgressColor(status: string): string {
  switch (status) {
    case 'completed':
      return '#67C23A'
    case 'in_progress':
      return '#409EFF'
    default:
      return '#909399'
  }
}
</script>

<style scoped>
.timeline-view {
  padding: 8px 0;
}

.stage-item {
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.stage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stage-title {
  display: flex;
  align-items: center;
}

.stage-stats {
  display: flex;
  gap: 16px;
  align-items: center;
}

.stage-stats .stat {
  font-size: 13px;
  color: #909399;
}

.time-comparison {
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.time-row {
  display: flex;
  align-items: center;
  font-size: 13px;
}

.time-row:not(:last-child) {
  margin-bottom: 4px;
}

.time-label {
  min-width: 48px;
  color: #909399;
}

.time-value {
  color: #303133;
}

.stage-progress {
  margin-bottom: 16px;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
  border-left: 3px solid transparent;
  transition: all 0.3s;
}

.task-item:hover {
  background: #f5f7fa;
}

.task-item.task-delayed {
  border-left-color: #F56C6C;
  background: #fef0f0;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.task-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-status-icon {
  font-size: 16px;
}

.task-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-progress {
  font-size: 12px;
  color: #909399;
}

.task-time {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}

.task-time-label {
  color: #909399;
}

.task-time-actual {
  color: #409EFF;
}

.delay-badge {
  color: #F56C6C;
  font-weight: 500;
}

.text-danger {
  color: #F56C6C !important;
}

.text-muted {
  color: #C0C4CC;
}
</style>
