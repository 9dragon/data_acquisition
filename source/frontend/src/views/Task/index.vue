<template>
  <div class="task-list-container">
    <el-card>
      <!-- Tab切换 -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 项目级任务 -->
        <el-tab-pane label="项目级任务" name="project">
          <ProjectTaskList />
        </el-tab-pane>

        <!-- 设备级任务 -->
        <el-tab-pane label="设备级任务" name="device">
          <DeviceTaskList />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ProjectTaskList from './ProjectTaskList.vue'
import DeviceTaskList from './DeviceTaskList.vue'

const activeTab = ref('project')

const handleTabChange = (tabName: string) => {
  console.log('切换到:', tabName)
}
</script>

<style scoped lang="scss">
.task-list-container {
  padding: 20px;

  :deep(.el-card__body) {
    padding: 20px;
  }

  :deep(.el-tabs__header) {
    margin-bottom: 20px;
  }
}
</style>
