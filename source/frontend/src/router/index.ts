import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login/index.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/components/Layout/MainLayout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard/index.vue'),
        meta: { title: '工作台', icon: 'Dashboard' }
      },
      {
        path: 'projects',
        name: 'Projects',
        component: () => import('@/views/Project/index.vue'),
        meta: { title: '项目列表', icon: 'FolderOpened' }
      },
      {
        path: 'devices',
        name: 'Devices',
        component: () => import('@/views/Device/index.vue'),
        meta: { title: '设备列表', icon: 'Monitor' }
      },
      {
        path: 'device-types',
        name: 'DeviceTypes',
        component: () => import('@/views/DeviceType/index.vue'),
        meta: { title: '设备类型', icon: 'SetUp' }
      },
      {
        path: 'processes',
        name: 'Processes',
        component: () => import('@/views/Process/index.vue'),
        meta: { title: '工序管理', icon: 'Operation' }
      },
      {
        path: 'workshops',
        name: 'Workshops',
        component: () => import('@/views/Workshop/index.vue'),
        meta: { title: '车间管理', icon: 'OfficeBuilding' }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/User/index.vue'),
        meta: { title: '用户管理', icon: 'User' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const token = localStorage.getItem('token')

  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 工业数据采集项目管理系统`
  }

  // 检查是否需要登录
  if (to.meta.requiresAuth !== false && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
