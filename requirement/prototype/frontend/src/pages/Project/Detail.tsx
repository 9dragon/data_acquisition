import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Descriptions, Tag, Button, Space, Progress, Tabs, List, Table } from 'antd';
import { EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import PageHeader from '../../components/Common/PageHeader';
import StatusTag from '../../components/Common/StatusTag';
import { useProjectStore } from '../../stores/projectStore';
import { useStageStore } from '../../stores/stageStore';
import { mockDevices, mockIssues, mockDocuments, getProjectById } from '../../services/mockData';
import { getDeviceCurrentStage } from '../../utils/deviceStageHelper';
import { getStageStatusText, formatReportDate } from '../../utils/progressCalculators';
import type { Project } from '../../types/project';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentProject, setCurrentProject } = useProjectStore();
  const { getStageByKey } = useStageStore();
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
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* 项目基本信息 */}
          <Descriptions bordered column={2}>
            <Descriptions.Item label="项目编号">{project.code}</Descriptions.Item>
            <Descriptions.Item label="项目名称">{project.name}</Descriptions.Item>
            <Descriptions.Item label="项目状态">
              <StatusTag status={project.status} />
            </Descriptions.Item>
            <Descriptions.Item label="优先级">
              <Tag color={priority.color}>{priority.text}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="项目经理">{project.manager || '张经理'}</Descriptions.Item>
            <Descriptions.Item label="团队成员">
              {project.members?.map(m => <Tag key={m.id}>{m.name}</Tag>)}
            </Descriptions.Item>
            <Descriptions.Item label="开始日期">{project.startDate}</Descriptions.Item>
            <Descriptions.Item label="计划结束日期">{project.plannedEndDate}</Descriptions.Item>
            <Descriptions.Item label="实际结束日期">
              {project.endDate || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="项目描述" span={2}>
              {project.description || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">{project.createTime}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{project.updateTime}</Descriptions.Item>
          </Descriptions>

          {/* 项目计划和实际进度 */}
          <Card title="项目计划和实际进度" size="small">
            <Table
              columns={[
                { title: '阶段名称', dataIndex: 'stageName', key: 'stageName' },
                { title: '权重', dataIndex: 'weight', key: 'weight', render: (w: number) => `${w}%` },
                { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <StatusTag status={s} /> },
                { title: '实际进度', dataIndex: 'actualProgress', key: 'actualProgress', render: (p: number) => `${p}%` },
                { title: '负责人', dataIndex: 'managerId', key: 'managerId', render: (id: string) => {
                  const managers: Record<string, string> = {
                    '1': '张经理',
                    '2': '李工程师',
                    '3': '王工程师',
                    '4': '赵工程师',
                    '5': '刘工程师',
                  };
                  return managers[id] || '-';
                }},
                { title: '最后填报', dataIndex: 'lastReportDate', key: 'lastReportDate', render: (d: string) => formatReportDate(d) },
              ]}
              dataSource={project.stageConfigs?.map(config => {
                const stageDef = getStageByKey(config.stageKey);
                return {
                  key: config.stageKey,
                  stageName: stageDef?.name || config.stageKey,
                  ...config,
                };
              }) || []}
              pagination={false}
              size="small"
            />
          </Card>
        </Space>
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
                    <Tag key="currentStage" color="blue">
                      {getDeviceCurrentStage(device.id, project.stageConfigs)}
                    </Tag>
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
