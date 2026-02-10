import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Descriptions, Tag, Button, Space, Progress, Tabs, List, Badge } from 'antd';
import { EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import PageHeader from '../../components/Common/PageHeader';
import StatusTag from '../../components/Common/StatusTag';
import { useProjectStore } from '../../stores/projectStore';
import { mockDevices, mockIssues, mockDocuments, getProjectById } from '../../services/mockData';
import type { Project } from '../../types/project';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentProject, setCurrentProject } = useProjectStore();
  const [devices, setDevices] = useState(mockDevices.filter(d => d.projectId === id));
  const [issues, setIssues] = useState(mockIssues.filter(i => i.projectId === id));
  const [documents, setDocuments] = useState(mockDocuments.filter(d => d.projectId === id));

  useEffect(() => {
    if (id) {
      const project = getProjectById(id);
      if (project) {
        setCurrentProject(project);
      }
    }
  }, [id]);

  if (!currentProject) {
    return <div>项目不存在</div>;
  }

  const project = currentProject;

  const stageMap: Record<string, string> = {
    planning: '计划中',
    design: '设计中',
    development: '开发中',
    testing: '测试中',
    deployment: '部署中',
    completed: '已完成',
  };

  const priorityMap: Record<string, { text: string; color: string }> = {
    low: { text: '低', color: 'default' },
    medium: { text: '中', color: 'processing' },
    high: { text: '高', color: 'warning' },
    urgent: { text: '紧急', color: 'error' },
  };

  const priority = priorityMap[project.priority] || { text: project.priority, color: 'default' };

  const tabItems = [
    {
      key: 'overview',
      label: '基本信息',
      children: (
        <Descriptions bordered column={2}>
          <Descriptions.Item label="项目编号">{project.code}</Descriptions.Item>
          <Descriptions.Item label="项目名称">{project.name}</Descriptions.Item>
          <Descriptions.Item label="项目阶段">
            <Tag color="blue">{stageMap[project.stage]}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="项目状态">
            <StatusTag status={project.status} />
          </Descriptions.Item>
          <Descriptions.Item label="优先级">
            <Tag color={priority.color}>{priority.text}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="项目经理">{project.manager || '张经理'}</Descriptions.Item>
          <Descriptions.Item label="开始日期">{project.startDate}</Descriptions.Item>
          <Descriptions.Item label="计划结束日期">{project.plannedEndDate}</Descriptions.Item>
          <Descriptions.Item label="实际结束日期">
            {project.endDate || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="项目进度">
            <Progress percent={project.progress} style={{ width: 200 }} />
          </Descriptions.Item>
          <Descriptions.Item label="设备进度" span={2}>
            <Space>
              <span key="count">{project.completedDeviceCount}/{project.deviceCount}</span>
              <Progress
                key="progress"
                percent={project.deviceCount > 0 ? Math.round((project.completedDeviceCount / project.deviceCount) * 100) : 0}
                style={{ width: 200 }}
              />
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="项目描述" span={2}>
            {project.description || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">{project.createTime}</Descriptions.Item>
          <Descriptions.Item label="更新时间">{project.updateTime}</Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: 'devices',
      label: `关联设备 (${devices.length})`,
      children: (
        <List
          dataSource={devices}
          renderItem={(device) => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  onClick={() => navigate(`/device/${device.id}`)}
                >
                  查看详情
                </Button>
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <span key="name">{device.name}</span>
                    <StatusTag key="status" status={device.status} />
                  </Space>
                }
                description={
                  <Space>
                    <span key="code">{device.code}</span>
                    <span key="dot1">·</span>
                    <span key="type">{device.typeName}</span>
                    <span key="dot2">·</span>
                    <span key="progress">进度: {device.progress}%</span>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      ),
    },
    {
      key: 'issues',
      label: `关联问题 (${issues.length})`,
      children: (
        <List
          dataSource={issues}
          renderItem={(issue) => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  onClick={() => navigate(`/issue/${issue.id}`)}
                >
                  查看详情
                </Button>
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <span key="title">{issue.title}</span>
                    <StatusTag key="status" status={issue.status} />
                  </Space>
                }
                description={
                  <Space>
                    <span key="code">{issue.code}</span>
                    <span key="dot1">·</span>
                    <span key="type">{issue.type}</span>
                    <span key="dot2">·</span>
                    <span key="assignee">{issue.assignee || '未分配'}</span>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      ),
    },
    {
      key: 'documents',
      label: `关联文档 (${documents.length})`,
      children: (
        <List
          dataSource={documents}
          renderItem={(doc) => (
            <List.Item>
              <List.Item.Meta
                title={doc.name}
                description={
                  <Space>
                    <span key="code">{doc.code}</span>
                    <span key="dot1">·</span>
                    <span key="type">{doc.type}</span>
                    <span key="dot2">·</span>
                    <span key="version">{doc.version}</span>
                  </Space>
                }
              />
              <StatusTag status={doc.status} />
            </List.Item>
          )}
        />
      ),
    },
  ];

  return (
    <Card>
      <PageHeader
        title={project.name}
        breadcrumbs={[
          { label: '项目管理', path: '/project' },
          { label: project.name },
        ]}
        showBack
        extra={
          <Button type="primary" icon={<EditOutlined />}>
            编辑项目
          </Button>
        }
      />

      <Tabs items={tabItems} />
    </Card>
  );
};

export default ProjectDetail;
