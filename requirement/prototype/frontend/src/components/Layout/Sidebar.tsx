import React, { useState } from 'react';
import { Layout, Menu, Space } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  ProjectOutlined,
  SettingOutlined,
  FileTextOutlined,
  BugOutlined,
  DatabaseOutlined,
  CalendarOutlined,
  TeamOutlined,
  FolderOpenOutlined,
  TagOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  ControlOutlined,
  CloudServerOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '工作台',
    },
    {
      key: 'project-group',
      icon: <ProjectOutlined />,
      label: '项目管理',
      children: [
        { key: '/project', label: '项目列表' },
      ],
    },
    {
      key: 'device-group',
      icon: <DatabaseOutlined />,
      label: '设备管理',
      children: [
        { key: '/device', label: '设备列表' },
        { key: '/device/type', label: '设备类型' },
      ],
    },
    {
      key: 'plan-group',
      icon: <CalendarOutlined />,
      label: '计划管理',
      children: [
        { key: '/plan', label: '项目计划' },
      ],
    },
    {
      key: 'issue-group',
      icon: <BugOutlined />,
      label: '问题管理',
      children: [
        { key: '/issue', label: '问题列表' },
        { key: '/issue/my', label: '我的问题' },
        { key: '/issue/statistics', label: '问题统计' },
      ],
    },
    {
      key: 'document-group',
      icon: <FolderOpenOutlined />,
      label: '文档中心',
      children: [
        { key: '/document', label: '项目文档' },
        { key: '/document/tag', label: '标签管理' },
      ],
    },
    {
      key: 'system-group',
      icon: <SettingOutlined />,
      label: '系统管理',
      children: [
        { key: '/system/user', label: '用户管理' },
        { key: '/system/role', label: '角色权限' },
        { key: '/system/config', label: '基础配置' },
      ],
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (!key.includes('-group')) {
      navigate(key);
    }
  };

  // 获取当前选中的菜单项
  const getSelectedKeys = () => {
    const path = location.pathname;
    // 处理动态路由
    if (path.startsWith('/project/') && !path.endsWith('/dashboard')) {
      return ['/project'];
    }
    if (path.startsWith('/device/') && path !== '/device/type') {
      return ['/device'];
    }
    if (path.startsWith('/plan/')) {
      return ['/plan'];
    }
    if (path === '/plan') {
      return ['/plan'];
    }
    if (path.startsWith('/issue/') && path !== '/issue/my' && path !== '/issue/statistics') {
      return ['/issue'];
    }
    if (path.startsWith('/document/') && path !== '/document/tag') {
      return ['/document'];
    }
    return [path];
  };

  // 获取当前展开的子菜单
  const getOpenKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/project')) return ['project-group'];
    if (path.startsWith('/device')) return ['device-group'];
    if (path.startsWith('/plan')) return ['plan-group'];
    if (path.startsWith('/issue')) return ['issue-group'];
    if (path.startsWith('/document')) return ['document-group'];
    if (path.startsWith('/system')) return ['system-group'];
    return [];
  };

  // 初始化展开的菜单
  React.useEffect(() => {
    setOpenKeys(getOpenKeys());
  }, [location.pathname]);

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      collapsedWidth={80}
      width={240}
      style={{
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
        overflow: 'hidden',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
      }}
      trigger={null}
    >
      {/* Logo区域 */}
      <div
        style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0',
          background: '#1890ff',
          flexShrink: 0,
        }}
      >
        {collapsed ? (
          <CloudServerOutlined style={{ fontSize: '28px', color: '#fff' }} />
        ) : (
          <Space size={8}>
            <CloudServerOutlined style={{ fontSize: '28px', color: '#fff' }} />
            <span style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}>
              数采管理系统
            </span>
          </Space>
        )}
      </div>

      <Menu
        mode="inline"
        selectedKeys={getSelectedKeys()}
        openKeys={openKeys}
        onOpenChange={(keys) => setOpenKeys(keys as string[])}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ borderRight: 0, flex: 1, overflow: 'auto' }}
      />
    </Sider>
  );
};

export default Sidebar;
