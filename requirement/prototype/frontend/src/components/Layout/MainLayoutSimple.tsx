import React from 'react';
import { Layout } from 'antd';

const { Content } = Layout;

const MainLayoutSimple: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '50px' }}>
        {children}
      </Content>
    </Layout>
  );
};

export default MainLayoutSimple;
