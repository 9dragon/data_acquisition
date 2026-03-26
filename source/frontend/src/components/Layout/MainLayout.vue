<template>
  <el-container class="main-layout">
    <el-aside :width="layoutStore.sidebarCollapsed ? '64px' : '240px'">
      <Sidebar />
    </el-aside>
    <el-container>
      <el-header>
        <Header />
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useLayoutStore } from '@/stores/layout'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'

const layoutStore = useLayoutStore()
</script>

<style scoped>
.main-layout {
  height: 100vh;
}

.el-aside {
  background-color: #304156;
  color: #fff;
  transition: width 0.3s;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  padding: 0;
}

.el-main {
  background-color: #f0f2f5;
  padding: 8px;
}
</style>
