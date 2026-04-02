<template>
  <div class="my-issues">
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="待处理" name="todo">
        <el-table :data="todoList" :loading="loading" border stripe>
          <el-table-column prop="code" label="问题编号" width="150" />
          <el-table-column prop="title" label="问题标题" min-width="200" />
          <el-table-column prop="projectName" label="所属项目" width="150" />
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
          <el-table-column prop="createTime" label="创建时间" width="160">
            <template #default="{ row }">
              {{ formatDateTime(row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button link type="primary" @click="handleView(row)">查看</el-button>
                <el-button v-if="row.status === 'assigned'" link type="primary" @click="handleStart(row)">开始处理</el-button>
                <el-button v-if="row.status === 'in_progress'" link type="success" @click="handleResolve(row)">标记解决</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="我提交的" name="reported">
        <el-table :data="reportedList" :loading="loading" border stripe>
          <el-table-column prop="code" label="问题编号" width="150" />
          <el-table-column prop="title" label="问题标题" min-width="200" />
          <el-table-column prop="projectName" label="所属项目" width="150" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">{{ getStatusName(row.status) }}</el-tag>
            </template>
          </el-table-column>
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
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleView(row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="抄送给我的" name="cc">
        <el-table :data="ccList" :loading="loading" border stripe>
          <el-table-column prop="code" label="问题编号" width="150" />
          <el-table-column prop="title" label="问题标题" min-width="200" />
          <el-table-column prop="projectName" label="所属项目" width="150" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">{{ getStatusName(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="assigneeName" label="负责人" width="100">
            <template #default="{ row }">
              {{ row.assigneeName || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="updateTime" label="更新时间" width="160">
            <template #default="{ row }">
              {{ formatDateTime(row.updateTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleView(row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { issueApi } from '@/api/issue'
import type { Issue } from '@/types/issue'
import { ISSUE_PRIORITY_OPTIONS, ISSUE_STATUS_OPTIONS } from '@/types/issue'

const router = useRouter()

const currentUserId = Number(localStorage.getItem('userId')) || 1

const activeTab = ref('todo')
const loading = ref(false)
const todoList = ref<Issue[]>([])
const reportedList = ref<Issue[]>([])
const ccList = ref<Issue[]>([])

onMounted(() => {
  loadData()
})

watch(activeTab, () => {
  loadData()
})

async function loadData() {
  loading.value = true
  try {
    if (activeTab.value === 'todo') {
      todoList.value = await issueApi.myTodo(currentUserId)
    } else if (activeTab.value === 'reported') {
      reportedList.value = await issueApi.myReported(currentUserId)
    } else if (activeTab.value === 'cc') {
      ccList.value = await issueApi.myCc(currentUserId)
    }
  } catch (e) {
    console.error('加载失败', e)
  } finally {
    loading.value = false
  }
}

function handleView(row: Issue) {
  router.push(`/issue/${row.id}`)
}

async function handleStart(row: Issue) {
  try {
    await issueApi.updateStatus(row.id, 'in_progress', currentUserId, '开始处理')
    ElMessage.success('已开始处理')
    loadData()
  } catch (e) {
    console.error('操作失败', e)
  }
}

async function handleResolve(row: Issue) {
  try {
    await issueApi.updateStatus(row.id, 'resolved', currentUserId, '问题已解决')
    ElMessage.success('已标记为解决')
    loadData()
  } catch (e) {
    console.error('操作失败', e)
  }
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
.my-issues {
  padding: 16px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}
</style>
