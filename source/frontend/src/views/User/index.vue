<template>
  <div class="user-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="handleCreate">新增用户</el-button>
        </div>
      </template>

      <!-- 筛选栏 -->
      <el-form :inline="true" :model="queryParams" class="filter-bar">
        <el-form-item label="关键词">
          <el-input v-model="queryParams.keyword" placeholder="用户名/姓名" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择" clearable>
            <el-option label="禁用" :value="0" />
            <el-option label="启用" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table :data="tableData" :loading="loading" border stripe>
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginTime" label="最后登录" width="160" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button link type="primary" :icon="Edit" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button link type="warning" :icon="RefreshRight" @click="handleResetPassword(row)">
                重置密码
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, RefreshRight } from '@element-plus/icons-vue'
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

async function handleQuery() {
  loading.value = true
  try {
    const response = await http.get<any>('/users', { params: queryParams })
    tableData.value = response.records
    total.value = response.total
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
  ElMessage.info('新增用户功能开发中')
}

function handleEdit(row: any) {
  ElMessage.info(`编辑用户：${row.name}`)
}

function handleResetPassword(row: any) {
  ElMessageBox.confirm(`确定要重置用户"${row.name}"的密码吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    await http.put(`/users/${row.id}/reset-password`, { password: '123456' })
    ElMessage.success('密码已重置为：123456')
  }).catch(() => {})
}

function handleDelete(row: any) {
  ElMessageBox.confirm(`确定要删除用户"${row.name}"吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    await http.delete(`/users/${row.id}`)
    ElMessage.success('删除成功')
    handleQuery()
  }).catch(() => {})
}

onMounted(() => {
  handleQuery()
})
</script>

<style scoped>
.user-list {
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
