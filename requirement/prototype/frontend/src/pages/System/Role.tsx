import React, { useState } from 'react';
import { Card, Space, Button, Tag, Drawer, Checkbox, Tree, message } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import PageHeader from '../../components/Common/PageHeader';
import DataTable from '../../components/Common/DataTable';
import type { ColumnsType } from 'antd/es/table';

interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  userCount: number;
  createTime: string;
}

const RoleManage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const mockRoles: Role[] = [
    {
      id: '1',
      name: '系统管理员',
      code: 'admin',
      description: '拥有系统所有权限',
      userCount: 1,
      createTime: '2024-01-01 10:00:00',
    },
    {
      id: '2',
      name: '项目经理',
      code: 'manager',
      description: '负责项目管理和协调',
      userCount: 3,
      createTime: '2024-01-01 10:00:00',
    },
    {
      id: '3',
      name: '工程师',
      code: 'engineer',
      description: '负责设备开发和实施',
      userCount: 5,
      createTime: '2024-01-01 10:00:00',
    },
    {
      id: '4',
      name: '测试员',
      code: 'tester',
      description: '负责测试和验收',
      userCount: 1,
      createTime: '2024-01-01 10:00:00',
    },
  ];

  // 权限树数据
  const permissionTreeData = [
    {
      title: '项目管理',
      key: 'project',
      children: [
        { title: '查看项目', key: 'project:view' },
        { title: '创建项目', key: 'project:create' },
        { title: '编辑项目', key: 'project:edit' },
        { title: '删除项目', key: 'project:delete' },
      ],
    },
    {
      title: '设备管理',
      key: 'device',
      children: [
        { title: '查看设备', key: 'device:view' },
        { title: '创建设备', key: 'device:create' },
        { title: '编辑设备', key: 'device:edit' },
        { title: '删除设备', key: 'device:delete' },
      ],
    },
    {
      title: '计划管理',
      key: 'plan',
      children: [
        { title: '查看计划', key: 'plan:view' },
        { title: '编辑计划', key: 'plan:edit' },
        { title: '填报进度', key: 'plan:report' },
      ],
    },
    {
      title: '问题管理',
      key: 'issue',
      children: [
        { title: '查看问题', key: 'issue:view' },
        { title: '创建问题', key: 'issue:create' },
        { title: '处理问题', key: 'issue:handle' },
        { title: '删除问题', key: 'issue:delete' },
      ],
    },
    {
      title: '文档管理',
      key: 'document',
      children: [
        { title: '查看文档', key: 'document:view' },
        { title: '上传文档', key: 'document:upload' },
        { title: '编辑文档', key: 'document:edit' },
        { title: '删除文档', key: 'document:delete' },
      ],
    },
    {
      title: '系统管理',
      key: 'system',
      children: [
        { title: '用户管理', key: 'system:user' },
        { title: '角色管理', key: 'system:role' },
        { title: '基础配置', key: 'system:config' },
      ],
    },
  ];

  const columns: ColumnsType<Role> = [
    {
      title: '角色编号',
      dataIndex: 'code',
      key: 'code',
      width: 140,
    },
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '用户数量',
      dataIndex: 'userCount',
      key: 'userCount',
      width: 100,
      render: (count: number) => <Tag color="blue">{count} 人</Tag>,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 100,
      render: (time: string) => time?.split(' ')[0],
    },
  ];

  const actions = [
    {
      label: '权限配置',
      onClick: (record: Role) => {
        setSelectedRole(record);
        setDrawerVisible(true);
      },
    },
    {
      label: '编辑',
      onClick: (record: Role) => {
        console.log('编辑角色', record);
      },
    },
  ];

  return (
    <Card>
      <PageHeader
        title="角色权限管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            新建角色
          </Button>
        }
      />

      <DataTable
        columns={columns}
        dataSource={mockRoles}
        actions={actions}
        loading={loading}
        rowKey="id"
      />

      <Drawer
        title={`${selectedRole?.name} - 权限配置`}
        placement="right"
        width={720}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        extra={
          <Button type="primary" onClick={() => { message.success('保存成功'); setDrawerVisible(false); }}>
            保存
          </Button>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <p style={{ color: '#666', marginBottom: 16 }}>
            勾选相应的权限后，该角色下的用户将拥有对应的操作权限
          </p>
        </div>

        <Tree
          checkable
          defaultExpandAll
          treeData={permissionTreeData}
          style={{ background: '#fafafa', padding: 16, borderRadius: 4 }}
        />
      </Drawer>
    </Card>
  );
};

export default RoleManage;
