<template>
  <div class="project-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>项目列表</span>
          <el-button type="primary" :icon="Plus" @click="handleCreate">新增项目</el-button>
        </div>
      </template>

      <!-- 筛选栏 -->
      <el-form :inline="true" :model="queryParams" class="filter-bar">
        <el-form-item label="项目名称">
          <el-input v-model="queryParams.name" placeholder="请输入项目名称" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="项目编号">
          <el-input v-model="queryParams.code" placeholder="请输入项目编号" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择" clearable style="width: 120px">
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
        <el-table-column prop="code" label="项目编号" width="150" fixed="left" />
        <el-table-column prop="name" label="项目名称" min-width="200" fixed="left" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusName(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)">{{ getPriorityName(row.priority) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="managerName" label="项目负责人" width="120" />
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
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
                width="200"
                @confirm="handleDelete(row)"
              >
                <template #reference>
                  <el-button link type="danger" :icon="Delete">
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
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
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { View, Edit, Delete, Plus } from '@element-plus/icons-vue'
import { http } from '@/api/request'

const router = useRouter()

const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  name: '',
  code: '',
  status: undefined as number | undefined
})

// 状态映射
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

// 优先级映射
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

function getStatusName(status: number | string) {
  const numStatus = typeof status === 'string' ? parseInt(status) : status
  if (isNaN(numStatus) || numStatus === undefined || numStatus === null) return '-'
  return statusMap[numStatus] || '未知'
}

function getStatusType(status: number | string) {
  const numStatus = typeof status === 'string' ? parseInt(status) : status
  if (isNaN(numStatus) || numStatus === undefined || numStatus === null) return 'info'
  return statusTypeMap[numStatus] || 'info'
}

function getPriorityName(priority: number | string) {
  const numPriority = typeof priority === 'string' ? parseInt(priority) : priority
  if (isNaN(numPriority) || numPriority === undefined || numPriority === null) return '-'
  return priorityMap[numPriority] || '未知'
}

function getPriorityType(priority: number | string) {
  const numPriority = typeof priority === 'string' ? parseInt(priority) : priority
  if (isNaN(numPriority) || numPriority === undefined || numPriority === null) return 'info'
  return priorityTypeMap[numPriority] || 'info'
}

// 格式化时间显示
function formatDateTime(value: any): string {
  if (!value) return '-'
  return value
}

// 获取列表数据
async function handleQuery() {
  loading.value = true
  try {
    // 合并名称和编号作为关键词搜索
    const keyword = queryParams.name || queryParams.code
    const params = {
      pageNum: queryParams.pageNum,
      pageSize: queryParams.pageSize,
      keyword,
      status: queryParams.status
    }
    const response = await http.get<any>('/projects', { params })
    tableData.value = response.records || []
    total.value = response.total || 0
  } finally {
    loading.value = false
  }
}

function handleReset() {
  queryParams.name = ''
  queryParams.code = ''
  queryParams.status = undefined
  queryParams.pageNum = 1
  handleQuery()
}

// 新增
function handleCreate() {
  router.push('/projects/create')
}

// 编辑
function handleEdit(row: any) {
  router.push(`/projects/${row.id}/edit`)
}

// 查看
function handleView(row: any) {
  router.push(`/projects/${row.id}`)
}

// 删除
function handleDelete(row: any) {
  ElMessageBox.confirm(`确定要删除项目"${row.name}"吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await http.delete(`/projects/${row.id}`)
      ElMessage.success('删除成功')
      handleQuery()
    } catch (error: any) {
      ElMessage.error(error.message || '删除失败')
    }
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
