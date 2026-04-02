<template>
  <el-card
    class="stage-card"
    :class="{ 'system-stage': stage.isSystem === 1 }"
    :style="{ borderTopColor: stage.color || '#409EFF' }"
    shadow="hover"
  >
    <div class="stage-card-content">
      <!-- 标题区域 -->
      <div class="stage-header" :style="{ color: stage.color || '#409EFF' }">
        <span class="stage-icon">
          <el-icon :size="20">
            <component :is="getIcon" />
          </el-icon>
        </span>
        <span class="stage-name">{{ stage.name }}</span>
      </div>

      <!-- 描述 -->
      <div class="stage-description">
        {{ stage.description || '暂无描述' }}
      </div>

      <!-- 标签区域 -->
      <div class="stage-tags">
        <el-tag :type="progressModeTagType" size="small">
          {{ progressModeText }}
        </el-tag>
        <el-tag v-if="stage.defaultWeight" type="info" size="small">
          权重 {{ stage.defaultWeight }}%
        </el-tag>
        <el-tag v-if="stage.isSystem === 1" type="info" size="small" effect="plain">
          系统内置
        </el-tag>
      </div>

      <!-- 任务信息 -->
      <div v-if="hasTasks" class="stage-tasks">
        <div class="tasks-header">
          {{ taskModeText }}
        </div>
        <div class="task-list">
          <div
            v-for="task in displayTasks"
            :key="getTaskKey(task)"
            class="task-item"
          >
            <div class="task-name-row">
              <el-tag size="small" effect="plain">
                {{ getTaskName(task) }}
              </el-tag>
              <span v-if="isTaskObject(task) && task.defaultWeight" class="task-weight">
                {{ task.defaultWeight }}%
              </span>
            </div>
            <div v-if="isTaskObject(task) && task.description" class="task-desc">
              {{ task.description }}
            </div>
          </div>
          <el-tag v-if="hasMoreTasks" size="small" type="info" effect="plain">
            +{{ remainingTasksCount }}
          </el-tag>
        </div>
        <div v-if="totalMaterialsCount > 0" class="materials-info">
          共 {{ totalMaterialsCount }} 项资料要求
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="stage-actions">
        <el-popover
          :width="100"
          trigger="click"
          placement="bottom-end"
        >
          <template #reference>
            <el-button type="primary" link>
              <el-icon><MoreFilled /></el-icon>
            </el-button>
          </template>
          <div class="action-menu">
            <div class="menu-item" @click="handleEdit">
              <el-icon><Edit /></el-icon>
              编辑
            </div>
            <div
              class="menu-item"
              :class="{ 'menu-item-disabled': stage.isSystem === 1 }"
              @click="handleDelete"
            >
              <el-icon><Delete /></el-icon>
              删除
            </div>
          </div>
        </el-popover>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import {
  FolderOpened,
  Refresh,
  Clock,
  CircleCheck,
  Setting,
  Tools,
  Promotion,
  Sunny,
  Operation,
  DataBoard,
  MoreFilled,
  Edit,
  Delete
} from '@element-plus/icons-vue'
import type { Stage, TaskTemplate } from '@/api/stage'

interface Props {
  stage: Stage
}

interface Emits {
  (e: 'edit', stage: Stage): void
  (e: 'delete', stage: Stage): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 图标映射
const IconMap: Record<string, Component> = {
  'FolderOpened': FolderOpened,
  'Refresh': Refresh,
  'Clock': Clock,
  'CircleCheck': CircleCheck,
  'Setting': Setting,
  'Tools': Tools,
  'Rocket': Promotion,
  'Lightning': Sunny,
  'Operation': Operation,
  'DataBoard': DataBoard
}

// 默认图标
const DefaultIcon = FolderOpened

const getIcon = computed(() => {
  if (props.stage.icon && IconMap[props.stage.icon]) {
    return IconMap[props.stage.icon]
  }
  return DefaultIcon
})

const progressModeText = computed(() => {
  return props.stage.progressMode === 'by_task' ? '按任务' : '按设备'
})

const progressModeTagType = computed(() => {
  return props.stage.progressMode === 'by_task' ? 'primary' : 'success'
})

const hasTasks = computed(() => {
  return !!(props.stage.taskTemplates && props.stage.taskTemplates.length > 0)
})

const taskModeText = computed(() => {
  return `任务模板：${props.stage.taskTemplates?.length || 0} 个任务`
})

const displayTasks = computed(() => {
  if (!props.stage.taskTemplates) return []
  return props.stage.taskTemplates.slice(0, 3)
})

const hasMoreTasks = computed(() => {
  if (!props.stage.taskTemplates) return false
  return props.stage.taskTemplates.length > 3
})

const remainingTasksCount = computed(() => {
  if (!props.stage.taskTemplates) return 0
  return Math.max(0, props.stage.taskTemplates.length - 3)
})

const totalMaterialsCount = computed(() => {
  if (!props.stage.taskTemplates) return 0
  return props.stage.taskTemplates.reduce((sum, task) => {
    return sum + (task.materialRequirements?.length || 0)
  }, 0)
})

const getTaskKey = (task: TaskTemplate | string) => {
  return typeof task === 'string' ? task : task.id
}

const getTaskName = (task: TaskTemplate | string) => {
  return typeof task === 'string' ? task : task.name
}

const isTaskObject = (task: TaskTemplate | string): task is TaskTemplate => {
  return typeof task !== 'string'
}

const handleEdit = () => {
  emit('edit', props.stage)
}

const handleDelete = () => {
  if (props.stage.isSystem === 1) {
    return
  }
  emit('delete', props.stage)
}
</script>

<style scoped>
.stage-card {
  border-top-width: 4px;
  border-top-style: solid;
  height: 100%;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stage-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stage-card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.stage-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
}

.stage-icon {
  display: flex;
  align-items: center;
}

.stage-description {
  min-height: 40px;
  color: #666;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.stage-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.stage-tasks {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  flex: 1;
}

.tasks-header {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.task-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.task-weight {
  font-size: 11px;
  color: #999;
}

.task-desc {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.materials-info {
  font-size: 11px;
  color: #666;
  margin-top: 6px;
}

.stage-actions {
  position: absolute;
  top: 0;
  right: 0;
}

.system-stage {
  opacity: 0.9;
}

.action-menu {
  padding: 4px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: #f5f5f5;
}

.menu-item-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.menu-item-disabled:hover {
  background-color: transparent;
}
</style>
