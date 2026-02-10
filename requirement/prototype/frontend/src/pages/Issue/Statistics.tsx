import React from 'react';
import { Card, Row, Col, Statistic, Table } from 'antd';
import { BugOutlined, CheckCircleOutlined, ClockCircleOutlined, AlertOutlined } from '@ant-design/icons';
import { Column, Pie, Line } from '@ant-design/charts';
import PageHeader from '../../components/Common/PageHeader';
import { useIssueStore } from '../../stores/issueStore';
import { mockIssueStats } from '../../services/mockData';
import type { ColumnsType } from 'antd/es/table';

const IssueStatistics: React.FC = () => {
  const { issues } = useIssueStore();

  const stats = mockIssueStats;

  // 问题趋势数据（最近7天）
  const trendData = [
    { date: '01-29', type: '新增', value: 2 },
    { date: '01-29', type: '解决', value: 1 },
    { date: '01-30', type: '新增', value: 1 },
    { date: '01-30', type: '解决', value: 0 },
    { date: '01-31', type: '新增', value: 3 },
    { date: '01-31', type: '解决', value: 2 },
    { date: '02-01', type: '新增', value: 1 },
    { date: '02-01', type: '解决', value: 1 },
    { date: '02-02', type: '新增', value: 2 },
    { date: '02-02', type: '解决', value: 1 },
    { date: '02-03', type: '新增', value: 1 },
    { date: '02-03', type: '解决', value: 1 },
    { date: '02-04', type: '新增', value: 0 },
    { date: '02-04', type: '解决', value: 1 },
  ];

  // 问题类型分布
  const typeData = Object.entries(stats.byType).map(([key, value]) => ({
    type: key === 'device' ? '设备' : key === 'plan' ? '计划' : key === 'technical' ? '技术' : key === 'resource' ? '资源' : '其他',
    value,
  }));

  // 问题优先级分布
  const priorityData = Object.entries(stats.byPriority).map(([key, value]) => ({
    priority: key === 'low' ? '低' : key === 'medium' ? '中' : key === 'high' ? '高' : '紧急',
    value,
  }));

  // 问题状态分布
  const statusData = [
    { status: '待处理', value: stats.open },
    { status: '已分配', value: stats.assigned },
    { status: '进行中', value: stats.inProgress },
    { status: '已解决', value: stats.resolved },
    { status: '已关闭', value: stats.closed },
  ];

  const typeConfig = {
    data: typeData,
    xField: 'type',
    yField: 'value',
    label: {
      position: 'top' as const,
      style: { fill: '#000' },
    },
    meta: {
      type: { alias: '问题类型' },
      value: { alias: '数量' },
    },
  };

  const priorityConfig = {
    data: priorityData,
    angleField: 'value',
    colorField: 'priority',
    radius: 0.8,
    legend: {
      layout: 'vertical' as const,
      position: 'right' as const,
    },
  };

  const statusConfig = {
    data: statusData,
    angleField: 'value',
    colorField: 'status',
    radius: 0.8,
    legend: {
      layout: 'vertical' as const,
      position: 'right' as const,
    },
  };

  const trendConfig = {
    data: trendData,
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    legend: {
      position: 'top' as const,
    },
    meta: {
      date: { alias: '日期' },
      value: { alias: '数量' },
      type: { alias: '类型' },
    },
  };

  // 处理时效数据
  const timeData = [
    { issueId: 'ISSUE-2024-001', title: '注塑机02部分点位采集失败', resolutionTime: 48, status: '进行中' },
    { issueId: 'ISSUE-2024-002', title: '装配机器人OPC UA连接不稳定', resolutionTime: 0, status: '待处理' },
    { issueId: 'ISSUE-2024-003', title: 'CNC设备人员不足', resolutionTime: 72, status: '已分配' },
    { issueId: 'ISSUE-2024-004', title: '温控设备数据异常', resolutionTime: 24, status: '已解决' },
  ];

  const timeColumns: ColumnsType<any> = [
    { title: '问题编号', dataIndex: 'issueId', key: 'issueId' },
    { title: '问题标题', dataIndex: 'title', key: 'title' },
    { title: '处理时长(小时)', dataIndex: 'resolutionTime', key: 'resolutionTime' },
    { title: '状态', dataIndex: 'status', key: 'status' },
  ];

  return (
    <div>
      <PageHeader title="问题统计" />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col key="total" span={6}>
          <Card>
            <Statistic
              title="总问题数"
              value={stats.total}
              prefix={<BugOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col key="pending" span={6}>
          <Card>
            <Statistic
              title="待处理"
              value={stats.open + stats.assigned}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col key="progress" span={6}>
          <Card>
            <Statistic
              title="进行中"
              value={stats.inProgress}
              prefix={<AlertOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col key="resolved" span={6}>
          <Card>
            <Statistic
              title="已解决"
              value={stats.resolved + stats.closed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col key="type" span={12}>
          <Card title="问题类型分布">
            <Column {...typeConfig} height={300} />
          </Card>
        </Col>
        <Col key="priority" span={12}>
          <Card title="问题优先级分布">
            <Pie {...priorityConfig} height={300} />
          </Card>
        </Col>
        <Col key="status" span={12}>
          <Card title="问题状态分布">
            <Pie {...statusConfig} height={300} />
          </Card>
        </Col>
        <Col key="trend" span={12}>
          <Card title="问题趋势">
            <Line {...trendConfig} height={300} />
          </Card>
        </Col>
        <Col key="time" span={24}>
          <Card title={`处理时效统计 (平均: ${stats.avgResolutionTime}小时)`}>
            <Table columns={timeColumns} dataSource={timeData} pagination={false} size="small" />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default IssueStatistics;
