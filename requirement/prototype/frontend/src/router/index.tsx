import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Dashboard from '../pages/Dashboard';
import ProjectList from '../pages/Project/List';
import ProjectDetail from '../pages/Project/Detail';
import ProjectDashboard from '../pages/Project/Dashboard';
import DeviceList from '../pages/Device/List';
import DeviceDetail from '../pages/Device/Detail';
import DeviceResearch from '../pages/Device/Research';
import CreateResearch from '../pages/Device/CreateResearch';
import SelectDeviceForResearch from '../pages/Device/SelectDeviceForResearch';
import ResearchList from '../pages/Device/ResearchList';
import DeviceTypeManage from '../pages/Device/TypeManage';
import PlanList from '../pages/Plan/PlanList';
import ProjectPlan from '../pages/Plan/ProjectPlan';
import ProgressReport from '../pages/Plan/ProgressReport';
import BatchReport from '../pages/Plan/BatchReport';
import IssueList from '../pages/Issue/List';
import IssueDetail from '../pages/Issue/Detail';
import MyIssue from '../pages/Issue/MyIssue';
import IssueStatistics from '../pages/Issue/Statistics';
import ProjectDoc from '../pages/Document/ProjectDoc';
import TagManage from '../pages/Document/TagManage';
import StageList from '../pages/Project/StageList';
import ProgressList from '../pages/Progress/ProgressList';

// 懒加载页面组件
const ProfileCenter = React.lazy(() => import('../pages/Profile/Center'));
const UserManage = React.lazy(() => import('../pages/System/User'));
const RoleManage = React.lazy(() => import('../pages/System/Role'));
const NotificationManage = React.lazy(() => import('../pages/System/Notification'));
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
      {
        path: 'project/stage',
        element: <StageList />,
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
        path: 'device/research/:deviceId',
        element: <DeviceResearch />,
      },
      {
        path: 'device/:id/research',
        element: <DeviceResearch />,
      },
      {
        path: 'device/research/create',
        element: <CreateResearch />,
      },
      {
        path: 'device/research-list',
        element: <ResearchList />,
      },
      {
        path: 'device/research/view/:researchId',
        element: <DeviceResearch />,
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
        path: 'plan/batch-report/:projectId/:stage',
        element: <BatchReport />,
      },
      {
        path: 'progress',
        element: <ProgressList />,
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
      // 个人中心
      {
        path: 'profile',
        element: (
          <React.Suspense fallback={<div>加载中...</div>}>
            <ProfileCenter />
          </React.Suspense>
        ),
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
        path: 'system/notification',
        element: (
          <React.Suspense fallback={<div>加载中...</div>}>
            <NotificationManage />
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
