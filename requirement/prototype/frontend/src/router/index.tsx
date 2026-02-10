import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Dashboard from '../pages/Dashboard';
import ProjectList from '../pages/Project/List';
import ProjectDetail from '../pages/Project/Detail';
import ProjectDashboard from '../pages/Project/Dashboard';
import DeviceList from '../pages/Device/List';
import DeviceDetail from '../pages/Device/Detail';
import DeviceTypeManage from '../pages/Device/TypeManage';
import PlanList from '../pages/Plan/PlanList';
import ProjectPlan from '../pages/Plan/ProjectPlan';
import ProgressReport from '../pages/Plan/ProgressReport';
import BatchReport from '../pages/Plan/BatchReport';
import GanttView from '../pages/Plan/GanttView';
import IssueList from '../pages/Issue/List';
import IssueDetail from '../pages/Issue/Detail';
import MyIssue from '../pages/Issue/MyIssue';
import IssueStatistics from '../pages/Issue/Statistics';
import ProjectDoc from '../pages/Document/ProjectDoc';
import TagManage from '../pages/Document/TagManage';

// 懒加载页面组件
const UserManage = React.lazy(() => import('../pages/System/User'));
const RoleManage = React.lazy(() => import('../pages/System/Role'));
const ConfigManage = React.lazy(() => import('../pages/System/Config'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      // 项目管理
      {
        path: 'project',
        element: <ProjectList />,
      },
      {
        path: 'project/:id',
        element: <ProjectDetail />,
      },
      {
        path: 'project/:id/dashboard',
        element: <ProjectDashboard />,
      },
      // 设备管理
      {
        path: 'device',
        element: <DeviceList />,
      },
      {
        path: 'device/:id',
        element: <DeviceDetail />,
      },
      {
        path: 'device/type',
        element: <DeviceTypeManage />,
      },
      // 计划管理
      {
        path: 'plan',
        element: <PlanList />,
      },
      {
        path: 'plan/:projectId',
        element: <ProjectPlan />,
      },
      {
        path: 'plan/report/:deviceId',
        element: <ProgressReport />,
      },
      {
        path: 'plan/batch-report/:projectId/:stage',
        element: <BatchReport />,
      },
      {
        path: 'plan/gantt/:projectId',
        element: <GanttView />,
      },
      // 问题管理
      {
        path: 'issue',
        element: <IssueList />,
      },
      {
        path: 'issue/:id',
        element: <IssueDetail />,
      },
      {
        path: 'issue/my',
        element: <MyIssue />,
      },
      {
        path: 'issue/statistics',
        element: <IssueStatistics />,
      },
      // 文档中心
      {
        path: 'document',
        element: <ProjectDoc />,
      },
      {
        path: 'document/tag',
        element: <TagManage />,
      },
      // 系统管理
      {
        path: 'system/user',
        element: (
          <React.Suspense fallback={<div>加载中...</div>}>
            <UserManage />
          </React.Suspense>
        ),
      },
      {
        path: 'system/role',
        element: (
          <React.Suspense fallback={<div>加载中...</div>}>
            <RoleManage />
          </React.Suspense>
        ),
      },
      {
        path: 'system/config',
        element: (
          <React.Suspense fallback={<div>加载中...</div>}>
            <ConfigManage />
          </React.Suspense>
        ),
      },
    ],
  },
]);

export default router;
