<template>
  <div class="process-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>工序管理</span>
          <el-button type="primary" @click="handleCreate">新增工序</el-button>
        </div>
      </template>

      <!-- 筛选栏 -->
      <el-form :inline="true" :model="queryParams" class="filter-bar">
        <el-form-item label="关键词">
          <el-input v-model="queryParams.keyword" placeholder="工序名称/编号" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table :data="tableData" :loading="loading" border stripe>
        <el-table-column prop="code" label="工序编号" width="150" />
        <el-table-column prop="name" label="工序名称" min-width="200" />
        <el-table-column prop="projectName" label="所属项目" width="200" />
        <el-table-column prop="description" label="工序描述" min-width="200" />
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
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
  keyword: ''
})

async function handleQuery() {
  loading.value = true
  try {
    const response = await http.get<any>('/processes', { params: queryParams })
    tableData.value = response.records
    total.value = response.total
  } finally {
    loading.value = false
  }
}

function handleReset() {
  queryParams.keyword = ''
  queryParams.pageNum = 1
  handleQuery()
}

function handleCreate() {
  ElMessage.info('新增工序功能开发中')
}

function handleEdit(row: any) {
  ElMessage.info(`编辑工序：${row.name}`)
}

function handleDelete(row: any) {
  ElMessageBox.confirm(`确定要删除工序"${row.name}"吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    await http.delete(`/processes/${row.id}`)
    ElMessage.success('删除成功')
    handleQuery()
  }).catch(() => {})
}

onMounted(() => {
  handleQuery()
})
</script>

<style scoped>
.process-list {
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
