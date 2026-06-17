<template>
  <div class="project-edit" v-loading="loading">
    <el-page-header @back="goBack" class="page-header">
      <template #content>
        <span class="header-title">{{ isEdit ? '编辑项目' : '新增项目' }}</span>
      </template>
    </el-page-header>

    <!-- 基本信息卡片 -->
    <el-card class="info-card" shadow="never">
      <template #header>
        <div class="card-title">基本信息</div>
      </template>
      <el-form
        ref="projectFormRef"
        :model="projectForm"
        :rules="formRules"
        label-width="100px"
      >
        <el-divider content-position="left">基础信息</el-divider>

        <el-form-item label="项目名称" prop="name">
          <el-input v-model="projectForm.name" placeholder="请输入项目名称" />
        </el-form-item>

        <el-form-item label="项目编号" prop="code">
          <el-input v-model="projectForm.code" placeholder="请输入项目编号，如：PRJ-2024-001" />
        </el-form-item>

        <el-form-item label="项目描述">
          <el-input
            v-model="projectForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入项目描述"
          />
        </el-form-item>

        <el-form-item label="项目负责人" prop="managerUserId">
          <el-select
            v-model="projectForm.managerUserId"
            filterable
            remote
            reserve-keyword
            placeholder="请输入姓名搜索"
            :remote-method="searchManagerUser"
            :loading="managerLoading"
            style="width: 100%"
          >
            <el-option
              v-for="u in managerUserOptions"
              :key="u.id"
              :label="u.name"
              :value="u.id as number"
            />
          </el-select>
          <div class="form-tip">项目负责人即项目经理，可在下方"项目成员"中调整</div>
        </el-form-item>

        <el-form-item label="优先级" prop="priority">
          <el-select v-model="projectForm.priority" placeholder="请选择优先级" style="width: 100%">
            <el-option label="低" :value="0" />
            <el-option label="中" :value="1" />
            <el-option label="高" :value="2" />
            <el-option label="紧急" :value="3" />
          </el-select>
        </el-form-item>

        <el-form-item label="项目状态">
          <el-select v-model="projectForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="未开始" :value="0" />
            <el-option label="进行中" :value="1" />
            <el-option label="暂停" :value="2" />
            <el-option label="已完成" :value="3" />
            <el-option label="已取消" :value="4" />
          </el-select>
        </el-form-item>

        <el-form-item label="开始时间">
          <el-date-picker
            v-model="projectForm.startDate"
            type="date"
            placeholder="请选择开始时间"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-form-item label="计划结束时间">
          <el-date-picker
            v-model="projectForm.plannedEndDate"
            type="date"
            placeholder="请选择计划结束时间"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
            保存
          </el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 项目成员卡片（仅编辑模式显示） -->
    <el-card v-if="isEdit" class="members-card" shadow="never">
      <template #header>
        <div class="card-title">
          <span>项目成员</span>
          <el-tag type="info" size="small">共 {{ members.length }} 人</el-tag>
        </div>
      </template>

      <div class="action-bar">
        <el-button type="primary" :icon="Plus" @click="openAddDialog">
          添加成员
        </el-button>
        <el-button :icon="Refresh" @click="loadMembers">刷新</el-button>
      </div>

      <el-table :data="members" :loading="memberLoading" border stripe size="small">
        <el-table-column label="姓名" prop="userName" width="160">
          <template #default="{ row }">
            {{ row.userName || '-' }}
            <span class="user-id" v-if="row.userId">（ID: {{ row.userId }}）</span>
          </template>
        </el-table-column>
        <el-table-column label="手机号" prop="userPhone" width="150">
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
        <el-table-column label="备注" prop="remark" min-width="120">
          <template #default="{ row }">
            {{ row.remark || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                link
                type="primary"
                :icon="row.role === 'MANAGER' ? ArrowDown : ArrowUp"
                @click="toggleRole(row)"
              >
                {{ row.role === 'MANAGER' ? '设为成员' : '设为经理' }}
              </el-button>
              <el-popconfirm
                title="确认移除该成员？"
                confirm-button-text="确定"
                cancel-button-text="取消"
                width="200"
                @confirm="handleRemoveMember(row)"
              >
                <template #reference>
                  <el-button link type="danger" :icon="Delete">
                    移除
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!memberLoading && members.length === 0" description="暂无成员" />
    </el-card>

    <!-- 添加成员子对话框 -->
    <el-dialog
      v-model="addDialogVisible"
      title="添加成员"
      width="500px"
      append-to-body
    >
      <el-form :model="addForm" label-width="80px">
        <el-form-item label="项目">
          <el-input :value="projectForm.name" disabled />
        </el-form-item>
        <el-form-item label="角色">
          <el-radio-group v-model="addForm.role">
            <el-radio value="MEMBER">普通成员</el-radio>
            <el-radio value="MANAGER">项目经理</el-radio>
          </el-radio-group>
          <div class="form-tip" v-if="addForm.role === 'MANAGER'">
            设为项目经理后，原项目经理将自动降级为普通成员
          </div>
        </el-form-item>
        <el-form-item label="选择用户">
          <el-select
            v-model="addForm.userIds"
            multiple
            filterable
            remote
            reserve-keyword
            placeholder="输入姓名/手机号搜索"
            :remote-method="searchUsers"
            :loading="userSearchLoading"
            style="width: 100%"
          >
            <el-option
              v-for="u in userOptions"
              :key="u.id"
              :label="u.name"
              :value="u.id as any"
            />
          </el-select>
          <div class="form-tip">已存在成员将被自动跳过</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="addSubmitting" @click="handleAddMembers">
          添加
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Refresh, Delete, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { projectApi, projectMemberApi, type ProjectMember } from '@/api/project'
import { userApi, type Option } from '@/api/user'

const route = useRoute()
const router = useRouter()

const projectId = computed(() => {
  const id = route.params.id
  return id ? Number(id) : null
})
const isEdit = computed(() => projectId.value !== null)

const loading = ref(false)
const submitLoading = ref(false)

const projectFormRef = ref<FormInstance>()
const projectForm = reactive({
  id: 0,
  name: '',
  code: '',
  description: '',
  managerUserId: undefined as number | undefined,
  priority: 1,
  status: 0,
  startDate: '',
  plannedEndDate: ''
})

const managerUserOptions = ref<Array<{ id: number | string; name: string }>>([])
const managerLoading = ref(false)

const searchManagerUser = async (keyword: string) => {
  managerLoading.value = true
  try {
    managerUserOptions.value = await userApi.getOptions({ keyword })
  } catch (e) {
    managerUserOptions.value = []
  } finally {
    managerLoading.value = false
  }
}

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入项目编号', trigger: 'blur' }
  ],
  managerUserId: [
    { required: true, message: '请选择项目负责人', trigger: 'change' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ]
}

// 成员管理相关（仅编辑模式使用）
const memberLoading = ref(false)
const members = ref<ProjectMember[]>([])

const loadMembers = async () => {
  if (!projectId.value) return
  memberLoading.value = true
  try {
    members.value = await projectMemberApi.list(projectId.value)
  } catch (e: any) {
    ElMessage.error(e?.message || '加载成员失败')
  } finally {
    memberLoading.value = false
  }
}

// 添加成员子对话框
const addDialogVisible = ref(false)
const addSubmitting = ref(false)
const userSearchLoading = ref(false)
const userOptions = ref<Option[]>([])
const addForm = reactive<{ userIds: number[]; role: 'MANAGER' | 'MEMBER' }>({
  userIds: [],
  role: 'MEMBER'
})

const openAddDialog = () => {
  addForm.userIds = []
  addForm.role = 'MEMBER'
  addDialogVisible.value = true
  searchUsers('')
}

const searchUsers = async (keyword: string) => {
  userSearchLoading.value = true
  try {
    userOptions.value = await userApi.getOptions({ keyword })
  } catch (e) {
    userOptions.value = []
  } finally {
    userSearchLoading.value = false
  }
}

const handleAddMembers = async () => {
  if (addForm.userIds.length === 0) {
    ElMessage.warning('请至少选择一个用户')
    return
  }
  if (!projectId.value) return
  addSubmitting.value = true
  try {
    const count = await projectMemberApi.add(projectId.value, addForm.userIds, addForm.role)
    ElMessage.success(`成功添加 ${count} 人`)
    addDialogVisible.value = false
    await loadMembers()
    // 若新增经理，基本信息中的项目负责人下拉也需要刷新
    if (addForm.role === 'MANAGER') {
      await loadProjectDetail()
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '添加失败')
  } finally {
    addSubmitting.value = false
  }
}

const toggleRole = async (row: ProjectMember) => {
  if (!projectId.value) return
  const newRole = row.role === 'MANAGER' ? 'MEMBER' : 'MANAGER'
  try {
    await projectMemberApi.updateRole(projectId.value, row.userId, newRole)
    ElMessage.success('角色已更新')
    await loadMembers()
    // 角色变化可能影响项目经理，刷新基本信息
    await loadProjectDetail()
  } catch (e: any) {
    ElMessage.error(e?.message || '更新失败')
  }
}

const handleRemoveMember = async (row: ProjectMember) => {
  if (!projectId.value) return
  try {
    await projectMemberApi.remove(projectId.value, row.userId)
    ElMessage.success('已移除')
    await loadMembers()
  } catch (e: any) {
    ElMessage.error(e?.message || '移除失败')
  }
}

// 加载项目详情（编辑模式）
const loadProjectDetail = async () => {
  if (!projectId.value) return
  loading.value = true
  try {
    const detail = await projectApi.getById(projectId.value)
    await searchManagerUser('')
    if (detail.managerUserId) {
      const exists = managerUserOptions.value.find(
        u => Number(u.id) === Number(detail.managerUserId)
      )
      if (!exists) {
        managerUserOptions.value.unshift({
          id: detail.managerUserId,
          name: detail.managerName || `用户${detail.managerUserId}`
        })
      }
    }
    Object.assign(projectForm, {
      id: detail.id || projectId.value,
      name: detail.name || '',
      code: detail.code || '',
      description: detail.description || '',
      managerUserId: detail.managerUserId,
      priority: detail.priority !== undefined && detail.priority !== null ? Number(detail.priority) : 1,
      status: detail.status !== undefined && detail.status !== null ? Number(detail.status) : 0,
      startDate: detail.startDate || '',
      plannedEndDate: detail.plannedEndDate || ''
    })
  } catch (e: any) {
    ElMessage.error(e?.message || '加载项目失败')
  } finally {
    loading.value = false
  }
}

// 保存基本信息
const handleSubmit = async () => {
  if (!projectFormRef.value) return
  try {
    await projectFormRef.value.validate()
    submitLoading.value = true

    const submitData = {
      ...projectForm,
      startDate: projectForm.startDate || null,
      endDate: (projectForm as any).endDate || null,
      plannedEndDate: projectForm.plannedEndDate || null
    }

    if (isEdit.value && projectId.value) {
      await projectApi.update(projectId.value, submitData)
      ElMessage.success('保存成功')
    } else {
      const newId = await projectApi.create(submitData as any)
      ElMessage.success('新增成功')
      // 新建保存后跳转到编辑页（含成员管理），便于继续添加成员
      router.replace(`/projects/${newId}/edit`)
    }
  } catch (error: any) {
    if (error?.message) {
      ElMessage.error(error.message)
    }
  } finally {
    submitLoading.value = false
  }
}

const goBack = () => {
  router.push('/projects')
}

const formatDateTime = (value: any): string => {
  if (!value) return '-'
  return value
}

onMounted(async () => {
  if (isEdit.value) {
    await loadProjectDetail()
    await loadMembers()
  } else {
    // 新建模式预加载用户选项
    searchManagerUser('')
  }
})
</script>

<style scoped>
.project-edit {
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

.action-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.user-id {
  font-size: 12px;
  color: #999;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.form-tip {
  font-size: 12px;
  color: #999;
  line-height: 1.4;
  margin-top: 4px;
}
</style>
