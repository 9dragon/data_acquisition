<template>
  <div class="user-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button v-if="hasPermission('user:create')" type="primary" @click="handleCreate">新增用户</el-button>
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
        <el-table-column prop="username" label="用户名" width="180" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="company" label="公司" min-width="200" />
        <el-table-column prop="source" label="来源" width="120">
          <template #default="{ row }">
            <span>{{ row.source === 1 ? '钉钉用户' : '本地用户' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleToggleStatus(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginTime" label="最后登录" width="160" />
        <el-table-column label="角色" width="200">
          <template #default="{ row }">
            <span>{{ getRoleNames(row.roleIds) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button v-if="hasPermission('user:edit')" link type="primary" :icon="Edit" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button link type="warning" :icon="RefreshRight" @click="handleResetPassword(row)">
                重置密码
              </el-button>
              <el-popconfirm
                v-if="hasPermission('user:delete')"
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

  <UserFormDialog ref="createDialogRef" @success="handleQuery" />
  <UserFormDialog ref="editDialogRef" @success="handleQuery" />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, RefreshRight } from '@element-plus/icons-vue'
import { http } from '@/api/request'
import { roleApi } from '@/api/role'
import { usePermissionStore } from '@/stores/permission'
import UserFormDialog from './UserFormDialog.vue'

const permissionStore = usePermissionStore()
const hasPermission = (code: string) => permissionStore.hasPermission(code)

const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const createDialogRef = ref()
const editDialogRef = ref()
const allRoles = ref<any[]>([])

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

function getRoleNames(roleIds?: number[]): string {
  if (!roleIds || roleIds.length === 0) return '-'
  const names = roleIds
    .map(id => allRoles.value.find(r => r.id === id)?.name)
    .filter(Boolean)
  return names.length > 0 ? names.join(', ') : '-'
}

async function loadAllRoles() {
  const res = await roleApi.getRolePage({ page: 1, pageSize: 100 })
  allRoles.value = res.records
}

function handleReset() {
  queryParams.keyword = ''
  queryParams.status = undefined
  queryParams.pageNum = 1
  handleQuery()
}

function handleCreate() {
  createDialogRef.value?.open()
}

function handleEdit(row: any) {
  editDialogRef.value?.open('edit', row)
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

function handleToggleStatus(row: any) {
  const action = row.status === 1 ? '启用' : '禁用'
  const hint = row.status === 1
    ? `启用后用户将可以正常登录系统`
    : `禁用后用户将无法登录系统`

  ElMessageBox.confirm(
    `<p><strong>确定要${action}用户"${row.name}"吗？</strong></p><p>${hint}</p>`,
    '切换状态',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      dangerouslyUseHTMLString: true
    }
  ).then(async () => {
    await http.put(`/users/${row.id}/toggle-status`)
    ElMessage.success(`用户已${action}`)
  }).catch(() => {
    row.status = row.status === 1 ? 0 : 1
    handleQuery()
  })
}

onMounted(() => {
  loadAllRoles()
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
