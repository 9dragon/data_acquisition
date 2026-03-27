<template>
  <div class="stage-list-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>项目阶段管理</span>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新增阶段
          </el-button>
        </div>
      </template>

      <!-- 阶段列表 -->
      <el-table
        v-loading="loading"
        :data="stageList"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="key" label="阶段标识" width="150" />
        <el-table-column prop="name" label="阶段名称" width="150" />
        <el-table-column prop="description" label="阶段描述" show-overflow-tooltip />
        <el-table-column prop="progressMode" label="推进方式" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.progressMode === 'by_task'" type="primary">按任务</el-tag>
            <el-tag v-else type="success">按设备</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="defaultWeight" label="权重" width="80" />
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column prop="isSystem" label="系统预置" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.isSystem === 1" type="danger">是</el-tag>
            <el-tag v-else type="info">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="任务模板" width="100">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              @click="handleManageTasks(row)"
            >
              {{ row.taskTemplates?.length || 0 }} 个
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">查看</el-button>
            <el-button
              size="small"
              type="primary"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
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
    </el-card>

    <!-- 新增/编辑阶段对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      @close="handleDialogClose"
    >
      <el-form
        ref="stageFormRef"
        :model="stageForm"
        :rules="stageRules"
        label-width="120px"
      >
        <el-form-item label="阶段标识" prop="key">
          <el-input
            v-model="stageForm.key"
            placeholder="请输入阶段标识，如：preparation"
            :disabled="!isEdit || (isEdit && stageForm.isSystem === 1)"
          />
        </el-form-item>
        <el-form-item label="阶段名称" prop="name">
          <el-input v-model="stageForm.name" placeholder="请输入阶段名称" :disabled="!isEdit" />
        </el-form-item>
        <el-form-item label="阶段描述" prop="description">
          <el-input
            v-model="stageForm.description"
            type="textarea"
            :rows="2"
            placeholder="请输入阶段描述"
            :disabled="!isEdit"
          />
        </el-form-item>
        <el-form-item label="推进方式" prop="progressMode">
          <el-radio-group v-model="stageForm.progressMode" :disabled="!isEdit">
            <el-radio label="by_task">按任务推进</el-radio>
            <el-radio label="by_device">按设备推进</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="默认权重" prop="defaultWeight">
          <el-input-number
            v-model="stageForm.defaultWeight"
            :min="0"
            :max="100"
            :disabled="!isEdit"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="排序序号" prop="sortOrder">
          <el-input-number
            v-model="stageForm.sortOrder"
            :min="0"
            :disabled="!isEdit"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="stageForm.icon" placeholder="如：Search, Setup, Build" :disabled="!isEdit" />
        </el-form-item>
        <el-form-item label="颜色" prop="color">
          <el-input v-model="stageForm.color" placeholder="如：#1890ff, #52c41a" :disabled="!isEdit" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">{{ isEdit ? '取消' : '关闭' }}</el-button>
        <el-button v-if="isEdit" type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 任务模板管理对话框 -->
    <el-dialog
      v-model="taskDialogVisible"
      title="任务模板管理"
      width="900px"
      @close="handleTaskDialogClose"
    >
      <div class="task-management">
        <div class="task-list">
          <div class="task-header">
            <span>任务模板列表</span>
            <el-button size="small" type="primary" @click="handleAddTask">
              <el-icon><Plus /></el-icon>
              添加任务
            </el-button>
          </div>
          <el-table :data="currentStage?.taskTemplates || []" border>
            <el-table-column prop="key" label="任务标识" width="150" />
            <el-table-column prop="name" label="任务名称" width="150" />
            <el-table-column prop="description" label="描述" show-overflow-tooltip />
            <el-table-column prop="defaultWeight" label="权重" width="80" />
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button
                  size="small"
                  link
                  type="primary"
                  @click="handleEditTask(row)"
                >
                  编辑
                </el-button>
                <el-button
                  size="small"
                  link
                  type="danger"
                  @click="handleDeleteTask(row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>

    <!-- 任务模板编辑对话框 -->
    <el-dialog
      v-model="taskFormDialogVisible"
      :title="taskFormTitle"
      width="600px"
      @close="handleTaskFormClose"
    >
      <el-form
        ref="taskFormRef"
        :model="taskForm"
        :rules="taskRules"
        label-width="120px"
      >
        <el-form-item label="任务标识" prop="key">
          <el-input v-model="taskForm.key" placeholder="如：site_survey" />
        </el-form-item>
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="taskForm.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="任务描述" prop="description">
          <el-input
            v-model="taskForm.description"
            type="textarea"
            :rows="2"
            placeholder="请输入任务描述"
          />
        </el-form-item>
        <el-form-item label="默认权重" prop="defaultWeight">
          <el-input-number
            v-model="taskForm.defaultWeight"
            :min="0"
            :max="100"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="taskFormDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="taskSubmitLoading" @click="handleTaskSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { stageApi, type Stage, type TaskTemplate } from '@/api/stage'

const loading = ref(false)
const stageList = ref<Stage[]>([])

const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const submitLoading = ref(false)
const stageFormRef = ref<FormInstance>()
const stageForm = reactive({
  id: 0,
  key: '',
  name: '',
  description: '',
  icon: '',
  color: '',
  progressMode: 'by_device' as 'by_task' | 'by_device',
  isSystem: 0,
  defaultWeight: 0,
  sortOrder: 0,
  taskTemplates: []
})

const stageRules: FormRules = {
  key: [
    { required: true, message: '请输入阶段标识', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在2到50个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入阶段名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在2到50个字符', trigger: 'blur' }
  ],
  progressMode: [
    { required: true, message: '请选择推进方式', trigger: 'change' }
  ]
}

const taskDialogVisible = ref(false)
const currentStage = ref<Stage | null>(null)

const taskFormDialogVisible = ref(false)
const taskFormTitle = ref('')
const isTaskEdit = ref(false)
const taskSubmitLoading = ref(false)
const taskFormRef = ref<FormInstance>()
const taskForm = reactive<TaskTemplate>({
  id: '',
  key: '',
  name: '',
  description: '',
  defaultWeight: 10
})

const taskRules: FormRules = {
  key: [
    { required: true, message: '请输入任务标识', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入任务名称', trigger: 'blur' }
  ]
}

// 获取阶段列表
const getStageList = async () => {
  loading.value = true
  try {
    stageList.value = await stageApi.getAllStages()
  } catch (error) {
    console.error('获取阶段列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 新增
const handleCreate = () => {
  dialogTitle.value = '新增阶段'
  isEdit.value = false
  dialogVisible.value = true
}

// 查看
const handleView = (row: Stage) => {
  dialogTitle.value = '查看阶段'
  isEdit.value = false
  Object.assign(stageForm, row)
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: Stage) => {
  dialogTitle.value = '编辑阶段'
  isEdit.value = true
  Object.assign(stageForm, row)
  dialogVisible.value = true
}

// 删除
const handleDelete = (row: Stage) => {
  ElMessageBox.confirm(`确定要删除阶段"${row.name}"吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await stageApi.deleteStage(row.id)
      ElMessage.success('删除成功')
      getStageList()
    } catch (error: any) {
      ElMessage.error(error.message || '删除失败')
    }
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!stageFormRef.value) return

  try {
    await stageFormRef.value.validate()
    submitLoading.value = true

    if (isEdit.value) {
      await stageApi.updateStage(stageForm.id, stageForm)
      ElMessage.success('更新成功')
    } else {
      await stageApi.createStage(stageForm)
      ElMessage.success('创建成功')
    }

    dialogVisible.value = false
    getStageList()
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
  stageFormRef.value?.resetFields()
  Object.assign(stageForm, {
    id: 0,
    key: '',
    name: '',
    description: '',
    icon: '',
    color: '',
    progressMode: 'by_device',
    isSystem: 0,
    defaultWeight: 0,
    sortOrder: 0,
    taskTemplates: []
  })
}

// 管理任务模板
const handleManageTasks = (row: Stage) => {
  currentStage.value = row
  taskDialogVisible.value = true
}

// 添加任务
const handleAddTask = () => {
  taskFormTitle.value = '添加任务模板'
  isTaskEdit.value = false
  Object.assign(taskForm, {
    id: '',
    key: '',
    name: '',
    description: '',
    defaultWeight: 10
  })
  taskFormDialogVisible.value = true
}

// 编辑任务
const handleEditTask = (row: TaskTemplate) => {
  taskFormTitle.value = '编辑任务模板'
  isTaskEdit.value = true
  Object.assign(taskForm, row)
  taskFormDialogVisible.value = true
}

// 删除任务
const handleDeleteTask = (row: TaskTemplate) => {
  if (!currentStage.value) return

  ElMessageBox.confirm(`确定要删除任务模板"${row.name}"吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await stageApi.deleteTaskTemplate(currentStage.value!.id, row.id)
      ElMessage.success('删除成功')
      // 重新加载阶段列表
      await getStageList()
      // 更新当前阶段
      currentStage.value = stageList.value.find(s => s.id === currentStage.value!.id) || null
    } catch (error: any) {
      ElMessage.error(error.message || '删除失败')
    }
  })
}

// 提交任务表单
const handleTaskSubmit = async () => {
  if (!taskFormRef.value || !currentStage.value) return

  try {
    await taskFormRef.value.validate()
    taskSubmitLoading.value = true

    if (isTaskEdit.value) {
      await stageApi.updateTaskTemplate(currentStage.value.id, taskForm.id, taskForm)
      ElMessage.success('更新成功')
    } else {
      await stageApi.addTaskTemplate(currentStage.value.id, taskForm)
      ElMessage.success('添加成功')
    }

    taskFormDialogVisible.value = false
    await getStageList()
    currentStage.value = stageList.value.find(s => s.id === currentStage.value!.id) || null
  } catch (error: any) {
    if (error?.message) {
      ElMessage.error(error.message)
    }
  } finally {
    taskSubmitLoading.value = false
  }
}

// 任务对话框关闭
const handleTaskDialogClose = () => {
  currentStage.value = null
}

// 任务表单关闭
const handleTaskFormClose = () => {
  taskFormRef.value?.resetFields()
}

onMounted(() => {
  getStageList()
})
</script>

<style scoped>
.stage-list-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-management {
  padding: 10px 0;
}

.task-list {
  margin-top: 10px;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-weight: bold;
  font-size: 14px;
}
</style>
