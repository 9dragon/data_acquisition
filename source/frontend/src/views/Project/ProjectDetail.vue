<template>
  <div class="project-detail" v-loading="loading">
    <el-page-header @back="goBack" class="page-header">
      <template #content>
        <span class="header-title">项目详情</span>
      </template>
    </el-page-header>

    <el-card class="info-card" shadow="never">
      <template #header>
        <div class="card-title">基本信息</div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="项目名称" :span="2">
          {{ project.name || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="项目编号">
          {{ project.code || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(project.status)">
            {{ getStatusName(project.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="优先级">
          <el-tag :type="getPriorityType(project.priority)">
            {{ getPriorityName(project.priority) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="项目负责人">
          {{ project.managerName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="开始日期">
          {{ project.startDate || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="结束日期">
          {{ project.endDate || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">
          {{ formatDateTime(project.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="项目描述" :span="2">
          <div class="description-text">{{ project.description || '-' }}</div>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="members-card" shadow="never">
      <template #header>
        <div class="card-title">
          <span>项目成员</span>
          <el-tag type="info" size="small">共 {{ members.length }} 人</el-tag>
        </div>
      </template>
      <el-table :data="members" border stripe size="small">
        <el-table-column label="姓名" prop="userName" width="160">
          <template #default="{ row }">
            {{ row.userName || '-' }}
            <span class="user-id" v-if="row.userId">（ID: {{ row.userId }}）</span>
          </template>
        </el-table-column>
        <el-table-column label="手机号" prop="userPhone" width="160">
          <template #default="{ row }">
            {{ row.userPhone || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="角色" prop="role" width="120">
          <template #default="{ row }">
            <el-tag :type="row.role === 'MANAGER' ? 'warning' : 'info'" size="small">
              {{ row.role === 'MANAGER' ? '项目经理' : '普通成员' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="加入时间" prop="joinedAt" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.joinedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="140">
          <template #default="{ row }">
            {{ row.remark || '-' }}
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!loading && members.length === 0" description="暂无成员" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { projectApi } from '@/api/project'
import { projectMemberApi, type ProjectMember } from '@/api/project'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const project = ref<Record<string, any>>({})
const members = ref<ProjectMember[]>([])

const loadDetail = async () => {
  const id = Number(route.params.id)
  if (!id) return
  loading.value = true
  try {
    const [proj, mems] = await Promise.all([
      projectApi.getById(id),
      projectMemberApi.list(id)
    ])
    project.value = proj || {}
    members.value = mems || []
  } catch (e: any) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/projects')
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
const priorityMap: Record<number, string> = {
  0: '低',
  1: '中',
  2: '高',
  3: '紧急'
}
const priorityTypeMap: Record<number, string> = {
  0: 'info',
  1: '',
  2: 'warning',
  3: 'danger'
}

function getStatusName(status: any) {
  const n = typeof status === 'string' ? parseInt(status) : status
  if (isNaN(n) || n === undefined || n === null) return '-'
  return statusMap[n] || '未知'
}
function getStatusType(status: any) {
  const n = typeof status === 'string' ? parseInt(status) : status
  if (isNaN(n) || n === undefined || n === null) return 'info'
  return statusTypeMap[n] || 'info'
}
function getPriorityName(priority: any) {
  const n = typeof priority === 'string' ? parseInt(priority) : priority
  if (isNaN(n) || n === undefined || n === null) return '-'
  return priorityMap[n] || '未知'
}
function getPriorityType(priority: any) {
  const n = typeof priority === 'string' ? parseInt(priority) : priority
  if (isNaN(n) || n === undefined || n === null) return 'info'
  return priorityTypeMap[n] || 'info'
}

const formatDateTime = (value: any): string => {
  if (!value) return '-'
  return value
}

onMounted(() => {
  loadDetail()
})
</script>

<style scoped>
.project-detail {
  padding: 8px;
}

.page-header {
  margin-bottom: 16px;
}

.header-title {
  font-size: 16px;
  font-weight: bold;
}

.info-card,
.members-card {
  margin-bottom: 16px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: bold;
  color: #303133;
}

.description-text {
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.6;
}

.user-id {
  font-size: 12px;
  color: #999;
}
</style>
