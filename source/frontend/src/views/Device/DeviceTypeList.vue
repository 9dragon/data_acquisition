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
        <el-form-item label="所属项目">
          <el-select
            v-model="queryParams.projectId"
            placeholder="请选择项目"
            clearable
            @change="handleQuery"
          >
            <el-option
              v-for="project in deviceTypeStore.projectList"
              :key="project.id"
              :label="project.name"
              :value="project.id"
            />
          </el-select>
        </el-form-item>
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
        <el-table-column prop="code" label="设备类型编号" width="150" />
        <el-table-column prop="name" label="设备类型名称" min-width="150" />
        <el-table-column prop="projectName" label="所属项目" width="150" />
        <el-table-column prop="manufacturer" label="制造商" width="150" />
        <el-table-column prop="model" label="型号" width="150" />
        <el-table-column prop="specifications" label="规格参数" min-width="150" />
        <el-table-column prop="description" label="描述" min-width="150" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'danger'">
              {{ row.enabled ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button link type="primary" :icon="Edit" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button link type="warning" :icon="RefreshRight" @click="handleToggleEnabled(row)">
                {{ row.enabled ? '禁用' : '启用' }}
              </el-button>
              <el-popconfirm
                title="确认删除"
                confirm-button-text="确定"
                cancel-button-text="取消"
                width="200"
                @confirm="handleDelete(row)"
              >
                <template #reference>
                  <el-button link type="danger">
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
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="设备类型编号" prop="code">
          <el-input v-model="formData.code" placeholder="请输入设备类型编号" />
        </el-form-item>
        <el-form-item label="设备类型名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入设备类型名称" />
        </el-form-item>
        <el-form-item label="所属项目" prop="projectId">
          <el-select
            v-model="formData.projectId"
            placeholder="请选择项目"
          >
            <el-option
              v-for="project in deviceTypeStore.projectList"
              :key="project.id"
              :label="project.name"
              :value="project.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="制造商" prop="manufacturer">
          <el-input v-model="formData.manufacturer" placeholder="请输入制造商" />
        </el-form-item>
        <el-form-item label="型号" prop="model">
          <el-input v-model="formData.model" placeholder="请输入型号" />
        </el-form-item>
        <el-form-item label="规格参数" prop="specifications">
          <el-input
            v-model="formData.specifications"
            type="textarea"
            :rows="3"
            placeholder="请输入规格参数"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>
        <el-form-item label="状态" prop="enabled">
          <el-switch v-model="formData.enabled" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Edit, RefreshRight } from '@element-plus/icons-vue'
import { deviceTypeApi, type DeviceType } from '@/api/deviceType'
import { useDeviceTypeStore } from '@/stores/deviceType'

const deviceTypeStore = useDeviceTypeStore()

const loading = ref(false)
const tableData = ref<DeviceType[]>([])
const total = ref(0)
const dialogVisible = ref(false)
const dialogTitle = computed(() => (formData.id ? '编辑设备类型' : '新增设备类型'))
const formRef = ref<FormInstance>()

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  projectId: undefined as number | undefined,
  keyword: ''
})

const formData = reactive<Partial<DeviceType>>({
  code: '',
  name: '',
  projectId: undefined,
  manufacturer: '',
  model: '',
  specifications: '',
  description: '',
  enabled: true
})

const formRules: FormRules = {
  code: [{ required: true, message: '请输入设备类型编号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入设备类型名称', trigger: 'blur' }],
  projectId: [{ required: true, message: '请选择所属项目', trigger: 'change' }]
}

async function handleQuery() {
  loading.value = true
  try {
    const response = await deviceTypeApi.getPage(queryParams)
    tableData.value = response.records
    total.value = response.total
  } finally {
    loading.value = false
  }
}

function handleReset() {
  queryParams.projectId = undefined
  queryParams.keyword = ''
  queryParams.pageNum = 1
  handleQuery()
}

function handleCreate() {
  Object.assign(formData, {
    id: undefined,
    code: '',
    name: '',
    projectId: undefined,
    manufacturer: '',
    model: '',
    specifications: '',
    description: '',
    enabled: true
  })
  dialogVisible.value = true
}

function handleEdit(row: DeviceType) {
  Object.assign(formData, row)
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      if (formData.id) {
        await deviceTypeApi.update(formData.id, formData)
        ElMessage.success('更新成功')
      } else {
        await deviceTypeApi.create(formData as Omit<DeviceType, 'id'>)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      handleQuery()
    } catch (error) {
      console.error('提交失败:', error)
    }
  })
}

function handleDialogClose() {
  formRef.value?.resetFields()
}

async function handleToggleEnabled(row: DeviceType) {
  try {
    await deviceTypeApi.toggleEnabled(row.id!, !row.enabled)
    ElMessage.success(`${row.enabled ? '禁用' : '启用'}成功`)
    handleQuery()
  } catch (error) {
    console.error('操作失败:', error)
  }
}

function handleDelete(row: DeviceType) {
  ElMessageBox.confirm(`确定要删除设备类型"${row.name}"吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    await deviceTypeApi.delete(row.id!)
    ElMessage.success('删除成功')
    handleQuery()
  }).catch(() => {})
}

onMounted(async () => {
  await deviceTypeStore.fetchProjectList()
  handleQuery()
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
