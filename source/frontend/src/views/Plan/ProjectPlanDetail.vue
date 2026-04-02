<template>
  <div class="project-plan-detail">
    <el-page-header @back="goBack">
      <template #content>
        <span class="page-title">{{ projectName }} - 项目计划</span>
      </template>
      <template #extra>
        <el-button type="primary" :icon="Refresh" @click="handleRefresh" :loading="loading">
          刷新
        </el-button>
      </template>
    </el-page-header>

    <div v-if="plan" class="content-wrapper">
      <!-- 项目信息卡片 -->
      <PlanInfoCard
        :plan="plan"
        :statistics="statistics"
        :warnings="warnings"
        @warning-click="handleWarningClick"
      />

      <!-- 视图切换和主内容区 -->
      <el-card class="view-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>阶段计划</span>
            <el-radio-group v-model="viewMode" size="small">
              <el-radio-button value="timeline">时间线</el-radio-button>
              <el-radio-button value="gantt">甘特图</el-radio-button>
              <el-radio-button value="list">列表</el-radio-button>
            </el-radio-group>
          </div>
        </template>

        <!-- 时间线视图 -->
        <div v-if="viewMode === 'timeline'" class="view-content">
          <EnhancedTimelineView :comparisons="stageComparisons" />
        </div>

        <!-- 甘特图视图 -->
        <div v-if="viewMode === 'gantt'" class="view-content">
          <GanttLegend />
          <EnhancedGanttChart
            :tasks="ganttData"
            :height="ganttHeight"
            :show-comparison="true"
            :plan-start-date="plan?.startDate"
            :plan-end-date="plan?.endDate"
          />
        </div>

        <!-- 列表视图 -->
        <div v-if="viewMode === 'list'" class="view-content">
          <TaskListView
            :tasks="ganttData"
            @view="handleViewTask"
          />
        </div>
      </el-card>

    </div>

    <!-- 加载状态 -->
    <div v-else-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>

    <!-- 空状态 -->
    <el-empty v-else description="暂无计划数据" :image-size="100">
      <el-button type="primary" @click="goBack">返回列表</el-button>
    </el-empty>

    <!-- 任务详情对话框 -->
    <el-dialog
      v-model="taskDialogVisible"
      :title="currentTask?.name || '任务详情'"
      width="600px"
    >
      <div v-if="currentTask" class="task-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="任务名称" :span="2">
            {{ currentTask.name }}
          </el-descriptions-item>
          <el-descriptions-item label="所属阶段">
            <el-tag :type="getStageTagType(currentTask.stageKey)" size="small">
              {{ currentTask.stageName }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(currentTask.status)" size="small">
              {{ TaskStatusMap[currentTask.status]?.label || currentTask.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="计划开始">
            {{ currentTask.plannedStart }}
          </el-descriptions-item>
          <el-descriptions-item label="计划结束">
            {{ currentTask.plannedEnd }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentTask.actualStart" label="实际开始">
            {{ currentTask.actualStart }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentTask.actualEnd" label="实际结束">
            {{ currentTask.actualEnd }}
          </el-descriptions-item>
          <el-descriptions-item label="进度" :span="2">
            <el-progress :percentage="currentTask.progress" :stroke-width="10" />
          </el-descriptions-item>
          <el-descriptions-item v-if="currentTask.assigneeNames" label="负责人" :span="2">
            {{ currentTask.assigneeNames }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentTask.isDelayed && currentTask.delayDays" label="延期情况" :span="2">
            <el-tag type="danger" size="small">
              延期 {{ currentTask.delayDays > 0 ? '+' : '' }}{{ currentTask.delayDays }} 天
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="taskDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { usePlanStore } from '@/stores/plan'
import type { PlanViewMode, GanttTaskItem } from '@/types/plan'
import { TaskStatusMap } from '@/types/task'
import PlanInfoCard from '@/components/Plan/PlanInfoCard.vue'
import EnhancedTimelineView from '@/components/Plan/EnhancedTimelineView.vue'
import EnhancedGanttChart from '@/components/Plan/EnhancedGanttChart.vue'
import TaskListView from '@/components/Plan/TaskListView.vue'
import GanttLegend from '@/components/Plan/GanttLegend.vue'

const route = useRoute()
const router = useRouter()
const planStore = usePlanStore()

const projectId = Number(route.params.projectId)
const projectName = ref('')
const viewMode = ref<PlanViewMode>('timeline')
const taskDialogVisible = ref(false)
const currentTask = ref<GanttTaskItem | null>(null)
const ganttHeight = ref('400px')

// 从 store 获取数据
const plan = computed(() => planStore.currentPlan)
const loading = computed(() => planStore.loading)
const stageComparisons = computed(() => planStore.stageComparisons)
const ganttData = computed(() => planStore.ganttData)
const statistics = computed(() => planStore.statistics)
const warnings = computed(() => planStore.warnings)

// 监听任务数量变化，动态调整甘特图高度
watch(() => ganttData.value.length, (count) => {
  ganttHeight.value = `${Math.max(400, count * 50 + 100)}px`
}, { immediate: true })

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

// 返回
function goBack() {
  router.push('/plan')
}

// 刷新数据
async function handleRefresh() {
  await loadPlanData()
  ElMessage.success('刷新成功')
}

// 预警点击
function handleWarningClick(warning: any) {
  // TODO: 实现预警点击后的处理逻辑
  ElMessage.info(`查看预警：${warning.message}`)
}

// 查看任务
function handleViewTask(task: GanttTaskItem) {
  currentTask.value = task
  taskDialogVisible.value = true
}

// 加载计划数据
async function loadPlanData() {
  try {
    const data = await planStore.fetchProjectPlan(projectId)
    projectName.value = data.projectName
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  }
}

onMounted(() => {
  loadPlanData()
})
</script>

<style scoped>
.project-plan-detail {
  padding: 16px;
  min-height: calc(100vh - 32px);
}

.page-title {
  font-size: 16px;
  font-weight: 500;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-tip {
  margin-bottom: 16px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  color: #606266;
  font-size: 13px;
}

.view-content {
  min-height: 400px;
}

.view-card {
  margin-bottom: 16px;
}

.loading-container {
  margin-top: 24px;
  padding: 20px;
}

.task-detail {
  padding: 8px 0;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .project-plan-detail {
    padding: 8px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
