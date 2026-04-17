<template>
  <div class="device-research-list">
    <!-- 页面头部 -->
    <el-card class="header-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <el-icon><Document /></el-icon>
            <span>设备调研</span>
          </div>
          <div class="header-actions">
            <el-button type="primary" :icon="Plus" @click="handleCreate">
              新建调研
            </el-button>
            <el-button :icon="Download" @click="handleDownloadTemplate">
              下载模板
            </el-button>
            <el-upload
              :show-upload-list="false"
              accept=".xlsx,.xls"
              :before-upload="handleImport"
            >
              <el-button :icon="Upload">批量导入</el-button>
            </el-upload>
            <el-button
              :icon="ExportIcon"
              :disabled="selectedIds.length === 0"
              @click="handleExport"
            >
              批量导出 ({{ selectedIds.length }})
            </el-button>
          </div>
        </div>
      </template>
      <p class="header-desc">
        管理设备调研信息，跟踪调研进度。支持查看、编辑、删除调研记录，以及批量导入导出功能。
      </p>
    </el-card>

    <!-- 查询筛选 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="queryParams" inline>
        <el-form-item label="项目">
          <el-select
            v-model="queryParams.projectId"
            placeholder="请选择项目"
            clearable
            filterable
            style="width: 180px"
            @change="handleQuery"
          >
            <el-option
              v-for="project in projectList"
              :key="project.id"
              :label="project.name"
              :value="project.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="车间">
          <el-input
            v-model="queryParams.workshop"
            placeholder="请输入车间"
            clearable
            style="width: 150px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item label="设备类型">
          <el-input
            v-model="queryParams.deviceType"
            placeholder="请输入设备类型"
            clearable
            style="width: 150px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">
            查询
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="researchList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="projectName" label="所属项目" min-width="120" />
        <el-table-column prop="workshopName" label="所属车间" min-width="100" />
        <el-table-column prop="deviceTypeName" label="设备类型" min-width="100" />
        <el-table-column prop="deviceManufacturer" label="设备厂商" min-width="120" />
        <el-table-column prop="quantity" label="数量" width="70" align="center" />
        <el-table-column label="控制器品牌" min-width="100">
          <template #default="{ row }">
            {{ row.controllerBrand || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="控制器型号" min-width="100">
          <template #default="{ row }">
            {{ row.controllerModel || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="接口" width="70">
          <template #default="{ row }">
            {{ row.interfaceType || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="接口占用" width="80" align="center">
          <template #default="{ row }">
            {{ row.isInterfaceOccupied === true ? '是' : row.isInterfaceOccupied === false ? '否' : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="触摸屏" width="80" align="center">
          <template #default="{ row }">
            {{ row.hasTouchScreen === true ? '是' : row.hasTouchScreen === false ? '否' : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="完整度" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getProgressType(row.researchProgress)">
              {{ getProgressText(row.researchProgress) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button link type="primary" :icon="View" @click="handleView(row)">
                查看
              </el-button>
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

    <!-- 调研表单抽屉 -->
    <ResearchForm
      v-model="formVisible"
      :research-id="currentResearchId"
      :mode="formMode"
      @success="handleSuccess"
    />

    <!-- 导入结果弹窗 -->
    <el-dialog
      v-model="importResultVisible"
      title="导入结果"
      width="600px"
    >
      <div v-if="importResult">
        <div class="import-summary">
          <p>总计: <strong>{{ importResult.total }}</strong> 条</p>
          <p class="success-text">成功: <strong>{{ importResult.successCount }}</strong> 条</p>
          <p class="error-text">失败: <strong>{{ importResult.failCount }}</strong> 条</p>
        </div>

        <div v-if="importResult.errors && importResult.errors.length > 0" class="import-errors">
          <p class="error-title">错误详情:</p>
          <div class="error-list">
            <p
              v-for="(error, index) in importResult.errors"
              :key="index"
              class="error-item"
            >
              {{ index + 1 }}. {{ error }}
            </p>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="importResultVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Document,
  Plus,
  Download,
  Upload,
  Search,
  Refresh,
  View,
  Edit,
  Delete,
  Download as ExportIcon
} from '@element-plus/icons-vue'
import { deviceResearchApi, type ImportResult } from '@/api/deviceResearch'
import { useProjectStore } from '@/stores/project'
import { useDeviceResearchStore } from '@/stores/deviceResearch'
import type { DeviceResearch } from '@/types/device'
import ResearchForm from './Form.vue'

const router = useRouter()
const projectStore = useProjectStore()
const deviceResearchStore = useDeviceResearchStore()

const loading = ref(false)
const researchList = ref<DeviceResearch[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const formVisible = ref(false)
const currentResearchId = ref<string>()
const formMode = ref<'view' | 'edit'>('edit')

const importResultVisible = ref(false)
const importResult = ref<ImportResult | null>(null)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  projectId: '',
  workshop: '',
  deviceType: ''
})

const projectList = computed(() => projectStore.projectList || [])

// 获取调研列表
const getList = async () => {
  loading.value = true
  try {
    const result = await deviceResearchApi.getPage(queryParams)
    researchList.value = result.records
    total.value = result.total
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
  Object.assign(queryParams, {
    pageNum: 1,
    pageSize: 10,
    projectId: '',
    workshop: '',
    deviceType: ''
  })
  getList()
}

// 选择变化
const handleSelectionChange = (selection: DeviceResearch[]) => {
  selectedIds.value = selection.map(item => item.id || '')
}

// 新建
const handleCreate = () => {
  currentResearchId.value = undefined
  formMode.value = 'edit'
  formVisible.value = true
}

// 查看
const handleView = (row: DeviceResearch) => {
  currentResearchId.value = row.id || row.deviceId
  formMode.value = 'view'
  formVisible.value = true
}

// 编辑
const handleEdit = (row: DeviceResearch) => {
  currentResearchId.value = row.id || row.deviceId
  formMode.value = 'edit'
  formVisible.value = true
}

// 删除
const handleDelete = async (row: DeviceResearch) => {
  const id = row.id || row.deviceId
  if (!id) return

  try {
    await deviceResearchApi.delete(id)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

// 下载模板
const handleDownloadTemplate = async () => {
  try {
    const blob = await deviceResearchApi.downloadTemplate()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '设备调研导入模板.xlsx'
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    ElMessage.error('下载模板失败')
  }
}

// 批量导入
const handleImport = async (file: File) => {
  try {
    const result = await deviceResearchApi.import(file)
    importResult.value = result
    importResultVisible.value = true
    getList()
  } catch (error) {
    ElMessage.error('导入失败')
  }
  return false
}

// 批量导出
const handleExport = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要导出的调研记录')
    return
  }

  try {
    const blob = await deviceResearchApi.export(selectedIds.value)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `设备调研_${Date.now()}.xlsx`
    link.click()
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 成功回调
const handleSuccess = () => {
  getList()
}

const getProgressType = (progress?: number) => {
  if (progress === 100) return 'success'  // 已完成：绿色
  return 'warning'                         // 进行中：橙色
}

const getProgressText = (progress?: number) => {
  if (!progress) return '-'
  if (progress >= 100) return '已完成'
  return '进行中'
}

onMounted(async () => {
  await projectStore.fetchProjectList()
  getList()
})
</script>

<style scoped>
.device-research-list {
  padding: 8px;
}

.header-card,
.filter-card,
.table-card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.header-desc {
  margin: 0;
  padding: 0;
  color: #666;
  font-size: 14px;
}

.el-pagination {
  margin-top: 16px;
  justify-content: flex-end;
}

.import-summary {
  margin-bottom: 16px;
}

.import-summary p {
  margin: 4px 0;
}

.success-text {
  color: #52c41a;
}

.error-text {
  color: #ff4d4f;
}

.import-errors {
  margin-top: 16px;
}

.error-title {
  font-weight: 500;
  margin-bottom: 8px;
}

.error-list {
  max-height: 200px;
  overflow-y: auto;
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
}

.error-item {
  color: #ff4d4f;
  margin: 4px 0;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}

.action-buttons .el-button {
  margin: 0;
  white-space: nowrap;
  padding: 0;
}

.action-buttons .el-button + .el-button {
  margin-left: 0;
}
</style>
