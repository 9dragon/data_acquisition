import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col, Card, Statistic, Progress, Tag } from 'antd';
import {
  ProjectOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BugOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { Column, Pie } from '@ant-design/charts';
import PageHeader from '../../components/Common/PageHeader';
import StatusTag from '../../components/Common/StatusTag';
import { useProjectStore } from '../../stores/projectStore';
import { mockDevices, mockIssues, mockDocuments, getProjectById } from '../../services/mockData';

const ProjectDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentProject, setCurrentProject } = useProjectStore();
  const [devices] = useState(mockDevices.filter(d => d.projectId === id));
  const [issues] = useState(mockIssues.filter(i => i.projectId === id));
  const [documents] = useState(mockDocuments.filter(d => d.projectId === id));

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

  // 问题状态分布数据
  const issueStatusData = [
    { status: '待处理', value: issues.filter(i => i.status === 'open').length },
    { status: '已分配', value: issues.filter(i => i.status === 'assigned').length },
    { status: '进行中', value: issues.filter(i => i.status === 'in_progress').length },
    { status: '已解决', value: issues.filter(i => i.status === 'resolved').length },
    { status: '已关闭', value: issues.filter(i => i.status === 'closed').length },
  ];

  // 设备状态分布数据
  const deviceStatusData = [
    { status: '未开始', value: devices.filter(d => d.status === 'not_started').length },
    { status: '进行中', value: devices.filter(d => d.status === 'in_progress').length },
    { status: '已完成', value: devices.filter(d => d.status === 'completed').length },
    { status: '异常', value: devices.filter(d => d.status === 'abnormal').length },
  ];

  // 文档类型分布数据
  const documentTypeData = [
    { type: '需求文档', value: documents.filter(d => d.type === 'requirement').length },
    { type: '设计文档', value: documents.filter(d => d.type === 'design').length },
    { type: '操作手册', value: documents.filter(d => d.type === 'manual').length },
    { type: '测试报告', value: documents.filter(d => d.type === 'test').length },
  ];

  const issueStatusConfig = {
    data: issueStatusData,
    angleField: 'value',
    colorField: 'status',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    legend: {
      layout: 'vertical',
      position: 'right',
    },
  };

  const deviceStatusConfig = {
    data: deviceStatusData,
    angleField: 'value',
    colorField: 'status',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    legend: {
      layout: 'vertical',
      position: 'right',
    },
  };

  const documentTypeConfig = {
    data: documentTypeData,
    xField: 'type',
    yField: 'value',
    label: {
      position: 'top',
      style: {
        fill: '#000',
      },
    },
    meta: {
      type: { alias: '文档类型' },
      value: { alias: '数量' },
    },
  };

  return (
    <div>
      <PageHeader
        title={`${project.name} - 仪表盘`}
        breadcrumbs={[
          { label: '项目管理', path: '/project' },
          { label: project.name, path: `/project/${id}` },
          { label: '仪表盘' },
        ]}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col key="progress" span={6}>
          <Card>
            <Statistic
              title="总进度"
              value={project.progress}
              suffix="%"
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress percent={project.progress} showInfo={false} style={{ marginTop: 16 }} />
          </Card>
        </Col>
        <Col key="devices" span={6}>
          <Card>
            <Statistic
              title="设备进度"
              value={devices.length > 0 ? Math.round((project.completedDeviceCount / project.deviceCount) * 100) : 0}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: 16, fontSize: 14, color: '#666' }}>
              {project.completedDeviceCount}/{project.deviceCount} 台
            </div>
          </Card>
        </Col>
        <Col key="issues" span={6}>
          <Card>
            <Statistic
              title="问题数量"
              value={issues.length}
              prefix={<BugOutlined />}
              valueStyle={{ color: issues.filter(i => i.status === 'open').length > 0 ? '#ff4d4f' : '#52c41a' }}
            />
            <div style={{ marginTop: 16 }}>
              {issues.map(issue => (
                <Tag key={issue.id} color="red" style={{ marginBottom: 4 }}>
                  {issue.title}
                </Tag>
              ))}
            </div>
          </Card>
        </Col>
        <Col key="documents" span={6}>
          <Card>
            <Statistic
              title="文档数量"
              value={documents.length}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ marginTop: 16, fontSize: 14, color: '#666' }}>
              已上传 {documents.length} 份文档
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col key="issue-chart" span={12}>
          <Card title="问题状态分布">
            <Pie {...issueStatusConfig} height={300} />
          </Card>
        </Col>
        <Col key="device-chart" span={12}>
          <Card title="设备状态分布">
            <Pie {...deviceStatusConfig} height={300} />
          </Card>
        </Col>
        <Col key="document-chart" span={24}>
          <Card title="文档类型分布">
            <Column {...documentTypeConfig} height={250} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProjectDashboard;
