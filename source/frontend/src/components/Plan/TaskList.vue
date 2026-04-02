<template>
  <div class="task-list">
    <template v-if="tasks.length === 0">
      <el-empty description="暂无任务" :image-size="80" />
    </template>

    <div v-else class="task-items">
      <div
        v-for="task in tasks"
        :key="task.id"
        class="task-item"
      >
        <!-- 任务头部 -->
        <div class="task-header">
          <div class="task-title-row">
            <el-tag :type="TaskStatusMap[task.status].type" size="small">
              {{ TaskStatusMap[task.status].label }}
            </el-tag>
            <span class="task-name">{{ task.name }}</span>
          </div>
          <div class="task-actions">
            <el-button
              type="primary"
              link
              size="small"
              :icon="Edit"
              @click="$emit('edit', task)"
            >
              编辑
            </el-button>
            <el-popconfirm
              title="确认删除"
              confirm-button-text="确定"
              cancel-button-text="取消"
              @confirm="$emit('delete', task.id)"
            >
              <template #reference>
                <el-button
                  type="danger"
                  link
                  size="small"
                  :icon="Delete"
                >
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>

        <!-- 任务描述 -->
        <div v-if="task.description" class="task-description">
          {{ task.description }}
        </div>

        <!-- 进度条 -->
        <div class="task-progress">
          <el-progress
            :percentage="task.progress"
            :status="task.progress === 100 ? 'success' : undefined"
            :stroke-width="6"
          />
        </div>

        <!-- 底部信息 -->
        <div class="task-footer">
          <span class="task-date">
            <el-icon><Calendar /></el-icon>
            {{ task.startDate }} ~ {{ task.endDate }}
          </span>
          <span v-if="task.assigneeNames" class="task-assignee">
            <el-icon><User /></el-icon>
            {{ task.assigneeNames }}
          </span>
          <el-tag v-if="task.dependencyIds" size="small" type="warning">
            依赖 {{ task.dependencyIds.split(',').length }} 个任务
          </el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Edit, Delete, Calendar, User } from '@element-plus/icons-vue'
import { TaskStatusMap } from '@/types/task'
import type { ProjectPlanTask } from '@/types/task'

interface Props {
  tasks: ProjectPlanTask[]
}

interface Emits {
  (e: 'edit', task: ProjectPlanTask): void
  (e: 'delete', taskId: number): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
.task-list {
  width: 100%;
}

.task-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  padding: 12px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  transition: all 0.2s;
}

.task-item:hover {
  background: #f5f5f5;
  border-color: #d9d9d9;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.task-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.task-name {
  font-weight: 500;
  font-size: 14px;
}

.task-actions {
  display: flex;
  gap: 4px;
}

.task-description {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.5;
}

.task-progress {
  margin-bottom: 8px;
}

.task-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #999;
}

.task-date,
.task-assignee {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
