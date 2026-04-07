import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getDefaultRoute } from '@/utils/device'

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
        path: 'issue',
        name: 'Issues',
        component: () => import('@/views/Issue/index.vue'),
        meta: { title: '问题列表', icon: 'Warning' }
      },
      {
        path: 'issue/:id',
        name: 'IssueDetail',
        component: () => import('@/views/Issue/IssueDetail.vue'),
        meta: { title: '问题详情', hidden: true }
      },
      {
        path: 'issue/edit/:id',
        name: 'IssueEdit',
        component: () => import('@/views/Issue/IssueDetail.vue'),
        meta: { title: '编辑问题', hidden: true }
      },
      {
        path: 'issue/my',
        name: 'MyIssues',
        component: () => import('@/views/Issue/MyIssues.vue'),
        meta: { title: '我的问题', icon: 'WarningFilled' }
      },
      {
        path: 'issue/stats',
        name: 'IssueStats',
        component: () => import('@/views/Issue/IssueStats.vue'),
        meta: { title: '问题统计', icon: 'DataAnalysis' }
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
  },
  // 移动端登录（独立路由，不需要认证）
  {
    path: '/mobile/login',
    name: 'MobileLogin',
    component: () => import('@/views/Mobile/Login/index.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  // 移动端路由
  {
    path: '/mobile',
    component: () => import('@/views/Mobile/Layout/MobileLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'MobileHome',
        component: () => import('@/views/Mobile/Home/index.vue'),
        meta: { title: '首页', keepAlive: true }
      },
      {
        path: 'attendance/check-in',
        name: 'AttendanceCheckIn',
        component: () => import('@/views/Mobile/Attendance/CheckIn.vue'),
        meta: { title: '打卡签到', hideTabBar: true }
      },
      {
        path: 'attendance/records',
        name: 'AttendanceRecords',
        component: () => import('@/views/Mobile/Attendance/Records.vue'),
        meta: { title: '签到记录', keepAlive: true }
      },
      {
        path: 'task/list',
        name: 'TaskList',
        component: () => import('@/views/Mobile/Task/List.vue'),
        meta: { title: '我的任务' }
      },
      {
        path: 'task/detail/:id',
        name: 'TaskDetail',
        component: () => import('@/views/Mobile/Task/Detail.vue'),
        meta: { title: '任务详情', hideTabBar: true }
      },
      {
        path: 'task/report/:id',
        name: 'TaskReport',
        component: () => import('@/views/Mobile/Task/Report.vue'),
        meta: { title: '任务填报', hideTabBar: true }
      },
      {
        path: 'issue/list',
        name: 'IssueList',
        component: () => import('@/views/Mobile/Issue/List.vue'),
        meta: { title: '问题管理' }
      },
      {
        path: 'issue/report',
        name: 'IssueReport',
        component: () => import('@/views/Mobile/Issue/Report.vue'),
        meta: { title: '问题上报', hideTabBar: true }
      },
      {
        path: 'issue/detail/:id',
        name: 'MobileIssueDetail',
        component: () => import('@/views/Mobile/Issue/Detail.vue'),
        meta: { title: '问题详情', hideTabBar: true }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Mobile/Profile/index.vue'),
        meta: { title: '我的' }
      },
      {
        path: 'profile/info',
        name: 'ProfileInfo',
        component: () => import('@/views/Mobile/Profile/Info.vue'),
        meta: { title: '个人信息', hideTabBar: true }
      },
      {
        path: 'profile/settings',
        name: 'ProfileSettings',
        component: () => import('@/views/Mobile/Profile/Settings.vue'),
        meta: { title: '系统设置', hideTabBar: true }
      },
      {
        path: 'profile/about',
        name: 'ProfileAbout',
        component: () => import('@/views/Mobile/Profile/About.vue'),
        meta: { title: '关于', hideTabBar: true }
      },
      {
        path: 'research/list',
        name: 'ResearchList',
        component: () => import('@/views/Mobile/Research/List.vue'),
        meta: { title: '设备调研', keepAlive: true }
      },
      {
        path: 'research/create',
        name: 'ResearchCreate',
        component: () => import('@/views/Mobile/Research/Form.vue'),
        meta: { title: '新建调研', hideTabBar: true }
      },
      {
        path: 'research/detail/:id',
        name: 'ResearchDetail',
        component: () => import('@/views/Mobile/Research/Detail.vue'),
        meta: { title: '调研详情', hideTabBar: true }
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
    // 移动端跳转到移动登录页
    if (to.path.startsWith('/mobile')) {
      next('/mobile/login')
    } else {
      next('/login')
    }
  } else if (to.path === '/login' && token) {
    // PC端已登录用户访问登录页，根据设备类型跳转
    const redirectPath = to.query.redirect as string
    const targetPath = redirectPath || getDefaultRoute()
    next(targetPath)
  } else if (to.path === '/mobile/login' && token) {
    // 移动端已登录用户访问登录页，跳转到移动端首页
    next('/mobile')
  } else {
    next()
  }
})

export default router
