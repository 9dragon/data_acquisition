<template>
  <div class="issue-detail">
    <el-page-header @back="handleBack" content="问题详情">
      <template #extra>
        <el-button v-if="canEdit" type="primary" :icon="Edit" @click="handleEdit">编辑</el-button>
        <el-button v-if="canAssign" :icon="User" @click="handleAssignDialog = true">分配</el-button>
        <el-button v-if="canChangeStatus" type="success" :icon="CircleCheck" @click="handleStatusDialog = true">更改状态</el-button>
      </template>
    </el-page-header>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>问题信息</span>
              <el-tag :type="getStatusType(issue.status)">{{ getStatusName(issue.status) }}</el-tag>
            </div>
          </template>

          <el-descriptions :column="2" border>
            <el-descriptions-item label="问题编号">{{ issue.code }}</el-descriptions-item>
            <el-descriptions-item label="问题标题">{{ issue.title }}</el-descriptions-item>
            <el-descriptions-item label="问题类型">{{ getTypeName(issue.type) }}</el-descriptions-item>
            <el-descriptions-item label="优先级">
              <el-tag :type="getPriorityType(issue.priority)">{{ getPriorityName(issue.priority) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="所属项目">
              <router-link :to="`/project/${issue.projectId}`">{{ issue.projectName }}</router-link>
            </el-descriptions-item>
            <el-descriptions-item label="关联设备">
              {{ issue.deviceName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="报告人">{{ issue.reporterName }}</el-descriptions-item>
            <el-descriptions-item label="负责人">{{ issue.assigneeName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="预计解决时间">{{ issue.dueDate || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDateTime(issue.createTime) }}</el-descriptions-item>
            <el-descriptions-item label="解决时间" v-if="issue.resolvedAt">{{ formatDateTime(issue.resolvedAt) }}</el-descriptions-item>
            <el-descriptions-item label="关闭时间" v-if="issue.closedAt">{{ formatDateTime(issue.closedAt) }}</el-descriptions-item>
            <el-descriptions-item label="问题描述" :span="2">{{ issue.description || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card style="margin-top: 16px">
          <template #header>
            <span>评论 ({{ comments.length }})</span>
          </template>

          <div class="comment-list">
            <div v-for="comment in comments" :key="comment.id" class="comment-item">
              <div class="comment-header">
                <span class="comment-author">{{ comment.authorName }}</span>
                <span class="comment-time">{{ formatDateTime(comment.createTime) }}</span>
              </div>
              <div class="comment-content">{{ comment.content }}</div>
            </div>
            <el-empty v-if="comments.length === 0" description="暂无评论" />
          </div>

          <el-divider />

          <el-input
            v-model="newComment"
            type="textarea"
            :rows="3"
            placeholder="添加评论..."
          />
          <el-button type="primary" style="margin-top: 8px" @click="handleAddComment" :loading="commentLoading">
            提交评论
          </el-button>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card>
          <template #header>
            <span>状态变更历史</span>
          </template>

          <el-timeline>
            <el-timeline-item
              v-for="item in statusHistory"
              :key="item.id"
              :timestamp="formatDateTime(item.createTime)"
              placement="top"
            >
              <div class="timeline-content">
                <div>{{ getStatusName(item.fromStatus) || '无' }} → {{ getStatusName(item.toStatus) }}</div>
                <div class="timeline-operator">{{ item.operatorName }}</div>
                <div v-if="item.remark" class="timeline-remark">{{ item.remark }}</div>
              </div>
            </el-timeline-item>
            <el-empty v-if="statusHistory.length === 0" description="暂无历史" />
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="handleAssignDialog" title="分配负责人" width="400px">
      <el-form>
        <el-form-item label="负责人">
          <el-select v-model="assigneeId" placeholder="请选择" style="width: 100%">
            <el-option v-for="u in userOptions" :key="u.id" :label="u.name" :value="u.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleAssignDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAssign">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="handleStatusDialog" title="更改状态" width="400px">
      <el-form>
        <el-form-item label="新状态">
          <el-select v-model="newStatus" placeholder="请选择" style="width: 100%">
            <el-option v-for="opt in ISSUE_STATUS_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="statusRemark" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleStatusDialog = false">取消</el-button>
        <el-button type="primary" @click="handleChangeStatus">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Edit, User, CircleCheck } from '@element-plus/icons-vue'
import { issueApi } from '@/api/issue'
import type { Issue, IssueComment, IssueStatusHistory } from '@/types/issue'
import { ISSUE_TYPE_OPTIONS, ISSUE_PRIORITY_OPTIONS, ISSUE_STATUS_OPTIONS } from '@/types/issue'
import { http } from '@/api/request'
import { userApi } from '@/api/user'

const router = useRouter()
const route = useRoute()

const issue = ref<Issue>({} as Issue)
const comments = ref<IssueComment[]>([])
const statusHistory = ref<IssueStatusHistory[]>([])
const userOptions = ref<{ id: number; name: string }[]>([])

const newComment = ref('')
const commentLoading = ref(false)

const handleAssignDialog = ref(false)
const assigneeId = ref<number>()

const handleStatusDialog = ref(false)
const newStatus = ref('')
const statusRemark = ref('')

const canEdit = computed(() => issue.value.status !== 'closed')
const canAssign = computed(() => issue.value.status === 'open' || issue.value.status === 'assigned')
const canChangeStatus = computed(() => issue.value.status !== 'closed')

onMounted(() => {
  loadData()
  loadUsers()
})

async function loadData() {
  const id = Number(route.params.id)
  try {
    const [issueRes, commentsRes, historyRes] = await Promise.all([
      issueApi.getById(id),
      issueApi.getComments(id),
      issueApi.getHistory(id)
    ])
    issue.value = issueRes
    comments.value = commentsRes.records || commentsRes.data || commentsRes || []
    statusHistory.value = historyRes.records || historyRes.data || historyRes || []
  } catch (e) {
    console.error('加载失败', e)
  }
}

async function loadUsers() {
  try {
    userOptions.value = await userApi.getOptions()
  } catch (e) {
    console.error('加载用户失败', e)
  }
}

function handleBack() {
  router.push('/issue')
}

function handleEdit() {
  router.push(`/issue/edit/${issue.value.id}`)
}

async function handleAssign() {
  if (!assigneeId.value) {
    ElMessage.warning('请选择负责人')
    return
  }
  try {
    await issueApi.assign(issue.value.id, assigneeId.value, 1)
    ElMessage.success('分配成功')
    handleAssignDialog.value = false
    loadData()
  } catch (e) {
    console.error('分配失败', e)
  }
}

async function handleChangeStatus() {
  if (!newStatus.value) {
    ElMessage.warning('请选择状态')
    return
  }
  try {
    await issueApi.updateStatus(issue.value.id, newStatus.value, 1, statusRemark.value)
    ElMessage.success('状态更新成功')
    handleStatusDialog.value = false
    loadData()
  } catch (e) {
    console.error('状态更新失败', e)
  }
}

async function handleAddComment() {
  if (!newComment.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  commentLoading.value = true
  try {
    await issueApi.addComment(issue.value.id, newComment.value, 1)
    ElMessage.success('评论成功')
    newComment.value = ''
    loadData()
  } catch (e) {
    console.error('评论失败', e)
  } finally {
    commentLoading.value = false
  }
}

function getTypeName(type: string) {
  return ISSUE_TYPE_OPTIONS.find(o => o.value === type)?.label || type
}

function getPriorityName(priority: string) {
  return ISSUE_PRIORITY_OPTIONS.find(o => o.value === priority)?.label || priority
}

function getStatusName(status: string) {
  return ISSUE_STATUS_OPTIONS.find(o => o.value === status)?.label || status
}

function getPriorityType(priority: string) {
  const map: Record<string, string> = {
    low: 'info',
    medium: '',
    high: 'warning',
    urgent: 'danger'
  }
  return map[priority] || ''
}

function getStatusType(status: string) {
  const map: Record<string, string> = {
    open: 'danger',
    assigned: 'warning',
    in_progress: 'primary',
    resolved: 'success',
    closed: 'info'
  }
  return map[status] || ''
}

function formatDateTime(dateStr: string | undefined) {
  if (!dateStr) return ''
  return dateStr.replace('T', ' ').substring(0, 19)
}
</script>

<style scoped>
.issue-detail {
  padding: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-list {
  max-height: 400px;
  overflow-y: auto;
}

.comment-item {
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.comment-author {
  font-weight: bold;
  color: #303133;
}

.comment-time {
  color: #909399;
  font-size: 12px;
}

.comment-content {
  color: #606266;
  line-height: 1.6;
}

.timeline-content {
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.timeline-operator {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.timeline-remark {
  font-size: 12px;
  color: #606266;
  margin-top: 4px;
}
</style>
