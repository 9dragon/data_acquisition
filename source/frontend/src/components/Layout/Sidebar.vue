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
      <template v-for="menu in menus" :key="menu.code">
        <el-menu-item v-if="!menu.children || menu.children.length === 0" :index="menu.path || '/'">
          <el-icon><component :is="getIcon(menu.code)" /></el-icon>
          <span>{{ menu.name }}</span>
        </el-menu-item>
        <el-sub-menu v-else :index="menu.code">
          <template #title>
            <el-icon><component :is="getIcon(menu.code)" /></el-icon>
            <span>{{ menu.name }}</span>
          </template>
          <el-menu-item v-for="child in menu.children" :key="child.code" :index="child.path || '/'">
            <el-icon><component :is="getIcon(child.code)" /></el-icon>
            <span>{{ child.name }}</span>
          </el-menu-item>
        </el-sub-menu>
      </template>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useLayoutStore } from '@/stores/layout'
import { usePermissionStore } from '@/stores/permission'
import { authApi, type MenuPermission } from '@/api/auth'
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
  List,
  Warning,
  DataAnalysis
} from '@element-plus/icons-vue'

const route = useRoute()
const layoutStore = useLayoutStore()
const permissionStore = usePermissionStore()
const activeMenu = computed(() => route.path)
const menus = ref<MenuPermission[]>([])

const iconMap: Record<string, any> = {
  dashboard: DataBoard,
  progress: DataLine,
  project: FolderOpened,
  device: Monitor,
  issue: Warning,
  system: Setting,
  plan: Calendar,
  tasks: List,
  'attendance-list': Document,
  projects: Document,
  stages: Flag,
  devices: Monitor,
  'device-research': Document,
  'device-types': SetUp,
  workshops: OfficeBuilding,
  'issue:list': Document,
  'issue-my': User,
  'issue-stats': DataAnalysis,
  users: User,
  roles: UserFilled,
  'attendance-config': Setting
}

function getIcon(code: string) {
  return iconMap[code] || Document
}

async function loadMenus() {
  try {
    const data = await authApi.getUserMenus()
    menus.value = data || []
    permissionStore.setMenus(data || [])
  } catch (error) {
    console.error('Failed to load menus:', error)
    menus.value = []
  }
}

watch(() => permissionStore.menus, (newMenus) => {
  if (newMenus.length > 0) {
    menus.value = newMenus
  }
}, { immediate: true })

onMounted(() => {
  if (permissionStore.menus.length === 0) {
    loadMenus()
  } else {
    menus.value = permissionStore.menus
  }
})
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