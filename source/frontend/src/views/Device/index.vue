<template>
  <div class="device-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>设备列表</span>
          <el-button type="primary" @click="handleCreate">新增设备</el-button>
        </div>
      </template>

      <!-- 筛选栏 -->
      <el-form :inline="true" :model="queryParams" class="filter-bar">
        <el-form-item label="关键词">
          <el-input v-model="queryParams.keyword" placeholder="设备名称/编号" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table :data="tableData" :loading="loading" border stripe>
        <el-table-column prop="code" label="设备编码" width="150" />
        <el-table-column prop="name" label="设备名称" min-width="200" />
        <el-table-column prop="projectName" label="所属项目" width="150" />
        <el-table-column prop="typeName" label="设备类型" width="120" />
        <el-table-column prop="workshopName" label="所属车间" width="120" />
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
        ref="deviceFormRef"
        :model="deviceForm"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="设备编码" prop="code">
          <el-input v-model="deviceForm.code" placeholder="请输入设备编码" />
        </el-form-item>
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="deviceForm.name" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="所属项目" prop="projectId">
          <el-select
            v-model="deviceForm.projectId"
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
        <el-form-item label="设备类型">
          <el-select
            v-model="deviceForm.typeId"
            placeholder="请选择设备类型"
            style="width: 100%"
            clearable
          >
            <el-option
              v-for="type in deviceTypeList"
              :key="type.id"
              :label="type.name"
              :value="type.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属车间">
          <el-select
            v-model="deviceForm.workshopId"
            placeholder="请选择车间"
            style="width: 100%"
            clearable
          >
            <el-option
              v-for="workshop in workshopList"
              :key="workshop.id"
              :label="workshop.name"
              :value="workshop.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="设备描述">
          <el-input
            v-model="deviceForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入设备描述"
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
import { projectApi } from '@/api/project'
import { deviceTypeApi } from '@/api/deviceType'
import { workshopApi } from '@/api/workshop'

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
const deviceFormRef = ref<FormInstance>()

const deviceForm = reactive({
  id: 0,
  code: '',
  name: '',
  projectId: undefined as number | undefined,
  projectName: '',
  typeId: undefined as number | undefined,
  typeName: '',
  workshopId: undefined as number | undefined,
  workshopName: '',
  description: ''
})

// 下拉选项数据
const projectList = ref<any[]>([])
const deviceTypeList = ref<any[]>([])
const workshopList = ref<any[]>([])

const formRules: FormRules = {
  code: [
    { required: true, message: '请输入设备编码', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入设备名称', trigger: 'blur' }
  ],
  projectId: [
    { required: true, message: '请选择所属项目', trigger: 'change' }
  ]
}

// 获取列表数据
async function handleQuery() {
  loading.value = true
  try {
    const response = await http.get<any>('/devices', { params: queryParams })
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
    projectList.value = await projectApi.getOptions()
  } catch (error) {
    console.error('获取项目列表失败', error)
  }
}

// 获取设备类型列表
async function getDeviceTypeList() {
  try {
    deviceTypeList.value = await deviceTypeApi.getOptions()
  } catch (error) {
    console.error('获取设备类型列表失败', error)
  }
}

// 获取车间列表
async function getWorkshopList() {
  try {
    workshopList.value = await workshopApi.getOptions()
  } catch (error) {
    console.error('获取车间列表失败', error)
  }
}

// 项目选择变化，自动填充项目名称
function handleProjectChange(value: number) {
  const project = projectList.value.find(p => p.id === value)
  if (project) {
    deviceForm.projectName = project.name
  }
}

// 新增
function handleCreate() {
  dialogTitle.value = '新增设备'
  isEdit.value = false
  Object.assign(deviceForm, {
    id: 0,
    code: '',
    name: '',
    projectId: undefined,
    projectName: '',
    typeId: undefined,
    typeName: '',
    workshopId: undefined,
    workshopName: '',
    description: ''
  })
  dialogVisible.value = true
}

// 编辑
function handleEdit(row: any) {
  dialogTitle.value = '编辑设备'
  isEdit.value = true
  Object.assign(deviceForm, row)
  dialogVisible.value = true
}

// 删除
function handleDelete(row: any) {
  ElMessageBox.confirm(`确定要删除设备"${row.name}"吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await http.delete(`/devices/${row.id}`)
      ElMessage.success('删除成功')
      handleQuery()
    } catch (error: any) {
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {})
}

// 提交表单
async function handleSubmit() {
  if (!deviceFormRef.value) return

  try {
    await deviceFormRef.value.validate()
    submitLoading.value = true

    // 自动填充名称
    if (deviceForm.projectId) {
      const project = projectList.value.find(p => p.id === deviceForm.projectId)
      deviceForm.projectName = project?.name || ''
    }
    if (deviceForm.typeId) {
      const type = deviceTypeList.value.find(t => t.id === deviceForm.typeId)
      deviceForm.typeName = type?.name || ''
    }
    if (deviceForm.workshopId) {
      const workshop = workshopList.value.find(w => w.id === deviceForm.workshopId)
      deviceForm.workshopName = workshop?.name || ''
    }

    if (isEdit.value) {
      await http.put(`/devices/${deviceForm.id}`, deviceForm)
      ElMessage.success('更新成功')
    } else {
      await http.post('/devices', deviceForm)
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
  deviceFormRef.value?.resetFields()
}

onMounted(() => {
  handleQuery()
  getProjectList()
  getDeviceTypeList()
  getWorkshopList()
})
</script>

<style scoped>
.device-list {
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
