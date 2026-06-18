<template>
  <div class="project-edit" v-loading="loading">
    <el-page-header @back="handleBack" class="page-header">
      <template #content>
        <span class="header-title">{{ isEdit ? '编辑项目' : '新增项目' }}</span>
        <el-tag v-if="hasPendingChanges" type="warning" size="small" class="dirty-tag">
          有未保存改动
        </el-tag>
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
            @change="handleManagerChange"
          >
            <el-option
              v-for="u in managerUserOptions"
              :key="u.id"
              :label="u.name"
              :value="u.id as number"
            />
          </el-select>
          <div class="form-tip">项目负责人即项目经理，与下方"项目成员"中的项目经理保持同步</div>
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
      </el-form>
    </el-card>

    <!-- 项目成员卡片（仅编辑模式显示） -->
    <el-card v-if="isEdit" class="members-card" shadow="never">
      <template #header>
        <div class="card-title">
          <span>项目成员</span>
          <el-tag type="info" size="small">共 {{ visibleMembers.length }} 人</el-tag>
          <el-tag v-if="pendingSummary" type="warning" size="small">{{ pendingSummary }}</el-tag>
        </div>
      </template>

      <el-alert
        type="info"
        :closable="false"
        show-icon
        class="member-tip"
      >
        <template #title>
          成员的添加 / 移除 / 角色调整将先暂存在本地，点击页面底部"保存所有改动"后统一生效。
        </template>
      </el-alert>

      <div class="action-bar">
        <el-button type="primary" :icon="Plus" @click="openAddDialog">
          添加成员
        </el-button>
        <el-button :icon="Refresh" @click="handleDiscardPending">放弃暂存改动</el-button>
      </div>

      <el-table :data="visibleMembers" :loading="memberLoading" border stripe size="small">
        <el-table-column label="姓名" prop="userName" width="180">
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
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag
              v-if="row._status === 'added'"
              type="success"
              size="small"
            >新增</el-tag>
            <el-tag
              v-else-if="row._status === 'role-modified'"
              type="warning"
              size="small"
            >已修改</el-tag>
            <el-tag
              v-else
              type="info"
              size="small"
            >未变更</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                v-if="row.role !== 'MANAGER'"
                link
                type="primary"
                :icon="ArrowUp"
                @click="handleSetManager(row)"
              >设为经理</el-button>
              <el-button
                v-else
                link
                type="primary"
                :icon="ArrowDown"
                @click="handleSetMember(row)"
              >设为成员</el-button>
              <el-popconfirm
                title="确认移除该成员？"
                confirm-button-text="确定"
                cancel-button-text="取消"
                width="200"
                @confirm="handleRemoveMember(row)"
              >
                <template #reference>
                  <el-button link type="danger" :icon="Delete">移除</el-button>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!memberLoading && visibleMembers.length === 0" description="暂无成员" />
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
          <div class="form-tip">已存在成员（含已暂存新增）将被自动跳过</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddMembers">添加</el-button>
      </template>
    </el-dialog>

    <!-- 底部统一操作栏 -->
    <div class="footer-bar">
      <el-button @click="handleBack">取消</el-button>
      <el-button
        type="primary"
        :loading="submitLoading"
        :disabled="!hasPendingChanges && !isBasicInfoDirty"
        @click="handleSubmitAll"
      >
        {{ isEdit ? '保存所有改动' : '保存' }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Refresh, Delete, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { projectApi, projectMemberApi, type ProjectMember } from '@/api/project'
import { userApi, type Option } from '@/api/user'

type MemberRole = 'MANAGER' | 'MEMBER'
type MemberRowStatus = 'original' | 'added' | 'role-modified'

interface PendingMember extends ProjectMember {
  _status: MemberRowStatus
  _originalRole: MemberRole
}

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

// 基本信息原始快照，用于判断是否被修改
const originalBasicSnapshot = ref('')

const buildBasicSnapshot = () => JSON.stringify({
  name: projectForm.name,
  code: projectForm.code,
  description: projectForm.description || '',
  managerUserId: projectForm.managerUserId ?? null,
  priority: projectForm.priority,
  status: projectForm.status,
  startDate: projectForm.startDate || '',
  plannedEndDate: projectForm.plannedEndDate || ''
})

const isBasicInfoDirty = computed(() => buildBasicSnapshot() !== originalBasicSnapshot.value)

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
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入项目编号', trigger: 'blur' }],
  managerUserId: [{ required: true, message: '请选择项目负责人', trigger: 'change' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }]
}

// ============= 成员管理（暂存模式） =============
const memberLoading = ref(false)
const members = ref<PendingMember[]>([])

// 被标记为移除的成员（不在 members 列表中显示，但保存时需要提交）
const removedMembers = ref<PendingMember[]>([])

const visibleMembers = computed(() => members.value)

const pendingAdds = computed(() => members.value.filter(m => m._status === 'added'))
const pendingRoleUpdates = computed(() =>
  members.value.filter(m => m._status === 'role-modified')
)

const pendingSummary = computed(() => {
  const addCount = pendingAdds.value.length
  const removeCount = removedMembers.value.length
  const roleCount = pendingRoleUpdates.value.length
  const parts: string[] = []
  if (addCount) parts.push(`新增 ${addCount}`)
  if (removeCount) parts.push(`移除 ${removeCount}`)
  if (roleCount) parts.push(`角色变更 ${roleCount}`)
  return parts.length ? `待保存：${parts.join('、')}` : ''
})

const hasMemberPending = computed(
  () => pendingAdds.value.length > 0 ||
         removedMembers.value.length > 0 ||
         pendingRoleUpdates.value.length > 0
)

const hasPendingChanges = computed(() => isEdit.value && hasMemberPending.value)

const toPending = (m: ProjectMember, status: MemberRowStatus = 'original'): PendingMember => ({
  ...m,
  _status: status,
  _originalRole: (m.role || 'MEMBER') as MemberRole
})

const loadMembers = async () => {
  if (!projectId.value) return
  memberLoading.value = true
  try {
    const list = await projectMemberApi.list(projectId.value)
    members.value = list.map(m => toPending(m, 'original'))
    removedMembers.value = []
  } catch (e: any) {
    ElMessage.error(e?.message || '加载成员失败')
  } finally {
    memberLoading.value = false
  }
}

// 把指定 userId 设为经理：原经理降为成员，目标升为经理，并同步基本信息
const applySetManager = (userId: number, userName?: string) => {
  // 新增成员的角色变更不会单独提交（add 接口已带角色），无需 'role-modified' 标记
  const syncRowStatus = (row: PendingMember) => {
    if (row._status === 'added') return
    row._status = row.role === row._originalRole ? 'original' : 'role-modified'
  }

  const currentManager = members.value.find(m => m.role === 'MANAGER')
  if (currentManager && currentManager.userId !== userId) {
    currentManager.role = 'MEMBER'
    syncRowStatus(currentManager)
  }

  let target = members.value.find(m => m.userId === userId)
  if (!target) {
    // 不在成员列表中：作为新成员加入（由基本信息变更触发时使用）
    target = toPending({
      userId,
      userName: userName || `用户${userId}`,
      role: 'MANAGER'
    } as ProjectMember, 'added')
    target.role = 'MANAGER'
    members.value.push(target)
  } else {
    target.role = 'MANAGER'
    syncRowStatus(target)
  }

  // 同步基本信息
  projectForm.managerUserId = userId
  ensureManagerOption(userId, userName)
}

const ensureManagerOption = (userId: number, userName?: string) => {
  if (!userId) return
  const exists = managerUserOptions.value.find(u => Number(u.id) === Number(userId))
  if (!exists) {
    managerUserOptions.value.unshift({
      id: userId,
      name: userName || `用户${userId}`
    })
  }
}

// 基本信息里"项目负责人"被切换
const handleManagerChange = (newId: number | undefined) => {
  if (!newId) return
  const target = members.value.find(m => m.userId === newId)
  const opt = managerUserOptions.value.find(u => Number(u.id) === Number(newId))
  if (!target) {
    // 新负责人不在成员列表，自动加入并设为经理
    applySetManager(newId, opt?.name)
    ElMessage.success(`已将 "${opt?.name || newId}" 加入成员并设为项目经理`)
  } else {
    applySetManager(newId, target.userName || opt?.name)
  }
}

// 成员列表里点"设为经理"
const handleSetManager = (row: PendingMember) => {
  applySetManager(row.userId, row.userName)
}

// 成员列表里点"设为成员"
const handleSetMember = (row: PendingMember) => {
  row.role = 'MEMBER'
  if (row._status !== 'added') {
    row._status = row.role === row._originalRole ? 'original' : 'role-modified'
  }
  // 如果该用户原本是基本信息里的负责人，清空并提示
  if (projectForm.managerUserId === row.userId) {
    projectForm.managerUserId = undefined
    ElMessage.warning('项目经理已被设为普通成员，请在基本信息中重新选择项目负责人')
  }
}

// 添加成员对话框
const addDialogVisible = ref(false)
const userSearchLoading = ref(false)
const userOptions = ref<Option[]>([])
const addForm = reactive<{ userIds: number[]; role: MemberRole }>({
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

const handleAddMembers = () => {
  if (addForm.userIds.length === 0) {
    ElMessage.warning('请至少选择一个用户')
    return
  }
  const existingIds = new Set(members.value.map(m => m.userId))
  const freshIds = addForm.userIds.filter(id => !existingIds.has(id))
  if (freshIds.length === 0) {
    ElMessage.warning('所选用户均已存在')
    return
  }

  if (addForm.role === 'MANAGER') {
    freshIds.forEach(id => {
      const opt = userOptions.value.find(u => Number(u.id) === Number(id))
      applySetManager(id, opt?.name)
    })
  } else {
    freshIds.forEach(id => {
      const opt = userOptions.value.find(u => Number(u.id) === Number(id))
      members.value.push(toPending({
        userId: id,
        userName: opt?.name,
        role: 'MEMBER'
      } as ProjectMember, 'added'))
    })
  }

  ElMessage.success(`已暂存 ${freshIds.length} 人，点击底部"保存所有改动"后生效`)
  addDialogVisible.value = false
}

const handleRemoveMember = (row: PendingMember) => {
  const idx = members.value.findIndex(m => m.userId === row.userId)
  if (idx < 0) return

  const target = members.value[idx]
  if (target._status === 'added') {
    // 新增的成员：直接从列表移除，无需后端处理
    members.value.splice(idx, 1)
  } else {
    // 原始成员：移入 removedMembers 待保存时提交
    members.value.splice(idx, 1)
    removedMembers.value.push(target)
  }

  // 如果移除的是当前经理，清空基本信息里的负责人
  if (projectForm.managerUserId === row.userId) {
    projectForm.managerUserId = undefined
    ElMessage.warning('项目经理已被移除，请在基本信息中重新选择项目负责人')
  }
}

// 放弃暂存改动（基本信息 + 成员）
const handleDiscardPending = async () => {
  try {
    await ElMessageBox.confirm(
      '确定放弃所有未保存的改动（含基本信息和成员）吗？',
      '提示',
      { type: 'warning', confirmButtonText: '放弃', cancelButtonText: '取消' }
    )
  } catch {
    return
  }
  await loadProjectDetail()
  await loadMembers()
  ElMessage.success('已恢复到服务器状态')
}

// ============= 加载项目详情 =============
const loadProjectDetail = async () => {
  if (!projectId.value) return
  loading.value = true
  try {
    const detail = await projectApi.getById(projectId.value)
    await searchManagerUser('')
    if (detail.managerUserId) {
      ensureManagerOption(detail.managerUserId, detail.managerName)
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
    originalBasicSnapshot.value = buildBasicSnapshot()
  } catch (e: any) {
    ElMessage.error(e?.message || '加载项目失败')
  } finally {
    loading.value = false
  }
}

// ============= 统一保存 =============
const handleSubmitAll = async () => {
  if (!projectFormRef.value) return
  try {
    await projectFormRef.value.validate()
  } catch {
    return
  }

  // 经理被清空的情况
  if (!projectForm.managerUserId) {
    ElMessage.error('请选择项目负责人')
    return
  }

  submitLoading.value = true
  try {
    const submitData = {
      ...projectForm,
      startDate: projectForm.startDate || null,
      endDate: (projectForm as any).endDate || null,
      plannedEndDate: projectForm.plannedEndDate || null
    }

    // 新建项目：先创建项目（同时通过 managerUserId 设置首任经理）
    if (!isEdit.value) {
      const newId = await projectApi.create(submitData as any)
      ElMessage.success('新增成功')
      router.replace(`/projects/${newId}/edit`)
      return
    }

    if (!projectId.value) return
    const pid = projectId.value

    // 1. 移除成员（按顺序）
    for (const m of removedMembers.value) {
      await projectMemberApi.remove(pid, m.userId)
    }

    // 2. 添加成员（仅 MEMBER，MANAGER 通过基本信息同步）
    const memberAdds = pendingAdds.value
      .filter(m => m.role === 'MEMBER')
      .map(m => m.userId)
    if (memberAdds.length) {
      await projectMemberApi.add(pid, memberAdds, 'MEMBER')
    }

    // 3. 角色更新（仅 'role-modified'，且不包含 MANAGER 同步带来的角色变更）
    for (const m of pendingRoleUpdates.value) {
      await projectMemberApi.updateRole(pid, m.userId, m.role)
    }

    // 4. 更新基本信息（managerUserId 由后端处理经理同步）
    await projectApi.update(pid, submitData)

    ElMessage.success('保存成功')
    // 重新加载，清空 pending
    await Promise.all([loadProjectDetail(), loadMembers()])
  } catch (error: any) {
    if (error?.message) {
      ElMessage.error(error.message)
    }
    // 保存过程中部分失败：重新加载以同步实际状态
    if (isEdit.value && projectId.value) {
      await Promise.all([loadProjectDetail(), loadMembers()])
    }
  } finally {
    submitLoading.value = false
  }
}

// ============= 离开提示 =============
const goBack = () => router.push('/projects')

const checkUnsavedBeforeLeave = async (): Promise<boolean> => {
  if (!isEdit.value) {
    if (isBasicInfoDirty.value) {
      try {
        await ElMessageBox.confirm('有未保存的改动，确定离开？', '提示', {
          type: 'warning',
          confirmButtonText: '离开',
          cancelButtonText: '继续编辑'
        })
      } catch {
        return false
      }
    }
    return true
  }

  if (hasPendingChanges.value || isBasicInfoDirty.value) {
    try {
      await ElMessageBox.confirm('有未保存的改动，确定离开？', '提示', {
        type: 'warning',
        confirmButtonText: '离开',
        cancelButtonText: '继续编辑'
      })
    } catch {
      return false
    }
  }
  return true
}

const handleBack = async () => {
  const ok = await checkUnsavedBeforeLeave()
  if (ok) goBack()
}

onBeforeRouteLeave(async () => {
  return await checkUnsavedBeforeLeave()
})

const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
  if (hasPendingChanges.value || isBasicInfoDirty.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}

onMounted(async () => {
  window.addEventListener('beforeunload', beforeUnloadHandler)
  if (isEdit.value) {
    await loadProjectDetail()
    await loadMembers()
  } else {
    await searchManagerUser('')
    originalBasicSnapshot.value = buildBasicSnapshot()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', beforeUnloadHandler)
})

const formatDateTime = (value: any): string => {
  if (!value) return '-'
  return value
}
</script>

<style scoped>
.project-edit {
  padding: 8px 8px 72px;
}

.page-header {
  margin-bottom: 16px;
}

.header-title {
  font-size: 16px;
  font-weight: bold;
}

.dirty-tag {
  margin-left: 8px;
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

.member-tip {
  margin-bottom: 12px;
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

.footer-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  border-top: 1px solid #ebeef5;
  padding: 12px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  z-index: 100;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
}
</style>
