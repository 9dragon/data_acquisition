<template>
  <div class="project-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>项目列表</span>
          <el-button type="primary" @click="handleCreate">新增项目</el-button>
        </div>
      </template>

      <!-- 筛选栏 -->
      <el-form :inline="true" :model="queryParams" class="filter-bar">
        <el-form-item label="关键词">
          <el-input v-model="queryParams.keyword" placeholder="项目名称/编号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择" clearable>
            <el-option label="未开始" :value="0" />
            <el-option label="进行中" :value="1" />
            <el-option label="暂停" :value="2" />
            <el-option label="已完成" :value="3" />
            <el-option label="已取消" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table :data="tableData" :loading="loading" border stripe>
        <el-table-column prop="code" label="项目编号" width="150" />
        <el-table-column prop="name" label="项目名称" min-width="200" />
        <el-table-column prop="stage" label="项目阶段" width="120">
          <template #default="{ row }">
            <el-tag>{{ getStageName(row.stage) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusName(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="120">
          <template #default="{ row }">
            <el-progress :percentage="row.progress || 0" />
          </template>
        </el-table-column>
        <el-table-column prop="managerName" label="负责人" width="120" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleQuery"
        @current-change="handleQuery"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useProjectStore } from '@/stores/project'
import type { Project } from '@/types/project'

const projectStore = useProjectStore()
const loading = ref(false)
const tableData = ref<Project[]>([])
const total = ref(0)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: undefined as number | undefined,
  stage: ''
})

const stageMap: Record<string, string> = {
  presale: '售前调研',
  planning: '准备阶段',
  construction: '施工阶段',
  configuration: '配置阶段',
  verification: '核对阶段',
  acceptance: '验收阶段'
}

const statusMap: Record<number, string> = {
  0: '未开始',
  1: '进行中',
  2: '暂停',
  3: '已完成',
  4: '已取消'
}

const statusTypeMap: Record<number, string> = {
  0: 'info',
  1: 'warning',
  2: 'danger',
  3: 'success',
  4: 'info'
}

function getStageName(stage: string) {
  return stageMap[stage] || stage
}

function getStatusName(status: number) {
  return statusMap[status] || '未知'
}

function getStatusType(status: number) {
  return statusTypeMap[status] || 'info'
}

async function handleQuery() {
  loading.value = true
  try {
    const response = await projectStore.fetchProjects(queryParams)
    tableData.value = response.records
    total.value = response.total
  } finally {
    loading.value = false
  }
}

function handleReset() {
  queryParams.keyword = ''
  queryParams.status = undefined
  queryParams.stage = ''
  queryParams.pageNum = 1
  handleQuery()
}

function handleCreate() {
  ElMessage.info('新增项目功能开发中')
}

function handleView(row: Project) {
  ElMessage.info(`查看项目：${row.name}`)
}

function handleEdit(row: Project) {
  ElMessage.info(`编辑项目：${row.name}`)
}

function handleDelete(row: Project) {
  ElMessageBox.confirm(`确定要删除项目"${row.name}"吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    await projectStore.deleteProject(row.id)
    ElMessage.success('删除成功')
    handleQuery()
  }).catch(() => {})
}

onMounted(() => {
  handleQuery()
})
</script>

<style scoped>
.project-list {
  padding: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-bar {
  margin-bottom: 20px;
}

.el-pagination {
  margin-top: 20px;
  justify-content: flex-end;
}
</style>
