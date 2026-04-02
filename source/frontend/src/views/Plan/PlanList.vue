<template>
  <div class="plan-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>项目计划管理</span>
          <el-button type="primary" :icon="Plus" @click="handleCreate">
            创建计划
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchText"
          placeholder="搜索计划名称或项目名称"
          clearable
          style="width: 250px"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 数据表格 -->
      <el-table
        :data="filteredPlans"
        :loading="loading"
        border
        stripe
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column prop="name" label="计划名称" min-width="200" />
        <el-table-column prop="projectName" label="所属项目" min-width="200" />
        <el-table-column label="计划日期" width="200">
          <template #default="{ row }">
            {{ formatDateRange(row.startDate, row.endDate) }}
          </template>
        </el-table-column>
        <el-table-column label="包含阶段" width="280">
          <template #default="{ row }">
            <el-tag
              v-for="stage in row.stages"
              :key="stage.stageKey"
              :type="getStageType(stage.stageKey)"
              size="small"
              style="margin-right: 4px"
            >
              {{ stage.stageName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="taskCount" label="任务数" width="100" align="center">
          <template #default="{ row }">
            {{ row.totalTasks }}
          </template>
        </el-table-column>
        <el-table-column label="进度" width="150">
          <template #default="{ row }">
            <el-tooltip placement="top">
              <template #content>
                <div style="max-width: 250px">
                  <div style="font-weight: bold; margin-bottom: 8px;">进度计算说明</div>
                  <div>1. 阶段进度 = 该阶段所有任务进度的平均值</div>
                  <div>2. 整体进度 = 各阶段进度按权重加权平均</div>
                  <div style="margin-top: 8px; color: #909399;">权重配置见阶段配置中的阶段权重</div>
                </div>
              </template>
              <el-progress
                :percentage="row.overallProgress"
                :stroke-width="8"
                style="cursor: help"
              />
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :icon="View" @click="handleView(row)">
              查看
            </el-button>
            <el-button link type="primary" :icon="Edit" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-popconfirm
              title="确认删除"
              confirm-button-text="确定"
              cancel-button-text="取消"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button link type="danger" :icon="Delete">
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 计划表单弹窗 -->
    <PlanFormDialog
      v-model="formDialogVisible"
      :plan="currentPlan"
      :project-id="selectedProjectId"
      @submit="handleFormSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Plus, View, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { usePlanStore } from '@/stores/plan'
import { useProjectStore } from '@/stores/project'
import type { ProjectPlan } from '@/types/plan'
import PlanFormDialog from '@/components/Plan/PlanFormDialog.vue'
import { stageApi, type Stage } from '@/api/stage'

const router = useRouter()
const planStore = usePlanStore()
const projectStore = useProjectStore()

const loading = ref(false)
const searchText = ref('')
const plans = ref<ProjectPlan[]>([])
const formDialogVisible = ref(false)
const currentPlan = ref<ProjectPlan | null>(null)
const selectedProjectId = ref(0)

// 阶段数据
const allStages = ref<Stage[]>([])

// 加载阶段数据
async function loadStages() {
  try {
    const data = await stageApi.getAllStages()
    allStages.value = data
  } catch (error) {
    console.error('加载阶段失败:', error)
  }
}

// 过滤后的计划列表
const filteredPlans = computed(() => {
  if (!searchText.value) {
    return plans.value
  }
  const keyword = searchText.value.toLowerCase()
  return plans.value.filter(plan =>
    (plan.name?.toLowerCase().includes(keyword) ||
    plan.projectName?.toLowerCase().includes(keyword))
  )
})

// 搜索处理
function handleSearch() {
  // 搜索由 computed 自动处理
}

// 查看详情
function handleView(plan: ProjectPlan) {
  router.push(`/plan/${plan.projectId}`)
}

// 创建计划
function handleCreate() {
  currentPlan.value = null
  // 如果只有一个项目，自动选中
  if (projectStore.projectList.length === 1) {
    selectedProjectId.value = projectStore.projectList[0].id
  } else {
    selectedProjectId.value = 0
  }
  formDialogVisible.value = true
}

// 编辑计划
function handleEdit(plan: ProjectPlan) {
  currentPlan.value = plan
  selectedProjectId.value = plan.projectId
  formDialogVisible.value = true
}

// 删除计划
async function handleDelete(plan: ProjectPlan) {
  try {
    if (plan.id) {
      await planStore.deletePlan(plan.id)
      ElMessage.success('删除成功')
    } else {
      // 如果没有后端记录，直接从列表移除
      plans.value = plans.value.filter(p => p.projectId !== plan.projectId)
      ElMessage.success('删除成功')
    }
    await loadPlans()
  } catch (error: any) {
    ElMessage.error(error.message || '删除失败')
  }
}

// 提交表单
async function handleFormSubmit(data: any) {
  try {
    if (currentPlan.value?.id) {
      await planStore.updatePlan(currentPlan.value.id, data)
      ElMessage.success('更新成功')
    } else {
      await planStore.createPlan(data)
      ElMessage.success('创建成功')
    }
    formDialogVisible.value = false
    await loadPlans()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

// 格式化日期范围
function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate || !endDate) return '-'
  return `${startDate} ~ ${endDate}`
}

// 获取阶段标签类型
function getStageType(stageKey: string) {
  const stage = allStages.value.find(s => s.key === stageKey)
  // 根据 progressMode 返回类型
  return stage?.progressMode === 'by_task' ? 'primary' : 'success'
}

// 加载项目计划数据
async function loadPlans() {
  loading.value = true
  try {
    // 尝试从后端获取计划列表
    try {
      const planList = await planStore.fetchPlanList()
      plans.value = planList.map((plan: any) => {
        // 解析阶段配置
        let stages = []
        if (plan.stagesJson) {
          try {
            stages = JSON.parse(plan.stagesJson)
          } catch (e) {
            console.error('解析阶段配置失败:', e)
          }
        }
        // 如果没有阶段配置，使用默认阶段
        if (stages.length === 0) {
          stages = getImplementationStages().map(s => ({
            stageKey: s.stageKey,
            startDate: plan.startDate,
            endDate: plan.endDate
          }))
        }
        return {
          ...plan,
          stages: stages.map(s => ({
            stageKey: s.stageKey,
            stageName: getStageLabel(s.stageKey),
            color: getStageColor(s.stageKey)
          })),
          // 使用后端返回的摘要数据，与详情页计算逻辑一致
          totalTasks: plan.totalTasks ?? 0,
          overallProgress: plan.overallProgress ?? 0
        }
      })
    } catch (e) {
      // 如果后端接口失败，使用项目列表作为备选
      await projectStore.fetchProjectList()
      const projects = projectStore.projectList

      plans.value = projects.map(project => ({
        projectId: project.id,
        projectName: project.name,
        projectCode: project.code,
        name: `${project.name}实施计划`,
        startDate: project.startDate,
        endDate: project.endDate || project.plannedEndDate,
        stages: getImplementationStages().map(s => ({
          stageKey: s.stageKey,
          stageName: s.stageName,
          color: s.color
        })),
        tasks: [],
        totalTasks: 0,
        overallProgress: 0
      }))
    }
  } finally {
    loading.value = false
  }
}

// 获取实施阶段
function getImplementationStages() {
  return [
    { stageKey: 'preparation', stageName: '准备阶段', color: '#409EFF' },
    { stageKey: 'construction', stageName: '施工阶段', color: '#67C23A' },
    { stageKey: 'configuration', stageName: '配置阶段', color: '#E6A23C' },
    { stageKey: 'verification', stageName: '核对阶段', color: '#909399' }
  ]
}

// 获取阶段标签
function getStageLabel(stageKey: string): string {
  const stage = getImplementationStages().find(s => s.stageKey === stageKey)
  return stage?.stageName || stageKey
}

// 获取阶段颜色
function getStageColor(stageKey: string): string {
  const stage = allStages.value.find(s => s.key === stageKey)
  return stage?.color || '#409EFF'
}

onMounted(() => {
  loadPlans()
  loadStages()
})
</script>

<style scoped>
.plan-list {
  padding: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-tip {
  margin-bottom: 16px;
  padding: 12px;
  background: #ecf5ff;
  border: 1px solid #d9ecff;
  border-radius: 4px;
  color: #409EFF;
  font-size: 14px;
}

.search-bar {
  margin-top: 16px;
}
</style>
