<template>
  <div class="device-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>设备列表</span>
          <el-button type="primary" @click="handleCreate">新增设备</el-button>
        </div>
      </template>

      <!-- 筛选栏 -->
      <el-form :inline="true" :model="queryParams" class="filter-bar">
        <el-form-item label="关键词">
          <el-input v-model="queryParams.keyword" placeholder="设备名称/编号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择" clearable>
            <el-option label="离线" :value="0" />
            <el-option label="在线" :value="1" />
            <el-option label="维护中" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table :data="tableData" :loading="loading" border stripe>
        <el-table-column prop="code" label="设备编码" width="150" />
        <el-table-column prop="name" label="设备名称" min-width="200" />
        <el-table-column prop="projectName" label="所属项目" width="150" />
        <el-table-column prop="typeName" label="设备类型" width="120" />
        <el-table-column prop="workshopName" label="所属车间" width="120" />
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
        <el-table-column prop="responsiblePersonName" label="负责人" width="120" />
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
import { http } from '@/api/request'

const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: undefined as number | undefined
})

const statusMap: Record<number, string> = {
  0: '离线',
  1: '在线',
  2: '维护中'
}

const statusTypeMap: Record<number, string> = {
  0: 'info',
  1: 'success',
  2: 'warning'
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
    const response = await http.get<any>('/devices', { params: queryParams })
    tableData.value = response.records || []
    total.value = response.total || 0
  } finally {
    loading.value = false
  }
}

function handleReset() {
  queryParams.keyword = ''
  queryParams.status = undefined
  queryParams.pageNum = 1
  handleQuery()
}

function handleCreate() {
  ElMessage.info('新增设备功能开发中')
}

function handleView(row: any) {
  ElMessage.info(`查看设备：${row.name}`)
}

function handleEdit(row: any) {
  ElMessage.info(`编辑设备：${row.name}`)
}

function handleDelete(row: any) {
  ElMessageBox.confirm(`确定要删除设备"${row.name}"吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    await http.delete(`/devices/${row.id}`)
    ElMessage.success('删除成功')
    handleQuery()
  }).catch(() => {})
}

onMounted(() => {
  handleQuery()
})
</script>

<style scoped>
.device-list {
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
