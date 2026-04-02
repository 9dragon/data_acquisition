<template>
  <div class="issue-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>问题列表</span>
          <el-button type="primary" @click="handleCreate">新建问题</el-button>
        </div>
      </template>

      <el-form :inline="true" :model="queryParams" class="filter-bar">
        <el-form-item label="关键词">
          <el-input v-model="queryParams.keyword" placeholder="问题编号/标题" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="项目">
          <el-select v-model="queryParams.projectId" placeholder="请选择" clearable style="width: 160px">
            <el-option v-for="p in projectOptions" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="问题类型">
          <el-select v-model="queryParams.type" placeholder="请选择" clearable style="width: 120px">
            <el-option v-for="opt in ISSUE_TYPE_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="queryParams.priority" placeholder="请选择" clearable style="width: 100px">
            <el-option v-for="opt in ISSUE_PRIORITY_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择" clearable style="width: 120px">
            <el-option v-for="opt in ISSUE_STATUS_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" :loading="loading" border stripe>
        <el-table-column prop="code" label="问题编号" width="150" />
        <el-table-column prop="title" label="问题标题" min-width="200" />
        <el-table-column prop="projectName" label="所属项目" width="150" />
        <el-table-column prop="deviceName" label="关联设备" width="120">
          <template #default="{ row }">
            {{ row.deviceName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag>{{ getTypeName(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="80">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)">{{ getPriorityName(row.priority) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusName(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reporterName" label="报告人" width="100" />
        <el-table-column prop="assigneeName" label="负责人" width="100">
          <template #default="{ row }">
            {{ row.assigneeName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button link type="primary" @click="handleView(row)">查看</el-button>
              <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
              <el-popconfirm title="确认删除" @confirm="handleDelete(row)">
                <template #reference>
                  <el-button link type="danger">删除</el-button>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>

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

    <IssueForm
      v-model="dialogVisible"
      :data="currentIssue"
      :mode="formMode"
      @success="handleQuery"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { issueApi } from '@/api/issue'
import type { Issue } from '@/types/issue'
import { ISSUE_TYPE_OPTIONS, ISSUE_PRIORITY_OPTIONS, ISSUE_STATUS_OPTIONS } from '@/types/issue'
import { http } from '@/api/request'
import IssueForm from './IssueForm.vue'

const router = useRouter()

const loading = ref(false)
const tableData = ref<Issue[]>([])
const total = ref(0)
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  projectId: undefined as number | undefined,
  type: '',
  priority: '',
  status: ''
})

const dialogVisible = ref(false)
const currentIssue = ref<Issue | null>(null)
const formMode = ref<'create' | 'edit' | 'view'>('create')

const projectOptions = ref<{ id: number; name: string }[]>([])

onMounted(() => {
  loadProjects()
  handleQuery()
})

async function loadProjects() {
  try {
    const res = await http.get<{ data: { list: { id: number; name: string }[] } }>('/projects', { params: { pageNum: 1, pageSize: 100 } })
    projectOptions.value = res?.data?.list || []
  } catch (e) {
    console.error('加载项目失败', e)
  }
}

async function handleQuery() {
  loading.value = true
  try {
    const res = await issueApi.page(queryParams.value)
    tableData.value = res.data || []
    total.value = res.total || 0
  } catch (e) {
    console.error('查询失败', e)
  } finally {
    loading.value = false
  }
}

function handleReset() {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    keyword: '',
    projectId: undefined,
    type: '',
    priority: '',
    status: ''
  }
  handleQuery()
}

function handleCreate() {
  currentIssue.value = null
  formMode.value = 'create'
  dialogVisible.value = true
}

function handleView(row: Issue) {
  router.push(`/issue/${row.id}`)
}

function handleEdit(row: Issue) {
  currentIssue.value = row
  formMode.value = 'edit'
  dialogVisible.value = true
}

async function handleDelete(row: Issue) {
  try {
    await issueApi.delete(row.id)
    ElMessage.success('删除成功')
    handleQuery()
  } catch (e) {
    console.error('删除失败', e)
  }
}

function getTypeName(type: string) {
  return ISSUE_TYPE_OPTIONS.find(o => o.value === type)?.label || type
}

function getPriorityName(priority: string) {
  return ISSUE_PRIORITY_OPTIONS.find(o => o.value === priority)?.label || priority
}

function getStatusName(status: string) {
  return ISSUE_STATUS_OPTIONS.find(o => o.value === status)?.label || status
}

function getPriorityType(priority: string) {
  const map: Record<string, string> = {
    low: 'info',
    medium: '',
    high: 'warning',
    urgent: 'danger'
  }
  return map[priority] || ''
}

function getStatusType(status: string) {
  const map: Record<string, string> = {
    open: 'danger',
    assigned: 'warning',
    in_progress: 'primary',
    resolved: 'success',
    closed: 'info'
  }
  return map[status] || ''
}

function formatDateTime(dateStr: string) {
  if (!dateStr) return ''
  return dateStr.replace('T', ' ').substring(0, 19)
}
</script>

<style scoped>
.issue-list {
  padding: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-bar {
  margin-bottom: 16px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}
</style>
