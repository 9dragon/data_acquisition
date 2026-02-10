import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Space, Timeline, List, Avatar } from 'antd';
import { UserOutlined, ClockCircleOutlined, EditOutlined } from '@ant-design/icons';
import PageHeader from '../../components/Common/PageHeader';
import StatusTag from '../../components/Common/StatusTag';
import { getIssueById } from '../../services/mockData';
import { useIssueStore } from '../../stores/issueStore';
import type { Issue } from '../../types/issue';

const IssueDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentIssue, setCurrentIssue } = useIssueStore();

  useEffect(() => {
    if (id) {
      const issue = getIssueById(id);
      if (issue) {
        setCurrentIssue(issue);
      }
    }
  }, [id]);

  if (!currentIssue) {
    return <div>问题不存在</div>;
  }

  const issue = currentIssue;

  const typeMap: Record<string, { text: string; color: string }> = {
    device: { text: '设备', color: 'blue' },
    plan: { text: '计划', color: 'green' },
    technical: { text: '技术', color: 'orange' },
    resource: { text: '资源', color: 'purple' },
    other: { text: '其他', color: 'default' },
  };

  const priorityMap: Record<string, { text: string; color: string }> = {
    low: { text: '低', color: 'default' },
    medium: { text: '中', color: 'processing' },
    high: { text: '高', color: 'warning' },
    urgent: { text: '紧急', color: 'error' },
  };

  const type = typeMap[issue.type] || { text: issue.type, color: 'default' };
  const priority = priorityMap[issue.priority] || { text: issue.priority, color: 'default' };

  // 模拟处理记录
  const statusHistory = [
    {
      id: '1',
      status: 'open',
      statusText: '待处理',
      operator: '李工程师',
      time: '2024-02-02 10:00:00',
      remark: '创建问题',
    },
    {
      id: '2',
      status: 'in_progress',
      statusText: '进行中',
      operator: '李工程师',
      time: '2024-02-02 14:30:00',
      remark: '开始处理问题',
    },
  ];

  return (
    <Card>
      <PageHeader
        title={issue.title}
        breadcrumbs={[
          { label: '问题管理', path: '/issue' },
          { label: issue.title },
        ]}
        showBack
        extra={
          <Button type="primary" icon={<EditOutlined />}>
            编辑问题
          </Button>
        }
      />

      <Card title="基本信息" style={{ marginBottom: 16 }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="问题编号">{issue.code}</Descriptions.Item>
          <Descriptions.Item label="问题标题" span={2}>{issue.title}</Descriptions.Item>
          <Descriptions.Item label="问题类型">
            <Tag color={type.color}>{type.text}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="优先级">
            <Tag color={priority.color}>{priority.text}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="问题状态">
            <StatusTag status={issue.status} />
          </Descriptions.Item>
          <Descriptions.Item label="所属项目">{issue.projectName}</Descriptions.Item>
          <Descriptions.Item label="关联设备">{issue.deviceName || '-'}</Descriptions.Item>
          <Descriptions.Item label="报告人">{issue.reporter}</Descriptions.Item>
          <Descriptions.Item label="负责人">{issue.assignee || '未分配'}</Descriptions.Item>
          <Descriptions.Item label="截止日期">{issue.dueDate || '-'}</Descriptions.Item>
          <Descriptions.Item label="解决时间">{issue.resolvedAt || '-'}</Descriptions.Item>
          <Descriptions.Item label="关闭时间">{issue.closedAt || '-'}</Descriptions.Item>
          <Descriptions.Item label="问题描述" span={2}>
            {issue.description || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">{issue.createTime}</Descriptions.Item>
          <Descriptions.Item label="更新时间">{issue.updateTime}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="处理记录">
        <Timeline>
          {statusHistory.map((item) => (
            <Timeline.Item key={item.id}>
              <div>
                <Space>
                  <strong key="operator">{item.operator}</strong>
                  <span key="time" style={{ color: '#999' }}>{item.time}</span>
                </Space>
                <div style={{ marginTop: 4 }}>
                  <StatusTag status={item.status} />
                  <span style={{ marginLeft: 8 }}>{item.remark}</span>
                </div>
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>
    </Card>
  );
};

export default IssueDetail;
