<template>
  <div class="sidebar">
    <div class="logo">
      <h2 v-if="!layoutStore.sidebarCollapsed">数据采集项目管理</h2>
      <h2 v-else>数采</h2>
    </div>
    <el-menu
      :default-active="activeMenu"
      :router="true"
      :collapse="layoutStore.sidebarCollapsed"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
      :unique-opened="true"
    >
      <!-- 工作台 -->
      <el-menu-item index="/dashboard">
        <el-icon><DataBoard /></el-icon>
        <span>工作台</span>
      </el-menu-item>

      <!-- 进度管理 -->
      <el-sub-menu index="progress">
        <template #title>
          <el-icon><DataLine /></el-icon>
          <span>进度管理</span>
        </template>
        <el-menu-item index="/plan">
          <el-icon><Calendar /></el-icon>
          <span>项目计划</span>
        </el-menu-item>
        <el-menu-item index="/tasks">
          <el-icon><List /></el-icon>
          <span>任务列表</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- 项目管理 -->
      <el-sub-menu index="project">
        <template #title>
          <el-icon><FolderOpened /></el-icon>
          <span>项目管理</span>
        </template>
        <el-menu-item index="/projects">
          <el-icon><Document /></el-icon>
          <span>项目列表</span>
        </el-menu-item>
        <el-menu-item index="/stages">
          <el-icon><Flag /></el-icon>
          <span>项目阶段</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- 设备管理 -->
      <el-sub-menu index="device">
        <template #title>
          <el-icon><Monitor /></el-icon>
          <span>设备管理</span>
        </template>
        <el-menu-item index="/devices">
          <el-icon><Monitor /></el-icon>
          <span>设备列表</span>
        </el-menu-item>
        <el-menu-item index="/device-research">
          <el-icon><Document /></el-icon>
          <span>设备调研</span>
        </el-menu-item>
        <el-menu-item index="/device-types">
          <el-icon><SetUp /></el-icon>
          <span>设备类型</span>
        </el-menu-item>
        <el-menu-item index="/workshops">
          <el-icon><OfficeBuilding /></el-icon>
          <span>车间管理</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- 系统管理 -->
      <el-sub-menu index="system">
        <template #title>
          <el-icon><Setting /></el-icon>
          <span>系统管理</span>
        </template>
        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/roles">
          <el-icon><UserFilled /></el-icon>
          <span>角色管理</span>
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLayoutStore } from '@/stores/layout'
import {
  DataBoard,
  DataLine,
  FolderOpened,
  Monitor,
  SetUp,
  OfficeBuilding,
  User,
  UserFilled,
  Setting,
  Document,
  Flag,
  Calendar,
  List
} from '@element-plus/icons-vue'

const route = useRoute()
const layoutStore = useLayoutStore()
const activeMenu = computed(() => route.path)
</script>

<style scoped>
.sidebar {
  height: 100%;
  transition: width 0.3s;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #263445;
  transition: all 0.3s;
}

.logo h2 {
  color: #fff;
  font-size: 18px;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
}

.el-menu {
  border-right: none;
}

/* 收缩状态下的样式调整 */
.el-menu--collapse {
  width: 64px;
}

.el-menu--collapse .el-menu-item {
  padding-left: 20px !important;
}
</style>
