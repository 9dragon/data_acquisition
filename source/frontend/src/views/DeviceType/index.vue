<template>
  <div class="device-type-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>设备类型管理</span>
          <el-button type="primary" @click="handleCreate">新增设备类型</el-button>
        </div>
      </template>

      <!-- 筛选栏 -->
      <el-form :inline="true" :model="queryParams" class="filter-bar">
        <el-form-item label="类型编码">
          <el-input v-model="queryParams.code" placeholder="请输入类型编码" clearable />
        </el-form-item>
        <el-form-item label="类型名称">
          <el-input v-model="queryParams.name" placeholder="请输入类型名称" clearable />
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="queryParams.keyword" placeholder="关键词" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table :data="tableData" :loading="loading" border stripe>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="code" label="类型编码" width="150" />
        <el-table-column prop="name" label="类型名称" width="200" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="projectName" label="所属项目" width="150" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
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
        ref="deviceTypeFormRef"
        :model="deviceTypeForm"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="类型编码" prop="code">
          <el-input v-model="deviceTypeForm.code" placeholder="请输入类型编码" />
        </el-form-item>
        <el-form-item label="类型名称" prop="name">
          <el-input v-model="deviceTypeForm.name" placeholder="请输入类型名称" />
        </el-form-item>
        <el-form-item label="所属项目">
          <el-select
            v-model="deviceTypeForm.projectId"
            placeholder="请选择项目"
            style="width: 100%"
            clearable
          >
            <el-option
              v-for="project in projectList"
              :key="project.id"
              :label="project.name"
              :value="project.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="deviceTypeForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
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
import { deviceTypeApi, type DeviceType } from '@/api/deviceType'
import { http } from '@/api/request'

const loading = ref(false)
const tableData = ref<DeviceType[]>([])
const total = ref(0)

const queryParams = reactive({
  page: 1,
  pageSize: 10,
  code: '',
  name: '',
  keyword: ''
})

// 项目列表
const projectList = ref<any[]>([])

const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const submitLoading = ref(false)
const deviceTypeFormRef = ref<FormInstance>()
const deviceTypeForm = reactive<DeviceType>({
  code: '',
  name: '',
  description: '',
  projectId: undefined
})

const formRules: FormRules = {
  code: [
    { required: true, message: '请输入类型编码', trigger: 'blur' },
    { pattern: /^[A-Z0-9_]{2,20}$/, message: '编码为2-20位大写字母、数字或下划线', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入类型名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度为2-50个字符', trigger: 'blur' }
  ]
}

async function handleQuery() {
  loading.value = true
  try {
    const response = await deviceTypeApi.getPage(queryParams)
    tableData.value = response.records || []
    total.value = response.total || 0
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

function handleReset() {
  queryParams.code = ''
  queryParams.name = ''
  queryParams.keyword = ''
  handleQuery()
}

// 获取项目列表
async function getProjectList() {
  try {
    const response: any = await http.get('/projects')
    projectList.value = response.records || response || []
  } catch (error) {
    console.error('获取项目列表失败', error)
  }
}

function handleCreate() {
  dialogTitle.value = '新增设备类型'
  isEdit.value = false
  Object.assign(deviceTypeForm, {
    id: '',
    code: '',
    name: '',
    description: '',
    projectId: undefined,
    category: 'Other',
    defaultCollectionMethod: 'Other'
  })
  dialogVisible.value = true
}

function handleEdit(row: DeviceType) {
  dialogTitle.value = '编辑设备类型'
  isEdit.value = true
  Object.assign(deviceTypeForm, row)
  dialogVisible.value = true
}

function handleDelete(row: DeviceType) {
  ElMessageBox.confirm('确定要删除该设备类型吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deviceTypeApi.delete(row.id!)
      ElMessage.success('删除成功')
      handleQuery()
    } catch (error: any) {
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {})
}

async function handleSubmit() {
  if (!deviceTypeFormRef.value) return

  try {
    await deviceTypeFormRef.value.validate()
    submitLoading.value = true

    if (isEdit.value) {
      await deviceTypeApi.update(deviceTypeForm.id!, deviceTypeForm)
      ElMessage.success('更新成功')
    } else {
      await deviceTypeApi.create(deviceTypeForm)
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

function handleDialogClose() {
  deviceTypeFormRef.value?.resetFields()
}

onMounted(() => {
  handleQuery()
  getProjectList()
})
</script>

<style scoped>
.device-type-list {
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
