<template>
  <div class="role-list-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新增角色
          </el-button>
        </div>
      </template>

      <!-- 查询表单 -->
      <el-form :inline="true" :model="queryParams" class="query-form">
        <el-form-item label="角色名称">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入角色名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="角色编码">
          <el-input
            v-model="queryParams.code"
            placeholder="请输入角色编码"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 角色列表 -->
      <el-table
        v-loading="loading"
        :data="roleList"
        stripe
        border
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="角色名称" width="150" />
        <el-table-column prop="code" label="角色编码" width="150" />
        <el-table-column prop="description" label="角色描述" show-overflow-tooltip />
        <el-table-column prop="isSystem" label="系统预置" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.isSystem === 1" type="danger">是</el-tag>
            <el-tag v-else type="info">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="permissionCount" label="权限数量" width="120">
          <template #default="{ row }">
            <el-tag type="primary">{{ row.permissionCount || 0 }} 个</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">查看</el-button>
            <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button
              v-if="row.isSystem !== 1"
              size="small"
              type="danger"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleQuery"
        @current-change="handleQuery"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- 新增/查看/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :width="isEdit ? '900px' : '600px'"
      @close="handleDialogClose"
    >
      <el-tabs v-if="isEdit" v-model="activeDialogTab" class="dialog-tabs">
        <!-- 基本信息Tab -->
        <el-tab-pane label="基本信息" name="basic">
          <el-form
            ref="roleFormRef"
            :model="roleForm"
            :rules="roleRules"
            label-width="100px"
          >
            <el-form-item label="角色编码" prop="code">
              <el-input
                v-model="roleForm.code"
                placeholder="请输入角色编码"
                :disabled="roleForm.isSystem === 1"
              />
            </el-form-item>
            <el-form-item label="角色名称" prop="name">
              <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
            </el-form-item>
            <el-form-item label="角色描述" prop="description">
              <el-input
                v-model="roleForm.description"
                type="textarea"
                :rows="3"
                placeholder="请输入角色描述"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 权限详情Tab -->
        <el-tab-pane label="权限详情" name="permission-detail">
          <div class="permission-detail">
            <el-alert
              :title="`该角色拥有 ${rolePermissions.length} 个权限`"
              type="info"
              :closable="false"
              style="margin-bottom: 20px"
            />
            <el-tabs v-model="activePermissionTab">
              <el-tab-pane label="菜单权限" name="menu">
                <el-table :data="permissionsByType.menu" border stripe>
                  <el-table-column prop="name" label="权限名称" width="200" />
                  <el-table-column prop="code" label="权限编码" width="200" />
                  <el-table-column prop="description" label="描述" show-overflow-tooltip />
                  <el-table-column label="类型" width="100">
                    <template #default="{ row }">
                      <el-tag type="primary">菜单</el-tag>
                    </template>
                  </el-table-column>
                </el-table>
                <el-empty v-if="permissionsByType.menu.length === 0" description="暂无菜单权限" />
              </el-tab-pane>

              <el-tab-pane label="按钮权限" name="button">
                <el-table :data="permissionsByType.button" border stripe>
                  <el-table-column prop="name" label="权限名称" width="200" />
                  <el-table-column prop="code" label="权限编码" width="200" />
                  <el-table-column prop="description" label="描述" show-overflow-tooltip />
                  <el-table-column label="类型" width="100">
                    <template #default="{ row }">
                      <el-tag type="success">按钮</el-tag>
                    </template>
                  </el-table-column>
                </el-table>
                <el-empty v-if="permissionsByType.button.length === 0" description="暂无按钮权限" />
              </el-tab-pane>

              <el-tab-pane label="API权限" name="api">
                <el-table :data="permissionsByType.api" border stripe>
                  <el-table-column prop="name" label="权限名称" width="200" />
                  <el-table-column prop="code" label="权限编码" width="200" />
                  <el-table-column prop="method" label="HTTP方法" width="100" />
                  <el-table-column prop="path" label="API路径" />
                  <el-table-column label="类型" width="100">
                    <template #default="{ row }">
                      <el-tag type="warning">API</el-tag>
                    </template>
                  </el-table-column>
                </el-table>
                <el-empty v-if="permissionsByType.api.length === 0" description="暂无API权限" />
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-tab-pane>

        <!-- 分配权限Tab -->
        <el-tab-pane label="分配权限" name="assign-permission">
          <div class="permission-tree-container">
            <div class="tip">
              <el-icon><InfoFilled /></el-icon>
              请选择该角色拥有的权限
            </div>

            <!-- 权限统计 -->
            <el-alert
              :title="`已选择 ${checkedPermissionCount} 个权限`"
              type="info"
              :closable="false"
              style="margin-bottom: 15px"
            >
              <div class="permission-stats">
                <span>菜单: {{ permissionStats.menu }} 个</span>
                <el-divider direction="vertical" />
                <span>按钮: {{ permissionStats.button }} 个</span>
                <el-divider direction="vertical" />
                <span>API: {{ permissionStats.api }} 个</span>
              </div>
            </el-alert>

            <el-tree
              ref="permissionTreeRef"
              :data="permissionTree"
              :props="{ children: 'children', label: 'name' }"
              node-key="id"
              show-checkbox
              default-expand-all
              @check="handlePermissionCheck"
            >
              <template #default="{ node, data }">
                <span class="custom-tree-node">
                  <el-icon v-if="data.type === 'menu'"><Folder /></el-icon>
                  <el-icon v-else-if="data.type === 'button'"><Operation /></el-icon>
                  <el-icon v-else><Connection /></el-icon>
                  <span style="margin-left: 5px">{{ data.name }}</span>
                  <el-tag
                    size="small"
                    :type="data.type === 'menu' ? 'primary' : data.type === 'button' ? 'success' : 'warning'"
                    style="margin-left: 10px"
                  >
                    {{ data.type === 'menu' ? '菜单' : data.type === 'button' ? '按钮' : 'API' }}
                  </el-tag>
                </span>
              </template>
            </el-tree>
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- 查看模式：只显示基本信息和权限详情 -->
      <div v-else class="view-mode-content">
        <el-descriptions :column="2" border class="role-info">
          <el-descriptions-item label="角色编码">
            {{ roleForm.code }}
          </el-descriptions-item>
          <el-descriptions-item label="角色名称">
            {{ roleForm.name }}
          </el-descriptions-item>
          <el-descriptions-item label="角色描述" :span="2">
            {{ roleForm.description || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="系统预置" :span="2">
            <el-tag v-if="roleForm.isSystem === 1" type="danger">是</el-tag>
            <el-tag v-else type="info">否</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="权限总数" :span="2">
            <el-tag type="info">{{ rolePermissions.length }} 个权限</el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <el-tabs v-model="activePermissionTab">
          <el-tab-pane label="菜单权限" name="menu">
            <el-table :data="permissionsByType.menu" border stripe>
              <el-table-column prop="name" label="权限名称" width="200" />
              <el-table-column prop="code" label="权限编码" width="200" />
              <el-table-column prop="description" label="描述" show-overflow-tooltip />
              <el-table-column label="类型" width="100">
                <template #default="{ row }">
                  <el-tag type="primary">菜单</el-tag>
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-if="permissionsByType.menu.length === 0" description="暂无菜单权限" />
          </el-tab-pane>

          <el-tab-pane label="按钮权限" name="button">
            <el-table :data="permissionsByType.button" border stripe>
              <el-table-column prop="name" label="权限名称" width="200" />
              <el-table-column prop="code" label="权限编码" width="200" />
              <el-table-column prop="description" label="描述" show-overflow-tooltip />
              <el-table-column label="类型" width="100">
                <template #default="{ row }">
                  <el-tag type="success">按钮</el-tag>
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-if="permissionsByType.button.length === 0" description="暂无按钮权限" />
          </el-tab-pane>

          <el-tab-pane label="API权限" name="api">
            <el-table :data="permissionsByType.api" border stripe>
              <el-table-column prop="name" label="权限名称" width="200" />
              <el-table-column prop="code" label="权限编码" width="200" />
              <el-table-column prop="method" label="HTTP方法" width="100" />
              <el-table-column prop="path" label="API路径" />
              <el-table-column label="类型" width="100">
                <template #default="{ row }">
                  <el-tag type="warning">API</el-tag>
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-if="permissionsByType.api.length === 0" description="暂无API权限" />
          </el-tab-pane>
        </el-tabs>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">{{ isEdit ? '取消' : '关闭' }}</el-button>
        <el-button v-if="isEdit" type="primary" :loading="submitLoading" @click="handleSubmit">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search, Refresh, InfoFilled, Folder, Operation, Connection } from '@element-plus/icons-vue'
import { roleApi, permissionApi, type Role, type Permission } from '@/api/role'

const loading = ref(false)
const roleList = ref<Role[]>([])
const total = ref(0)

const queryParams = reactive({
  page: 1,
  pageSize: 10,
  name: '',
  code: ''
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const submitLoading = ref(false)
const roleFormRef = ref<FormInstance>()
const roleForm = reactive({
  id: 0,
  code: '',
  name: '',
  description: '',
  isSystem: 0
})

// 对话框Tab激活状态
const activeDialogTab = ref('basic')

const roleRules: FormRules = {
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在2到50个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在2到50个字符', trigger: 'blur' }
  ]
}

// 权限树相关
const permissionTreeRef = ref()
const permissionTree = ref<Permission[]>([])
const currentRoleId = ref<number>(0)
const rolePermissions = ref<Permission[]>([])
const activePermissionTab = ref('menu')

// 已选中的权限数量统计
const checkedPermissionCount = ref(0)

// 权限统计
const permissionStats = computed(() => {
  const checkedKeys = permissionTreeRef.value?.getCheckedKeys() as number[] || []
  const checkedKeysSet = new Set(checkedKeys)

  const stats = {
    menu: 0,
    button: 0,
    api: 0
  }

  const countPermissions = (permissions: Permission[]) => {
    permissions.forEach(p => {
      if (checkedKeysSet.has(p.id)) {
        if (p.type === 'menu') stats.menu++
        else if (p.type === 'button') stats.button++
        else if (p.type === 'api') stats.api++
      }
      if (p.children) {
        countPermissions(p.children)
      }
    })
  }

  countPermissions(permissionTree.value)
  return stats
})

// 按类型分组的权限
const permissionsByType = computed(() => {
  const menu: Permission[] = []
  const button: Permission[] = []
  const api: Permission[] = []

  rolePermissions.value.forEach(p => {
    if (p.type === 'menu') menu.push(p)
    else if (p.type === 'button') button.push(p)
    else if (p.type === 'api') api.push(p)
  })

  return { menu, button, api }
})

// 获取角色列表
const getRoleList = async () => {
  loading.value = true
  try {
    const response = await roleApi.getRolePage(queryParams)
    roleList.value = response.records || []
    total.value = response.total || 0
  } catch (error) {
    console.error('获取角色列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 查询
const handleQuery = () => {
  queryParams.page = 1
  getRoleList()
}

// 重置
const handleReset = () => {
  queryParams.name = ''
  queryParams.code = ''
  handleQuery()
}

// 新增
const handleCreate = () => {
  dialogTitle.value = '新增角色'
  isEdit.value = true
  activeDialogTab.value = 'basic'
  Object.assign(roleForm, {
    id: 0,
    code: '',
    name: '',
    description: '',
    isSystem: 0
  })
  permissionTree.value = []
  rolePermissions.value = []
  dialogVisible.value = true
}

// 查看
const handleView = async (row: Role) => {
  dialogTitle.value = '查看角色'
  isEdit.value = false
  activeDialogTab.value = 'basic'
  Object.assign(roleForm, row)
  dialogVisible.value = true

  // 加载权限详情
  try {
    const permissions = await roleApi.getRolePermissionsDetail(row.id)
    rolePermissions.value = permissions
  } catch (error) {
    ElMessage.error('获取权限详情失败')
  }
}

// 编辑
const handleEdit = async (row: Role) => {
  dialogTitle.value = '编辑角色'
  isEdit.value = true
  activeDialogTab.value = 'basic'
  Object.assign(roleForm, row)
  dialogVisible.value = true
  currentRoleId.value = row.id

  // 加载权限树和当前角色的权限
  try {
    const [permissions, rolePermissionIds, rolePermissionDetail] = await Promise.all([
      permissionApi.getPermissions(),
      roleApi.getRolePermissions(row.id),
      roleApi.getRolePermissionsDetail(row.id)
    ])

    permissionTree.value = permissions
    rolePermissions.value = rolePermissionDetail

    // 设置已选中的权限ID列表
    setTimeout(() => {
      permissionTreeRef.value?.setCheckedKeys(rolePermissionIds)
    }, 100)
  } catch (error) {
    ElMessage.error('加载权限失败')
  }
}

// 删除
const handleDelete = (row: Role) => {
  ElMessageBox.confirm(`确定要删除角色"${row.name}"吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await roleApi.deleteRole(row.id)
      ElMessage.success('删除成功')
      getRoleList()
    } catch (error: any) {
      ElMessage.error(error.message || '删除失败')
    }
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!roleFormRef.value) return

  try {
    await roleFormRef.value.validate()
    submitLoading.value = true

    if (roleForm.id) {
      // 编辑模式：先更新角色基本信息，再保存权限分配
      await roleApi.updateRole(roleForm.id, roleForm)

      // 如果有权限树，保存权限分配
      if (permissionTree.value.length > 0) {
        const checkedKeys = permissionTreeRef.value?.getCheckedKeys() || []
        await roleApi.assignPermissions(roleForm.id, checkedKeys as number[])
      }

      ElMessage.success('保存成功')
    } else {
      // 新增模式
      await roleApi.createRole(roleForm)
      ElMessage.success('创建成功')
    }

    dialogVisible.value = false
    getRoleList()
  } catch (error: any) {
    if (error?.message) {
      ElMessage.error(error.message)
    }
  } finally {
    submitLoading.value = false
  }
}

// 对话框关闭
const handleDialogClose = () => {
  roleFormRef.value?.resetFields()
  Object.assign(roleForm, {
    id: 0,
    code: '',
    name: '',
    description: '',
    isSystem: 0
  })
  permissionTree.value = []
  rolePermissions.value = []
  currentRoleId.value = 0
  checkedPermissionCount.value = 0
  activeDialogTab.value = 'basic'
  activePermissionTab.value = 'menu'
}

// 权限选择变化
const handlePermissionCheck = () => {
  const checkedKeys = permissionTreeRef.value?.getCheckedKeys() as number[] || []
  checkedPermissionCount.value = checkedKeys.length
}

onMounted(() => {
  getRoleList()
})
</script>

<style scoped>
.role-list-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.query-form {
  margin-bottom: 20px;
}

.permission-tree-container {
  max-height: 500px;
  overflow-y: auto;
}

.tip {
  padding: 10px;
  margin-bottom: 20px;
  background-color: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 4px;
  color: #409eff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.permission-detail {
  padding: 10px;
}

.role-info {
  margin-bottom: 20px;
}

.permission-tabs {
  margin-top: 20px;
}

.permission-stats {
  display: flex;
  gap: 10px;
  font-size: 14px;
}

.custom-tree-node {
  display: flex;
  align-items: center;
  width: 100%;
}

.dialog-tabs {
  margin-top: -20px;
}

.view-mode-content {
  padding: 10px;
}
</style>
