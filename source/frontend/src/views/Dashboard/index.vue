<template>
  <div class="dashboard">
    <el-row :gutter="12">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #409EFF">
              <el-icon :size="24"><FolderOpened /></el-icon>
            </div>
            <div class="stat-text">
              <div class="stat-value">{{ stats.totalProjects }}</div>
              <div class="stat-label">项目总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #67C23A">
              <el-icon :size="24"><Monitor /></el-icon>
            </div>
            <div class="stat-text">
              <div class="stat-value">{{ stats.totalDevices }}</div>
              <div class="stat-label">设备总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #E6A23C">
              <el-icon :size="24"><Warning /></el-icon>
            </div>
            <div class="stat-text">
              <div class="stat-value">{{ stats.totalIssues }}</div>
              <div class="stat-label">问题总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #F56C6C">
              <el-icon :size="24"><Document /></el-icon>
            </div>
            <div class="stat-text">
              <div class="stat-value">{{ stats.totalDocuments }}</div>
              <div class="stat-label">文档总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="12" style="margin-top: 12px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近项目</span>
            </div>
          </template>
          <el-empty description="暂无数据" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>待办事项</span>
            </div>
          </template>
          <el-empty description="暂无待办" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  FolderOpened,
  Monitor,
  Warning,
  Document
} from '@element-plus/icons-vue'

const stats = reactive({
  totalProjects: 0,
  totalDevices: 0,
  totalIssues: 0,
  totalDocuments: 0
})

onMounted(() => {
  // TODO: 获取统计数据
  stats.totalProjects = 12
  stats.totalDevices = 156
  stats.totalIssues = 8
  stats.totalDocuments = 45
})
</script>

<style scoped>
.dashboard {
  padding: 8px;
}

.stat-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-right: 15px;
}

.stat-text {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin-top: 5px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
