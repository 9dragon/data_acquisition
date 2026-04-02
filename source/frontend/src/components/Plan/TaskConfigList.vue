<template>
  <div class="task-config-list">
    <div class="task-header">
      <span class="task-title">任务配置</span>
      <div class="task-actions">
        <el-button size="small" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加任务
        </el-button>
        <el-button size="small" @click="handleEnableAll">
          全部启用
        </el-button>
        <el-button size="small" @click="handleDisableAll">
          全部禁用
        </el-button>
      </div>
    </div>

    <div v-if="!tasks || tasks.length === 0" class="empty-tasks">
      暂无任务，请点击上方按钮添加
    </div>

    <div v-else class="task-list">
      <div
        v-for="(task, index) in tasks"
        :key="task.key || index"
        class="task-item"
      >
        <div class="task-item-main">
          <el-checkbox
            :model-value="task.enabled"
            @update:model-value="handleToggleEnable(index)"
          />
          <span
            class="task-name"
            :class="{ disabled: !task.enabled }"
          >
            {{ task.name }}
          </span>
          <span v-if="task.startDate && task.endDate" class="task-date">
            {{ task.startDate }} ~ {{ task.endDate }}
          </span>
          <span v-if="task.managerId" class="task-manager">
            负责人: {{ getUserName(task.managerId) }}
          </span>
        </div>
        <div class="task-item-actions">
          <el-button
            link
            type="primary"
            size="small"
            @click="handleEdit(index)"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            size="small"
            @click="handleDelete(index)"
          >
            删除
          </el-button>
        </div>
      </div>
    </div>

    <!-- 任务编辑对话框 -->
    <TaskEditDialog
      v-model="editDialogVisible"
      :task="editingTask"
      :users="users"
      :stage-date-range="stageDateRange"
      :stage-manager-id="stageManagerId"
      @confirm="handleEditConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import type { StageTaskConfig } from '@/types/plan'
import TaskEditDialog from './TaskEditDialog.vue'

interface Props {
  tasks: StageTaskConfig[]
  stageDateRange?: string[]      // 阶段日期范围
  stageManagerId?: number        // 阶段负责人ID
  users?: any[]                  // 用户列表
}

interface Emits {
  'update:tasks': [tasks: StageTaskConfig[]]
  'add': []
  'edit': [index: number]
  'delete': [index: number]
  'enable-all': []
  'disable-all': []
}

const props = withDefaults(defineProps<Props>(), {
  stageDateRange: () => [],
  users: () => []
})

// 根据ID获取用户名称
function getUserName(userId?: number): string {
  if (!userId) return ''
  const user = props.users.find(u => u.id === userId)
  return user?.name || ''
}
const emit = defineEmits<Emits>()

const editDialogVisible = ref(false)
const editingTask = ref<StageTaskConfig | null>(null)
const editingIndex = ref(-1)

function handleAdd() {
  editingTask.value = {
    key: `task_${Date.now()}`,
    name: '',
    description: '',
    enabled: true,
    startDate: props.stageDateRange?.[0],
    endDate: props.stageDateRange?.[1],
    managerId: props.stageManagerId
  }
  editingIndex.value = -1
  editDialogVisible.value = true
}

function handleEdit(index: number) {
  editingTask.value = { ...props.tasks[index] }
  editingIndex.value = index
  editDialogVisible.value = true
}

function handleEditConfirm(task: StageTaskConfig) {
  const newTasks = [...props.tasks]
  if (editingIndex.value === -1) {
    // 新增
    newTasks.push(task)
  } else {
    // 编辑
    newTasks[editingIndex.value] = task
  }
  emit('update:tasks', newTasks)
  editDialogVisible.value = false
}

function handleDelete(index: number) {
  const newTasks = [...props.tasks]
  newTasks.splice(index, 1)
  emit('update:tasks', newTasks)
}

function handleToggleEnable(index: number) {
  const newTasks = [...props.tasks]
  newTasks[index].enabled = !newTasks[index].enabled
  emit('update:tasks', newTasks)
}

function handleEnableAll() {
  const newTasks = props.tasks.map(t => ({ ...t, enabled: true }))
  emit('update:tasks', newTasks)
}

function handleDisableAll() {
  const newTasks = props.tasks.map(t => ({ ...t, enabled: false }))
  emit('update:tasks', newTasks)
}
</script>

<style scoped>
.task-config-list {
  margin-top: 12px;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.task-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.task-actions {
  display: flex;
  gap: 8px;
}

.empty-tasks {
  padding: 24px;
  text-align: center;
  color: #999;
  background: #fafafa;
  border-radius: 4px;
  font-size: 14px;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
}

.task-item-main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.task-name {
  font-size: 14px;
  color: #303133;
  min-width: 150px;
}

.task-name.disabled {
  color: #c0c4cc;
}

.task-date {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

.task-manager {
  font-size: 12px;
  color: #409EFF;
  margin-left: 8px;
}

.task-item-actions {
  display: flex;
  gap: 4px;
}
</style>
