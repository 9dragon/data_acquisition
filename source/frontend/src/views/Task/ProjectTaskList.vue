<template>
  <div class="project-task-list">
    <!-- 筛选栏 -->
    <el-form :inline="true" :model="queryParams" class="filter-form">
      <el-form-item label="关键字">
        <el-input
          v-model="queryParams.keyword"
          placeholder="请输入任务名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="项目">
        <el-select
          v-model="queryParams.projectId"
          placeholder="请选择项目"
          clearable
          style="width: 200px"
        >
          <el-option
            v-for="project in projectList"
            :key="project.id"
            :label="project.name"
            :value="project.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 统计概览 -->
    <div class="statistics-cards">
      <el-row :gutter="16">
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-item">
              <div class="stat-value">{{ statistics.totalTasks }}</div>
              <div class="stat-label">任务总数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-item">
              <div class="stat-value completed">{{ statistics.completedTasks }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-item">
              <div class="stat-value in-progress">{{ statistics.inProgressTasks }}</div>
              <div class="stat-label">进行中</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-item">
              <div class="stat-value pending">{{ statistics.pendingTasks }}</div>
              <div class="stat-label">未开始</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 任务列表表格 -->
    <el-table
      v-loading="taskStore.loading"
      :data="taskStore.projectTasks"
      border
      stripe
      style="width: 100%; margin-top: 16px"
    >
      <el-table-column prop="projectName" label="项目名称" width="180" />
      <el-table-column prop="stageName" label="阶段" width="100">
        <template #default="{ row }">
          <el-tag :type="getStageType(row.stageKey)">
            {{ row.stageName || getStageLabel(row.stageKey) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="任务名称" min-width="150" show-overflow-tooltip />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ TaskStatusMap[row.status]?.label || row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="进度" width="120">
        <template #default="{ row }">
          <el-progress
            :percentage="row.progress || 0"
            :color="getProgressColor(row.progress)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="startDate" label="开始日期" width="110" />
      <el-table-column prop="endDate" label="结束日期" width="110" />
      <el-table-column prop="managerName" label="负责人" width="100" />
      <el-table-column prop="participantNames" label="参与人" width="150" />
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" :icon="View" @click="handleView(row)">
            查看
          </el-button>
          <el-button link type="primary" :icon="Edit" @click="handleReport(row)">
            填报
          </el-button>
          <el-popconfirm
            title="确认删除该任务吗？"
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

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="queryParams.pageNum"
      v-model:page-size="queryParams.pageSize"
      :total="taskStore.projectTaskTotal"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-top: 16px; justify-content: flex-end"
      @size-change="handleQuery"
      @current-change="handleQuery"
    />

    <!-- 填报模态框 -->
    <TaskReportModal
      v-model="reportVisible"
      :task-data="currentTask"
      @refresh="handleQuery"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { View, Edit, Delete } from '@element-plus/icons-vue'
import { useTaskStore } from '@/stores/task'
import { useProjectStore } from '@/stores/project'
import { TaskStatusMap, ImplementationStageMap, type ProjectTaskListItem } from '@/types/task'
import { taskApi } from '@/api/task'
import TaskReportModal from '@/components/Task/TaskReportModal.vue'

const taskStore = useTaskStore()
const projectStore = useProjectStore()

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  projectId: undefined as number | undefined,
  status: undefined as string | undefined
})

const reportVisible = ref(false)
const currentTask = ref<ProjectTaskListItem | null>(null)

const statusOptions = [
  { label: '未开始', value: 'pending' },
  { label: '进行中', value: 'in_progress' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
]

const projectList = computed(() => projectStore.projects)

const statistics = computed(() => {
  const tasks = taskStore.projectTasks
  return {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
    pendingTasks: tasks.filter(t => t.status === 'pending').length
  }
})

const getStageLabel = (stageKey: string) => {
  return ImplementationStageMap[stageKey]?.label || stageKey
}

const getStageType = (stageKey: string) => {
  const typeMap: Record<string, string> = {
    preparation: 'primary',
    construction: 'success',
    configuration: 'warning',
    verification: 'info'
  }
  return typeMap[stageKey] || 'info'
}

const getStatusType = (status: string) => {
  return TaskStatusMap[status]?.type || 'info'
}

const getProgressColor = (progress: number) => {
  if (progress >= 100) return '#67C23A'
  if (progress >= 50) return '#409EFF'
  return '#E6A23C'
}

const handleQuery = async () => {
  await taskStore.fetchAllProjectTasks(queryParams)
}

const handleReset = () => {
  queryParams.keyword = ''
  queryParams.projectId = undefined
  queryParams.status = undefined
  queryParams.pageNum = 1
  handleQuery()
}

const handleView = (row: ProjectTaskListItem) => {
  console.log('查看任务:', row)
}

const handleReport = (row: ProjectTaskListItem) => {
  currentTask.value = row
  reportVisible.value = true
}

const handleDelete = async (row: ProjectTaskListItem) => {
  try {
    await taskApi.deleteTask(row.id)
    ElMessage.success('删除成功')
    handleQuery()
  } catch (error: any) {
    ElMessage.error(error.message || '删除失败')
  }
}

const handleTabChange = () => {
  handleQuery()
}

onMounted(() => {
  projectStore.fetchProjects()
  handleQuery()
})
</script>

<style scoped lang="scss">
.project-task-list {
  .filter-form {
    margin-bottom: 16px;
  }

  .statistics-cards {
    margin-bottom: 16px;

    .stat-item {
      text-align: center;

      .stat-value {
        font-size: 28px;
        font-weight: bold;
        color: #303133;
        margin-bottom: 8px;

        &.completed {
          color: #67c23a;
        }

        &.in-progress {
          color: #409eff;
        }

        &.pending {
          color: #909399;
        }
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
      }
    }
  }
}
</style>
