import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Progress, Input, Select } from 'antd';
import { SearchOutlined, EyeOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../../stores/projectStore';
import { mockProjects } from '../../services/mockData';
import type { ColumnsType } from 'antd/es/table';

interface ProjectRecord {
  key: string;
  id: string;
  code: string;
  name: string;
  stage: string;
  progress: number;
  deviceCount: number;
  completedDeviceCount: number;
  managerId: string;
  plannedEndDate: string;
}

const PlanList: React.FC = () => {
  const navigate = useNavigate();
  const { projects, setProjects } = useProjectStore();
  const [searchText, setSearchText] = useState('');
  const [stageFilter, setStageFilter] = useState<string | undefined>();

  // 初始化项目数据
  useEffect(() => {
    if (projects.length === 0) {
      setProjects(mockProjects);
    }
  }, []);

  // 过滤出实施阶段的项目（准备/施工/配置/核对）
  const implementationProjects = projects.filter(p =>
    ['planning', 'development', 'testing', 'verification'].includes(p.stage)
  );

  const getStageLabel = (stage: string) => {
    const stageMap: Record<string, { label: string; color: string }> = {
      planning: { label: '准备阶段', color: 'blue' },
      construction: { label: '施工阶段', color: 'processing' },
      configuration: { label: '配置阶段', color: 'orange' },
      verification: { label: '核对阶段', color: 'purple' },
    };
    return stageMap[stage] || { label: stage, color: 'default' };
  };

  const filteredProjects = implementationProjects
    .filter(p => {
      const matchSearch = !searchText ||
        p.name.toLowerCase().includes(searchText.toLowerCase()) ||
        p.code.toLowerCase().includes(searchText.toLowerCase());
      const matchStage = !stageFilter || p.stage === stageFilter;
      return matchSearch && matchStage;
    })
    .map(p => ({
      key: p.id,
      id: p.id,
      code: p.code,
      name: p.name,
      stage: p.stage,
      progress: p.progress,
      deviceCount: p.deviceCount,
      completedDeviceCount: p.completedDeviceCount,
      managerId: p.managerId,
      plannedEndDate: p.plannedEndDate,
    }));

  const columns: ColumnsType<ProjectRecord> = [
    {
      title: '项目编号',
      dataIndex: 'code',
      key: 'code',
      width: 150,
    },
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: '实施阶段',
      dataIndex: 'stage',
      key: 'stage',
      width: 120,
      render: (stage: string) => {
        const { label, color } = getStageLabel(stage);
        return <Tag color={color}>{label}</Tag>;
      },
      filters: [
        { text: '准备阶段', value: 'planning' },
        { text: '施工阶段', value: 'development' },
        { text: '配置阶段', value: 'testing' },
        { text: '核对阶段', value: 'verification' },
      ],
    },
    {
      title: '项目进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 200,
      render: (progress: number) => (
        <Progress percent={progress} size="small" />
      ),
    },
    {
      title: '设备进度',
      key: 'deviceProgress',
      width: 150,
      render: (_, record) => (
        <span style={{ fontSize: 12, color: '#666' }}>
          {record.completedDeviceCount}/{record.deviceCount}
        </span>
      ),
    },
    {
      title: '计划完成日期',
      dataIndex: 'plannedEndDate',
      key: 'plannedEndDate',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right' as const,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<CalendarOutlined />}
            onClick={() => navigate(`/plan/${record.id}`)}
          >
            项目计划
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/plan/gantt/${record.id}`)}
          >
            甘特图
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={
          <Space>
            <CalendarOutlined key="icon" />
            <span key="text">项目计划管理</span>
          </Space>
        }
        extra={
          <Space>
            <Input
              key="search"
              placeholder="搜索项目名称或编号"
              prefix={<SearchOutlined />}
              style={{ width: 250 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Space>
        }
      >
        <div style={{ marginBottom: 16, color: '#666', fontSize: 14 }}>
          本页面展示所有进入实施阶段的项目计划。项目计划仅针对实施阶段（准备/施工/配置/核对），不包括售前调研和验收阶段。
        </div>

        <Table
          columns={columns}
          dataSource={filteredProjects}
          pagination={{
            total: filteredProjects.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 个项目`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default PlanList;
