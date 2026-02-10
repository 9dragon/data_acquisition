import React, { useState, useEffect } from 'react';
import { Card, Tabs, Badge, Space, Button, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/Common/PageHeader';
import DataTable from '../../components/Common/DataTable';
import StatusTag from '../../components/Common/StatusTag';
import { useIssueStore } from '../../stores/issueStore';
import { mockIssues, mockProjects } from '../../services/mockData';
import type { ColumnsType } from 'antd/es/table';
import type { Issue } from '../../types/issue';

const MyIssue: React.FC = () => {
  const navigate = useNavigate();
  const { issues, setIssues } = useIssueStore();
  const [activeTab, setActiveTab] = useState('todo');

  // 初始化问题数据
  useEffect(() => {
    if (issues.length === 0) {
      setIssues(mockIssues);
    }
  }, []);

  const currentUserId = '2'; // 模拟当前用户ID

  // 待处理问题（分配给我但未完成）
  const todoIssues = issues.filter(
    issue => issue.assigneeId === currentUserId && issue.status !== 'resolved' && issue.status !== 'closed'
  );

  // 我提交的问题
  const mySubmittedIssues = issues.filter(issue => issue.reporterId === currentUserId);

  // 抄送给我
  const ccIssues = issues.filter(issue => issue.ccUsers?.includes(currentUserId));

  const issuesWithProjectName = (issueList: Issue[]) =>
    issueList.map(issue => ({
      ...issue,
      projectName: mockProjects.find(p => p.id === issue.projectId)?.name || '',
    }));

  const columns: ColumnsType<Issue> = [
    {
      title: '问题编号',
      dataIndex: 'code',
      key: 'code',
      width: 140,
    },
    {
      title: '问题标题',
      dataIndex: 'title',
      key: 'title',
      width: 250,
    },
    {
      title: '所属项目',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 200,
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
  ];

  const tabItems = [
    {
      key: 'todo',
      label: (
        <span>
          待处理
          <Badge count={todoIssues.length} style={{ marginLeft: 8 }} />
        </span>
      ),
      children: (
        <DataTable
          columns={columns}
          dataSource={issuesWithProjectName(todoIssues)}
          actions={actions}
          rowKey="id"
        />
      ),
    },
    {
      key: 'submitted',
      label: (
        <span>
          我提交的
          <Badge count={mySubmittedIssues.length} style={{ marginLeft: 8 }} />
        </span>
      ),
      children: (
        <DataTable
          columns={columns}
          dataSource={issuesWithProjectName(mySubmittedIssues)}
          actions={actions}
          rowKey="id"
        />
      ),
    },
    {
      key: 'cc',
      label: (
        <span>
          抄送给我
          <Badge count={ccIssues.length} style={{ marginLeft: 8 }} />
        </span>
      ),
      children: (
        <DataTable
          columns={columns}
          dataSource={issuesWithProjectName(ccIssues)}
          actions={actions}
          rowKey="id"
        />
      ),
    },
  ];

  return (
    <Card>
      <PageHeader
        title="我的问题"
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            创建问题
          </Button>
        }
      />

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
      />
    </Card>
  );
};

export default MyIssue;
