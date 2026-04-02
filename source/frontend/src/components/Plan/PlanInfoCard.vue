<template>
  <el-card class="plan-info-card" shadow="never">
    <template #header>
      <div class="card-header">
        <span class="card-title">计划概览</span>
        <el-tag v-if="statistics" :type="getStatusTagType(statistics.overallProgress)">
          总进度 {{ statistics.overallProgress }}%
        </el-tag>
      </div>
    </template>

    <div v-if="plan" class="info-content">
      <!-- 基本信息 -->
      <div class="basic-info">
        <div class="info-row">
          <span class="label">计划名称：</span>
          <span class="value">{{ plan.name }}</span>
        </div>
        <div v-if="plan.description" class="info-row">
          <span class="label">计划描述：</span>
          <span class="value">{{ plan.description }}</span>
        </div>
        <div class="info-row">
          <span class="label">计划周期：</span>
          <span class="value">
            {{ statistics?.startDate }} ~ {{ statistics?.endDate }}
            <el-tag v-if="statistics?.remainingDays !== undefined" size="small" style="margin-left: 8px">
              剩余 {{ statistics.remainingDays }} 天
            </el-tag>
          </span>
        </div>
      </div>

      <!-- 进度统计 -->
      <div v-if="statistics" class="progress-section">
        <div class="progress-header">
          <span class="section-title">整体进度</span>
          <span class="progress-value">{{ statistics.overallProgress }}%</span>
        </div>
        <el-progress
          :percentage="statistics.overallProgress"
          :stroke-width="12"
          :color="getProgressColor(statistics.overallProgress)"
        />
        <div class="progress-stats">
          <div class="stat-item">
            <span class="stat-label">任务</span>
            <span class="stat-value">{{ statistics.completedTasks }}/{{ statistics.totalTasks }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">阶段</span>
            <span class="stat-value">{{ statistics.completedStages }}/{{ statistics.totalStages }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">状态</span>
            <span class="stat-value" :class="{ 'text-danger': statistics.isOverdue }">
              {{ getStatusText(statistics) }}
            </span>
          </div>
        </div>
      </div>

      <!-- 预警提示 -->
      <div v-if="warnings.length > 0" class="warning-section">
        <div class="section-title">预警提示</div>
        <el-alert
          v-for="warning in warnings.slice(0, 3)"
          :key="warning.id"
          :type="warning.level === 'error' ? 'error' : 'warning'"
          :closable="false"
          class="warning-item"
        >
          <template #default>
            <div class="warning-content">
              <span>{{ warning.message }}</span>
              <el-button
                v-if="warning.taskId"
                type="primary"
                link
                size="small"
                @click="handleWarningClick(warning)"
              >
                查看
              </el-button>
            </div>
          </template>
        </el-alert>
        <div v-if="warnings.length > 3" class="more-warnings">
          还有 {{ warnings.length - 3 }} 条预警...
        </div>
      </div>
    </div>

    <el-empty v-else description="暂无计划数据" :image-size="60" />
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProjectPlan, PlanStatistics, WarningInfo } from '@/types/plan'

interface Props {
  plan: ProjectPlan | null
  statistics?: PlanStatistics | null
  warnings?: WarningInfo[]
}

const props = withDefaults(defineProps<Props>(), {
  statistics: null,
  warnings: () => []
})

const emit = defineEmits<{
  warningClick: [warning: WarningInfo]
}>()

function getStatusTagType(progress: number): 'success' | 'warning' | 'info' | 'danger' {
  if (progress >= 100) return 'success'
  if (progress >= 50) return 'warning'
  if (progress > 0) return 'info'
  return 'info'
}

function getProgressColor(progress: number): string {
  if (progress >= 100) return '#67C23A'
  if (progress >= 75) return '#409EFF'
  if (progress >= 50) return '#E6A23C'
  return '#909399'
}

function getStatusText(statistics: PlanStatistics): string {
  if (statistics.isOverdue) return '已延期'
  if (statistics.overallProgress >= 100) return '已完成'
  if (statistics.inProgressStages > 0) return '进行中'
  return '未开始'
}

function handleWarningClick(warning: WarningInfo) {
  emit('warningClick', warning)
}
</script>

<style scoped>
.plan-info-card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.basic-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  align-items: flex-start;
}

.info-row .label {
  min-width: 80px;
  color: #909399;
  font-size: 14px;
}

.info-row .value {
  flex: 1;
  color: #303133;
  font-size: 14px;
}

.progress-section {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.progress-value {
  font-size: 18px;
  font-weight: 600;
  color: #409EFF;
}

.progress-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #dcdfe6;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.stat-value {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.text-danger {
  color: #F56C6C !important;
}

.text-muted {
  color: #909399;
}

.warning-section {
  padding: 16px;
  background: #fef0f0;
  border-radius: 4px;
}

.warning-item {
  margin-bottom: 8px;
}

.warning-item:last-child {
  margin-bottom: 0;
}

.warning-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.more-warnings {
  padding-top: 8px;
  text-align: center;
  font-size: 12px;
  color: #909399;
}
</style>
