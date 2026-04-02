<template>
  <div class="device-task-list">
    <!-- 筛选栏 -->
    <el-form :inline="true" :model="queryParams" class="filter-form">
      <el-form-item label="关键字">
        <el-input
          v-model="queryParams.keyword"
          placeholder="请输入设备名称或任务名称"
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
      <el-form-item label="阶段">
        <el-select
          v-model="queryParams.stageKey"
          placeholder="请选择阶段"
          clearable
          style="width: 150px"
        >
          <el-option
            v-for="item in stageOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select
          v-model="queryParams.completed"
          placeholder="请选择状态"
          clearable
          style="width: 120px"
        >
          <el-option label="已完成" :value="true" />
          <el-option label="未完成" :value="false" />
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
              <div class="stat-value pending">{{ statistics.pendingTasks }}</div>
              <div class="stat-label">未完成</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-item">
              <div class="stat-value">{{ statistics.totalDevices }}</div>
              <div class="stat-label">涉及设备</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 任务列表表格 -->
    <el-table
      v-loading="taskStore.deviceTaskLoading"
      :data="taskStore.deviceTasks"
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
      <el-table-column prop="deviceName" label="设备名称" width="150" />
      <el-table-column prop="taskName" label="任务名称" width="150" show-overflow-tooltip />
      <el-table-column prop="managerName" label="负责人" width="100" />
      <el-table-column prop="participantNames" label="参与人" width="150" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.completed ? 'success' : 'info'">
            {{ row.completed ? '已完成' : '未完成' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="completedDate" label="完成日期" width="110">
        <template #default="{ row }">
          {{ row.completedDate ? formatDate(row.completedDate) : '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
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
      :total="taskStore.deviceTaskTotal"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-top: 16px; justify-content: flex-end"
      @size-change="handleQuery"
      @current-change="handleQuery"
    />

    <!-- 填报模态框 -->
    <DeviceTaskReportModal
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
import { ImplementationStageMap, type DeviceTask } from '@/types/task'
import DeviceTaskReportModal from '@/components/Task/DeviceTaskReportModal.vue'

const taskStore = useTaskStore()
const projectStore = useProjectStore()

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  projectId: undefined as number | undefined,
  stageKey: undefined as string | undefined,
  completed: undefined as boolean | undefined
})

const reportVisible = ref(false)
const currentTask = ref<DeviceTask | null>(null)

const stageOptions = [
  { label: '准备阶段', value: 'preparation' },
  { label: '施工阶段', value: 'construction' },
  { label: '配置阶段', value: 'configuration' },
  { label: '核对阶段', value: 'verification' }
]

const projectList = computed(() => projectStore.projects)

const statistics = computed(() => {
  const tasks = taskStore.deviceTasks
  const uniqueDevices = new Set(tasks.map(t => t.deviceId))
  return {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.completed).length,
    pendingTasks: tasks.filter(t => !t.completed).length,
    totalDevices: uniqueDevices.size
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

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return dateStr.split(' ')[0]
}

const handleQuery = async () => {
  await taskStore.fetchDeviceTasks(queryParams)
}

const handleReset = () => {
  queryParams.keyword = ''
  queryParams.projectId = undefined
  queryParams.stageKey = undefined
  queryParams.completed = undefined
  queryParams.pageNum = 1
  handleQuery()
}

const handleView = (row: DeviceTask) => {
  console.log('查看任务:', row)
}

const handleReport = (row: DeviceTask) => {
  currentTask.value = row
  reportVisible.value = true
}

const handleDelete = async (row: DeviceTask) => {
  try {
    await taskStore.deleteDeviceTask(row.id)
    ElMessage.success('删除成功')
    handleQuery()
  } catch (error: any) {
    ElMessage.error(error.message || '删除失败')
  }
}

onMounted(() => {
  projectStore.fetchProjects()
  handleQuery()
})
</script>

<style scoped lang="scss">
.device-task-list {
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
