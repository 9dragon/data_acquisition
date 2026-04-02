<template>
  <div class="workshop-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>车间管理</span>
          <el-button type="primary" @click="handleCreate">新增车间</el-button>
        </div>
      </template>

      <!-- 筛选栏 -->
      <el-form :inline="true" :model="queryParams" class="filter-bar">
        <el-form-item label="关键词">
          <el-input v-model="queryParams.keyword" placeholder="车间名称/编号" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table :data="tableData" :loading="loading" border stripe>
        <el-table-column prop="code" label="车间编号" width="150" />
        <el-table-column prop="name" label="车间名称" min-width="200" />
        <el-table-column label="所属项目" width="200">
          <template #default="{ row }">
            {{ getProjectName(row.projectId) }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="车间描述" min-width="200" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="workshopFormRef"
        :model="workshopForm"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="车间编号" prop="code">
          <el-input v-model="workshopForm.code" placeholder="请输入车间编号" />
        </el-form-item>
        <el-form-item label="车间名称" prop="name">
          <el-input v-model="workshopForm.name" placeholder="请输入车间名称" />
        </el-form-item>
        <el-form-item label="所属项目" prop="projectId">
          <el-select
            v-model="workshopForm.projectId"
            placeholder="请选择项目"
            style="width: 100%"
            clearable
            @change="handleProjectChange"
          >
            <el-option
              v-for="project in projectList"
              :key="project.id"
              :label="project.name"
              :value="project.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="车间描述">
          <el-input
            v-model="workshopForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入车间描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Edit, Delete } from '@element-plus/icons-vue'
import { http } from '@/api/request'

const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: ''
})

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const submitLoading = ref(false)
const workshopFormRef = ref<FormInstance>()

const workshopForm = reactive({
  id: 0,
  code: '',
  name: '',
  projectId: undefined as number | undefined,
  projectName: '',
  description: ''
})

// 项目列表
const projectList = ref<any[]>([])

const formRules: FormRules = {
  code: [
    { required: true, message: '请输入车间编号', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入车间名称', trigger: 'blur' }
  ],
  projectId: [
    { required: true, message: '请选择所属项目', trigger: 'change' }
  ]
}

// 获取列表数据
async function handleQuery() {
  loading.value = true
  try {
    const response = await http.get<any>('/workshops', { params: queryParams })
    tableData.value = response.records || []
    total.value = response.total || 0
  } finally {
    loading.value = false
  }
}

function handleReset() {
  queryParams.keyword = ''
  queryParams.pageNum = 1
  handleQuery()
}

// 获取项目列表
async function getProjectList() {
  try {
    const response = await http.get<any>('/projects')
    projectList.value = response.records || response || []
  } catch (error) {
    console.error('获取项目列表失败', error)
  }
}

// 项目选择变化，自动填充项目名称
function handleProjectChange(value: number) {
  const project = projectList.value.find(p => p.id === value)
  if (project) {
    workshopForm.projectName = project.name
  }
}

// 根据项目ID获取项目名称
function getProjectName(projectId: number | undefined): string {
  if (!projectId) return '-'
  const project = projectList.value.find(p => p.id === projectId)
  return project?.name || '-'
}

// 新增
function handleCreate() {
  dialogTitle.value = '新增车间'
  isEdit.value = false
  Object.assign(workshopForm, {
    id: 0,
    code: '',
    name: '',
    projectId: undefined,
    projectName: '',
    description: ''
  })
  dialogVisible.value = true
}

// 编辑
function handleEdit(row: any) {
  dialogTitle.value = '编辑车间'
  isEdit.value = true
  Object.assign(workshopForm, row)
  dialogVisible.value = true
}

// 删除
function handleDelete(row: any) {
  ElMessageBox.confirm(`确定要删除车间"${row.name}"吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await http.delete(`/workshops/${row.id}`)
      ElMessage.success('删除成功')
      handleQuery()
    } catch (error: any) {
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {})
}

// 提交表单
async function handleSubmit() {
  if (!workshopFormRef.value) return

  try {
    await workshopFormRef.value.validate()
    submitLoading.value = true

    // 自动填充项目名称
    if (workshopForm.projectId) {
      handleProjectChange(workshopForm.projectId)
    }

    if (isEdit.value) {
      await http.put(`/workshops/${workshopForm.id}`, workshopForm)
      ElMessage.success('更新成功')
    } else {
      await http.post('/workshops', workshopForm)
      ElMessage.success('新增成功')
    }

    dialogVisible.value = false
    handleQuery()
  } catch (error: any) {
    if (error?.message) {
      ElMessage.error(error.message)
    }
  } finally {
    submitLoading.value = false
  }
}

// 对话框关闭
function handleDialogClose() {
  workshopFormRef.value?.resetFields()
}

onMounted(() => {
  handleQuery()
  getProjectList()
})
</script>

<style scoped>
.workshop-list {
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
