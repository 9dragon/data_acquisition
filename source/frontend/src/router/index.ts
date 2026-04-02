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
        path: 'plan',
        name: 'Plan',
        component: () => import('@/views/Plan/PlanList.vue'),
        meta: { title: '项目计划', icon: 'Calendar' }
      },
      {
        path: 'plan/:projectId',
        name: 'PlanDetail',
        component: () => import('@/views/Plan/ProjectPlanDetail.vue'),
        meta: { title: '项目计划详情', hidden: true }
      },
      {
        path: 'tasks',
        name: 'Tasks',
        component: () => import('@/views/Task/index.vue'),
        meta: { title: '任务列表', icon: 'List' }
      },
      {
        path: 'stages',
        name: 'Stages',
        component: () => import('@/views/System/StageList.vue'),
        meta: { title: '项目阶段', icon: 'Flag' }
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
        path: 'workshops',
        name: 'Workshops',
        component: () => import('@/views/Workshop/index.vue'),
        meta: { title: '车间管理', icon: 'OfficeBuilding' }
      },
      {
        path: 'device-research',
        name: 'DeviceResearch',
        component: () => import('@/views/DeviceResearch/index.vue'),
        meta: { title: '设备调研', icon: 'Document' }
      },
      {
        path: 'device-research/create',
        name: 'DeviceResearchCreate',
        component: () => import('@/views/DeviceResearch/Form.vue'),
        meta: { title: '新建调研', hidden: true }
      },
      {
        path: 'device-research/:id',
        name: 'DeviceResearchDetail',
        component: () => import('@/views/DeviceResearch/Form.vue'),
        meta: { title: '调研详情', hidden: true }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/User/index.vue'),
        meta: { title: '用户管理', icon: 'User' }
      },
      {
        path: 'roles',
        name: 'Roles',
        component: () => import('@/views/System/RoleList.vue'),
        meta: { title: '角色管理', icon: 'UserFilled' }
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
