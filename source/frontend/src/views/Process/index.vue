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
        v-model:current-page="queryParams.page"
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
        ref="processFormRef"
        :model="processForm"
        :rules="processRules"
        label-width="100px"
      >
        <el-form-item label="工序名称" prop="name">
          <el-input v-model="processForm.name" placeholder="请输入工序名称" />
        </el-form-item>
        <el-form-item label="工序编号" prop="code">
          <el-input v-model="processForm.code" placeholder="请输入工序编号" />
        </el-form-item>
        <el-form-item label="所属项目" prop="projectId">
          <el-select
            v-model="processForm.projectId"
            placeholder="请选择项目"
            style="width: 100%"
            disabled
          >
            <!-- TODO: 加载项目列表 -->
            <el-option label="项目1" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序序号" prop="sortOrder">
          <el-input-number v-model="processForm.sortOrder" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="工序描述" prop="description">
          <el-input
            v-model="processForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入工序描述"
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
import { processApi, type Process } from '@/api/process'

const loading = ref(false)
const tableData = ref<Process[]>([])
const total = ref(0)

const queryParams = reactive({
  page: 1,
  pageSize: 10,
  keyword: ''
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const submitLoading = ref(false)
const processFormRef = ref<FormInstance>()
const processForm = reactive({
  id: 0,
  name: '',
  code: '',
  projectId: 0,
  projectName: '',
  description: '',
  sortOrder: 0
})

const processRules: FormRules = {
  name: [
    { required: true, message: '请输入工序名称', trigger: 'blur' }
  ]
  // projectId暂时不校验，因为项目下拉框被禁用了
}

async function handleQuery() {
  loading.value = true
  try {
    const response = await processApi.getProcessPage(queryParams)
    // 后端返回的是IPage格式：{ records, total, size, current }
    tableData.value = response.records || []
    total.value = response.total || 0
  } catch (error) {
    console.error('获取工序列表失败:', error)
  } finally {
    loading.value = false
  }
}

function handleReset() {
  queryParams.keyword = ''
  queryParams.page = 1
  handleQuery()
}

function handleCreate() {
  dialogTitle.value = '新增工序'
  isEdit.value = false
  dialogVisible.value = true
}

function handleEdit(row: Process) {
  dialogTitle.value = '编辑工序'
  isEdit.value = true
  Object.assign(processForm, row)
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!processFormRef.value) return

  try {
    await processFormRef.value.validate()
    submitLoading.value = true

    if (isEdit.value) {
      await processApi.updateProcess(processForm.id, processForm)
      ElMessage.success('更新成功')
    } else {
      await processApi.createProcess(processForm)
      ElMessage.success('创建成功')
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

function handleDialogClose() {
  processFormRef.value?.resetFields()
  Object.assign(processForm, {
    id: 0,
    name: '',
    code: '',
    projectId: 0,
    projectName: '',
    description: '',
    sortOrder: 0
  })
}

function handleDelete(row: Process) {
  ElMessageBox.confirm(`确定要删除工序"${row.name}"吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await processApi.deleteProcess(row.id)
      ElMessage.success('删除成功')
      handleQuery()
    } catch (error: any) {
      ElMessage.error(error.message || '删除失败')
    }
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
