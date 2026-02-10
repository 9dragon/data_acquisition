import React, { useState } from 'react';
import { Card, Space, Button, Tag, Progress } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/Common/PageHeader';
import FilterBar from '../../components/Common/FilterBar';
import DataTable from '../../components/Common/DataTable';
import StatusTag from '../../components/Common/StatusTag';
import { useProjectStore } from '../../stores/projectStore';
import type { ColumnsType } from 'antd/es/table';
import type { Project } from '../../types/project';

const ProjectList: React.FC = () => {
  const navigate = useNavigate();
  const { projects } = useProjectStore();
  const [loading, setLoading] = useState(false);

  const filters = [
    { name: 'name', label: '项目名称', type: 'input' as const, placeholder: '请输入项目名称' },
    { name: 'code', label: '项目编号', type: 'input' as const, placeholder: '请输入项目编号' },
    { name: 'status', label: '项目状态', type: 'select' as const, placeholder: '请选择状态', options: [
      { label: '未开始', value: 'not_started' },
      { label: '进行中', value: 'in_progress' },
      { label: '已完成', value: 'completed' },
      { label: '暂停', value: 'on_hold' },
    ]},
    { name: 'stage', label: '项目阶段', type: 'select' as const, placeholder: '请选择阶段', options: [
      { label: '计划中', value: 'planning' },
      { label: '设计中', value: 'design' },
      { label: '开发中', value: 'development' },
      { label: '测试中', value: 'testing' },
      { label: '部署中', value: 'deployment' },
      { label: '已完成', value: 'completed' },
    ]},
  ];

  const columns: ColumnsType<Project> = [
    {
      title: '项目编号',
      dataIndex: 'code',
      key: 'code',
      width: 140,
      fixed: 'left',
    },
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left',
    },
    {
      title: '项目阶段',
      dataIndex: 'stage',
      key: 'stage',
      width: 120,
      render: (stage: string) => {
        const stageMap: Record<string, string> = {
          planning: '计划中',
          design: '设计中',
          development: '开发中',
          testing: '测试中',
          deployment: '部署中',
          completed: '已完成',
        };
        return <Tag color="blue">{stageMap[stage] || stage}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => <StatusTag status={status} />,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => {
        const priorityMap: Record<string, { text: string; color: string }> = {
          low: { text: '低', color: 'default' },
          medium: { text: '中', color: 'processing' },
          high: { text: '高', color: 'warning' },
          urgent: { text: '紧急', color: 'error' },
        };
        const p = priorityMap[priority] || { text: priority, color: 'default' };
        return <Tag color={p.color}>{p.text}</Tag>;
      },
    },
    {
      title: '项目经理',
      dataIndex: 'manager',
      key: 'manager',
      width: 120,
      render: (_, record) => record.manager || '张经理',
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 150,
      render: (progress: number) => (
        <Progress
          percent={progress}
          size="small"
          status={progress === 100 ? 'success' : undefined}
        />
      ),
    },
    {
      title: '设备进度',
      key: 'deviceProgress',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontSize: '12px' }}>
            {record.completedDeviceCount}/{record.deviceCount}
          </span>
          <Progress
            percent={record.deviceCount > 0 ? Math.round((record.completedDeviceCount / record.deviceCount) * 100) : 0}
            size="small"
            showInfo={false}
          />
        </Space>
      ),
    },
    {
      title: '计划结束日期',
      dataIndex: 'plannedEndDate',
      key: 'plannedEndDate',
      width: 120,
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
      label: '查看',
      onClick: (record: Project) => navigate(`/project/${record.id}`),
    },
    {
      label: '仪表盘',
      onClick: (record: Project) => navigate(`/project/${record.id}/dashboard`),
    },
  ];

  const handleSearch = (values: any) => {
    setLoading(true);
    // 模拟筛选
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const handleReset = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  return (
    <Card>
      <PageHeader
        title="项目管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            新建项目
          </Button>
        }
      />

      <FilterBar
        filters={filters}
        onSearch={handleSearch}
        onReset={handleReset}
        loading={loading}
      />

      <DataTable
        columns={columns}
        dataSource={projects}
        actions={actions}
        loading={loading}
        rowKey="id"
      />
    </Card>
  );
};

export default ProjectList;
