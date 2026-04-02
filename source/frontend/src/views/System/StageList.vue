<template>
  <div class="stage-list">
    <!-- 页面头部卡片 -->
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <el-icon><FolderOpened /></el-icon>
            <span>项目阶段管理</span>
          </div>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            创建阶段
          </el-button>
        </div>
      </template>
      <p class="header-desc">
        管理项目实施阶段，可以创建自定义阶段或编辑系统内置阶段。
        每个阶段可以配置推进方式（按任务/按设备）和默认任务列表。
      </p>
    </el-card>

    <!-- 阶段卡片网格 -->
    <el-row :gutter="16" class="stage-grid">
      <el-col
        v-for="stage in stageList"
        :key="stage.id"
        :xs="24"
        :sm="12"
        :lg="6"
      >
        <StageCard
          :stage="stage"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </el-col>
    </el-row>

    <!-- 创建/编辑对话框 -->
    <StageFormDialog
      v-model:visible="dialogVisible"
      :stage="editingStage"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  FolderOpened,
  Plus
} from '@element-plus/icons-vue'
import { stageApi, type Stage } from '@/api/stage'
import StageCard from '@/components/StageCard.vue'
import StageFormDialog from '@/components/StageFormDialog.vue'

const loading = ref(false)
const stageList = ref<Stage[]>([])
const dialogVisible = ref(false)
const editingStage = ref<Stage | null>(null)

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

// 创建阶段
const handleCreate = () => {
  editingStage.value = null
  dialogVisible.value = true
}

// 编辑阶段
const handleEdit = (stage: Stage) => {
  editingStage.value = stage
  dialogVisible.value = true
}

// 删除阶段
const handleDelete = (stage: Stage) => {
  if (stage.isSystem === 1) {
    ElMessage.warning('系统内置阶段不能删除')
    return
  }

  ElMessageBox.confirm(
    `确定要删除阶段"${stage.name}"吗？此操作不可恢复。`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await stageApi.deleteStage(stage.id)
      ElMessage.success('删除成功')
      await getStageList()
    } catch (error: any) {
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {
    // 用户取消
  })
}

// 对话框操作成功
const handleSuccess = async () => {
  await getStageList()
}

onMounted(() => {
  getStageList()
})
</script>

<style scoped>
.stage-list {
  padding: 8px;
}

.header-card {
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

.header-desc {
  margin: 0;
  padding: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}

.stage-grid {
  margin-top: 16px;
}

/* 为列添加底部间距，实现卡片行间距 */
.stage-grid :deep(.el-col) {
  margin-bottom: 16px;
}
</style>
