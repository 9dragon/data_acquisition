<template>
  <div class="attendance-list">
    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="项目">
          <el-select v-model="queryParams.projectId" placeholder="全部项目" clearable style="width: 150px">
            <el-option
              v-for="project in projectList"
              :key="project.id"
              :label="project.name"
              :value="project.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="用户">
          <el-input v-model="queryParams.userName" placeholder="输入姓名" clearable style="width: 150px" />
        </el-form-item>

        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="正常" value="NORMAL" />
            <el-option label="迟到" value="LATE" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
          <el-button v-if="hasPermission('attendance:create')" type="primary" @click="handleCreate">
            新增
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="recordList"
        border
        stripe
      >
        <el-table-column prop="projectName" label="项目" width="200" show-overflow-tooltip />
        <el-table-column prop="userName" label="用户姓名" width="120" />
        <el-table-column prop="checkInTime" label="签到时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.checkInTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="shiftName" label="时段" width="100" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'NORMAL' ? 'success' : 'warning'">
              {{ row.status === 'NORMAL' ? '正常' : '迟到' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="位置" min-width="200" show-overflow-tooltip />
        <el-table-column prop="photoUrl" label="照片" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.watermarkPhotoUrl || row.photoUrl"
              :src="row.watermarkPhotoUrl || row.photoUrl"
              fit="cover"
              style="width: 60px; height: 60px; border-radius: 4px; cursor: pointer;"
              @click="openPreview(row.watermarkPhotoUrl || row.photoUrl)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="80" show-overflow-tooltip />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button link type="primary" :icon="View" @click="handleViewDetail(row)">
                查看
              </el-button>
              <el-popconfirm
                v-if="hasPermission('attendance:delete')"
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

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="签到详情"
      width="600px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户姓名">
          {{ currentRecord?.userName }}
        </el-descriptions-item>
        <el-descriptions-item label="签到时间">
          {{ formatDateTime(currentRecord?.checkInTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="时段">
          {{ currentRecord?.shiftName }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentRecord?.status === 'NORMAL' ? 'success' : 'warning'">
            {{ currentRecord?.status === 'NORMAL' ? '正常' : '迟到' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="经纬度" :span="2">
          {{ currentRecord?.latitude }}, {{ currentRecord?.longitude }}
        </el-descriptions-item>
        <el-descriptions-item label="位置描述" :span="2">
          {{ currentRecord?.location }}
        </el-descriptions-item>
        <el-descriptions-item label="详细地址" :span="2">
          {{ currentRecord?.address }}
        </el-descriptions-item>
        <el-descriptions-item label="签到照片" :span="2">
          <el-image
            v-if="currentRecord?.watermarkPhotoUrl || currentRecord?.photoUrl"
            :src="currentRecord?.watermarkPhotoUrl || currentRecord?.photoUrl"
            :preview-src-list="[(currentRecord?.watermarkPhotoUrl || currentRecord?.photoUrl)!]"
            fit="contain"
            style="max-width: 100%; max-height: 300px;"
          />
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ currentRecord?.remark || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 图片预览 -->
    <el-image-viewer
      v-if="previewVisible"
      :url-list="[previewUrl]"
      @close="previewVisible = false"
    />

    <!-- 新增对话框 -->
    <el-dialog v-model="createVisible" title="新增签到记录" width="500px">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="80px">
        <el-form-item label="用户" prop="userId">
          <el-select v-model="createForm.userId" placeholder="请选择用户" filterable style="width: 100%">
            <el-option
              v-for="user in userList"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="项目" prop="projectId">
          <el-select v-model="createForm.projectId" placeholder="请选择项目" clearable style="width: 100%">
            <el-option
              v-for="project in projectList"
              :key="project.id"
              :label="project.name"
              :value="project.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="签到时间" prop="checkInTime">
          <el-date-picker
            v-model="createForm.checkInTime"
            type="datetime"
            placeholder="选择签到时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="位置" prop="location">
          <el-input v-model="createForm.location" placeholder="请输入位置" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="createForm.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, View, Delete } from '@element-plus/icons-vue'
import { attendanceApi, type AttendanceRecord, type AttendanceQueryParams } from '@/api/attendance'
import { useProjectStore } from '@/stores/project'
import { usePermissionStore } from '@/stores/permission'
import { http } from '@/api/request'

const permissionStore = usePermissionStore()
const hasPermission = (code: string) => permissionStore.hasPermission(code)
const projectStore = useProjectStore()
const loading = ref(false)
const recordList = ref<AttendanceRecord[]>([])
const total = ref(0)
const projectList = ref<any[]>([])
const dateRange = ref<[string, string]>([])
const detailVisible = ref(false)
const currentRecord = ref<AttendanceRecord | null>(null)

// 图片预览
const previewVisible = ref(false)
const previewUrl = ref('')

const openPreview = (url: string) => {
  previewUrl.value = url
  previewVisible.value = true
}

// 新增对话框
const createVisible = ref(false)
const createFormRef = ref()
const createForm = reactive({
  userId: undefined as number | undefined,
  projectId: undefined as number | undefined,
  checkInTime: '',
  location: '',
  remark: ''
})
const createRules = {
  userId: [{ required: true, message: '请选择用户', trigger: 'change' }],
  checkInTime: [{ required: true, message: '请选择签到时间', trigger: 'change' }]
}
const userList = ref<any[]>([])

const handleCreate = async () => {
  createForm.userId = undefined
  createForm.projectId = undefined
  createForm.checkInTime = ''
  createForm.location = ''
  createForm.remark = ''
  createVisible.value = true
  await loadUsers()
}

const loadUsers = async () => {
  try {
    const res = await http.get<any>('/users', { params: { pageNum: 1, pageSize: 100 } })
    userList.value = res.records || []
  } catch {
    userList.value = []
  }
}

const handleCreateSubmit = async () => {
  if (!createFormRef.value) return
  await createFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await attendanceApi.create({
          userId: createForm.userId,
          projectId: createForm.projectId,
          checkInTime: createForm.checkInTime,
          location: createForm.location,
          remark: createForm.remark
        } as Partial<AttendanceRecord>)
        ElMessage.success('新增成功')
        createVisible.value = false
        fetchRecords()
      } catch {
        ElMessage.error('新增失败')
      }
    }
  })
}

const handleDelete = async (row: AttendanceRecord) => {
  try {
    await attendanceApi.delete(row.id)
    ElMessage.success('删除成功')
    fetchRecords()
  } catch {
    ElMessage.error('删除失败')
  }
}

const queryParams = reactive<AttendanceQueryParams>({
  pageNum: 1,
  pageSize: 10,
  projectId: undefined,
  userName: undefined,
  startDate: undefined,
  endDate: undefined,
  status: undefined
})

// 获取记录列表
const fetchRecords = async () => {
  loading.value = true
  try {
    if (dateRange.value && dateRange.value.length === 2) {
      queryParams.startDate = dateRange.value[0]
      queryParams.endDate = dateRange.value[1]
    }

    const result = await attendanceApi.list(queryParams)
    recordList.value = result.records
    total.value = result.total
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

// 查询
const handleQuery = () => {
  queryParams.pageNum = 1
  fetchRecords()
}

// 重置
const handleReset = () => {
  Object.assign(queryParams, {
    pageNum: 1,
    pageSize: 10,
    projectId: undefined,
    userName: undefined,
    startDate: undefined,
    endDate: undefined,
    status: undefined
  })
  dateRange.value = []
  fetchRecords()
}

// 导出
const handleExport = async () => {
  try {
    // 同步日期范围到查询参数
    if (dateRange.value && dateRange.value.length === 2) {
      queryParams.startDate = dateRange.value[0]
      queryParams.endDate = dateRange.value[1]
    } else {
      queryParams.startDate = undefined
      queryParams.endDate = undefined
    }

    ElMessage.success('正在导出...')
    const blob = await attendanceApi.export(queryParams)

    // 根据日期范围生成文件名
    let fileName: string
    if (queryParams.startDate && queryParams.endDate) {
      fileName = `签到记录_${queryParams.startDate}至${queryParams.endDate}.xlsx`
    } else {
      fileName = '签到记录_全部.xlsx'
    }

    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 查看详情
const handleViewDetail = (record: AttendanceRecord) => {
  currentRecord.value = record
  detailVisible.value = true
}

// 格式化日期时间
const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/\//g, '-')
}

onMounted(() => {
  fetchRecords()
  projectStore.fetchProjectList().then(() => {
    projectList.value = projectStore.projectList
  }).catch(() => {
    // 如果API不存在，使用默认数据
    projectList.value = [
      { id: 1, name: '项目A' },
      { id: 2, name: '项目B' },
      { id: 3, name: '项目C' }
    ]
  })
})
</script>

<style scoped>
.attendance-list {
  padding: 8px;
}

.filter-card {
  margin-bottom: 16px;
}

.table-card {
  margin-bottom: 16px;
}

.el-pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
