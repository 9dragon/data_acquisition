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
    >
      <el-menu-item index="/dashboard">
        <el-icon><DataBoard /></el-icon>
        <span>工作台</span>
      </el-menu-item>
      <el-menu-item index="/projects">
        <el-icon><FolderOpened /></el-icon>
        <span>项目列表</span>
      </el-menu-item>
      <el-menu-item index="/devices">
        <el-icon><Monitor /></el-icon>
        <span>设备列表</span>
      </el-menu-item>
      <el-menu-item index="/device-types">
        <el-icon><SetUp /></el-icon>
        <span>设备类型</span>
      </el-menu-item>
      <el-menu-item index="/processes">
        <el-icon><Operation /></el-icon>
        <span>工序管理</span>
      </el-menu-item>
      <el-menu-item index="/workshops">
        <el-icon><OfficeBuilding /></el-icon>
        <span>车间管理</span>
      </el-menu-item>
      <el-menu-item index="/users">
        <el-icon><User /></el-icon>
        <span>用户管理</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLayoutStore } from '@/stores/layout'
import {
  DataBoard,
  FolderOpened,
  Monitor,
  SetUp,
  Operation,
  OfficeBuilding,
  User
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
