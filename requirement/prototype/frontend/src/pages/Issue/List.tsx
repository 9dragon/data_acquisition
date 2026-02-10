import React, { useState, useEffect } from 'react';
import { Card, Space, Button, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/Common/PageHeader';
import FilterBar from '../../components/Common/FilterBar';
import DataTable from '../../components/Common/DataTable';
import StatusTag from '../../components/Common/StatusTag';
import { useIssueStore } from '../../stores/issueStore';
import { mockIssues, mockProjects } from '../../services/mockData';
import type { ColumnsType } from 'antd/es/table';
import type { Issue } from '../../types/issue';

const IssueList: React.FC = () => {
  const navigate = useNavigate();
  const { issues, setIssues } = useIssueStore();
  const [loading, setLoading] = useState(false);

  // 初始化问题数据
  useEffect(() => {
    if (issues.length === 0) {
      setIssues(mockIssues);
    }
  }, []);

  const issuesWithProjectName = issues.map(issue => ({
    ...issue,
    projectName: mockProjects.find(p => p.id === issue.projectId)?.name || '',
  }));

  const filters = [
    { name: 'title', label: '问题标题', type: 'input' as const, placeholder: '请输入问题标题' },
    { name: 'code', label: '问题编号', type: 'input' as const, placeholder: '请输入问题编号' },
    { name: 'projectId', label: '所属项目', type: 'select' as const, placeholder: '请选择项目', options: [
      ...mockProjects.map(p => ({ label: p.name, value: p.id })),
    ]},
    { name: 'status', label: '问题状态', type: 'select' as const, placeholder: '请选择状态', options: [
      { label: '待处理', value: 'open' },
      { label: '已分配', value: 'assigned' },
      { label: '进行中', value: 'in_progress' },
      { label: '已解决', value: 'resolved' },
      { label: '已关闭', value: 'closed' },
    ]},
  ];

  const columns: ColumnsType<Issue> = [
    {
      title: '问题编号',
      dataIndex: 'code',
      key: 'code',
      width: 140,
      fixed: 'left',
    },
    {
      title: '问题标题',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      fixed: 'left',
    },
    {
      title: '所属项目',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 200,
    },
    {
      title: '问题类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const typeMap: Record<string, { text: string; color: string }> = {
          device: { text: '设备', color: 'blue' },
          plan: { text: '计划', color: 'green' },
          technical: { text: '技术', color: 'orange' },
          resource: { text: '资源', color: 'purple' },
          other: { text: '其他', color: 'default' },
        };
        const t = typeMap[type] || { text: type, color: 'default' };
        return <Tag color={t.color}>{t.text}</Tag>;
      },
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => <StatusTag status={status} />,
    },
    {
      title: '报告人',
      dataIndex: 'reporter',
      key: 'reporter',
      width: 120,
    },
    {
      title: '负责人',
      dataIndex: 'assignee',
      key: 'assignee',
      width: 120,
      render: (assignee: string) => assignee || '-',
    },
    {
      title: '设备',
      dataIndex: 'deviceName',
      key: 'deviceName',
      width: 150,
      render: (deviceName: string) => deviceName || '-',
    },
    {
      title: '截止日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
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
      onClick: (record: Issue) => navigate(`/issue/${record.id}`),
    },
    {
      label: '编辑',
      onClick: (record: Issue) => console.log('编辑问题', record),
    },
  ];

  const handleSearch = (values: any) => {
    setLoading(true);
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
        title="问题管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            创建问题
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
        dataSource={issuesWithProjectName}
        actions={actions}
        loading={loading}
        rowKey="id"
      />
    </Card>
  );
};

export default IssueList;
