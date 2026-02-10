import React, { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const { Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <>
      <Sidebar collapsed={collapsed} />
      <Header collapsed={collapsed} onToggle={toggleCollapsed} />
      <Layout
        style={{
          marginLeft: collapsed ? 80 : 240,
          paddingTop: 64,
          transition: 'margin-left 0.2s',
        }}
      >
        <Content
          style={{
            margin: '16px',
            marginLeft: 0,
            marginTop: 0,
            padding: '16px',
            background: '#f0f2f5',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </>
  );
};

export default MainLayout;
