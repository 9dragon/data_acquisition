<template>
  <div class="device-type-container">
    <!-- 查询表单 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="类型编码">
          <el-input v-model="queryParams.code" placeholder="请输入类型编码" clearable />
        </el-form-item>
        <el-form-item label="类型名称">
          <el-input v-model="queryParams.name" placeholder="请输入类型名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮 -->
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增设备类型
      </el-button>
    </div>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="code" label="类型编码" width="150" />
        <el-table-column prop="name" label="类型名称" width="200" />
        <el-table-column prop="category" label="设备分类" width="150">
          <template #default="{ row }">
            <el-tag v-if="row.category === 'production'" type="primary">生产设备</el-tag>
            <el-tag v-else-if="row.category === 'detection'" type="success">检测设备</el-tag>
            <el-tag v-else-if="row.category === 'auxiliary'" type="info">辅助设备</el-tag>
            <el-tag v-else type="warning">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              active-value="enabled"
              inactive-value="disabled"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleQuery"
          @current-change="handleQuery"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="类型编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入类型编码" />
        </el-form-item>
        <el-form-item label="类型名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入类型名称" />
        </el-form-item>
        <el-form-item label="设备分类" prop="category">
          <el-select v-model="formData.category" placeholder="请选择设备分类">
            <el-option label="生产设备" value="production" />
            <el-option label="检测设备" value="detection" />
            <el-option label="辅助设备" value="auxiliary" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio label="enabled">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import request from '@/api/request'

interface DeviceType {
  id?: number
  code: string
  name: string
  category: string
  description?: string
  status: string
  createdAt?: string
  updatedAt?: string
}

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  code: '',
  name: '',
  status: ''
})

// 表格数据
const tableData = ref<DeviceType[]>([])
const loading = ref(false)
const total = ref(0)

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()
const formData = reactive<DeviceType>({
  code: '',
  name: '',
  category: '',
  description: '',
  status: 'enabled'
})

// 表单验证规则
const formRules = {
  code: [
    { required: true, message: '请输入类型编码', trigger: 'blur' },
    { pattern: /^[A-Z0-9_]{2,20}$/, message: '编码为2-20位大写字母、数字或下划线', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入类型名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度为2-50个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择设备分类', trigger: 'change' }
  ]
}

// 获取列表数据
const getList = async () => {
  try {
    loading.value = true
    const response = await request.get('/api/device-types', { params: queryParams })
    tableData.value = response.data.list || []
    total.value = response.data.total || 0
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 查询
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 重置
const handleReset = () => {
  queryParams.code = ''
  queryParams.name = ''
  queryParams.status = ''
  handleQuery()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增设备类型'
  Object.assign(formData, {
    code: '',
    name: '',
    category: '',
    description: '',
    status: 'enabled'
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: DeviceType) => {
  dialogTitle.value = '编辑设备类型'
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 删除
const handleDelete = (row: DeviceType) => {
  ElMessageBox.confirm('确定要删除该设备类型吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await request.delete(`/api/device-types/${row.id}`)
      ElMessage.success('删除成功')
      getList()
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '删除失败')
    }
  })
}

// 状态切换
const handleStatusChange = async (row: DeviceType) => {
  try {
    await request.put(`/api/device-types/${row.id}`, row)
    ElMessage.success('状态更新成功')
  } catch (error) {
    ElMessage.error('状态更新失败')
    getList()
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (formData.id) {
          await request.put(`/api/device-types/${formData.id}`, formData)
          ElMessage.success('更新成功')
        } else {
          await request.post('/api/device-types', formData)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        getList()
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || '操作失败')
      }
    }
  })
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.device-type-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 0;
}

.toolbar {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
