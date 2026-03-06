import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Progress, Input, Select } from 'antd';
import { SearchOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../../stores/projectStore';
import { mockProjects } from '../../services/mockData';
import { useStageStore } from '../../stores/stageStore';
import { mockStageDefinitions } from '../../services/mockData';
import type { ColumnsType } from 'antd/es/table';
import StatusTag from '../../components/Common/StatusTag';
import ProgressReportModal from '../../components/Progress/ProgressReportModal';
import { Project } from '../../types/project';

interface ProjectRecord {
  key: string;
  id: string;
  code: string;
  name: string;
  stage: string;
  status: string;
  progress: number;
  deviceCount: number;
  completedDeviceCount: number;
  managerId: string;
  startDate: string;
  endDate?: string;
  plannedEndDate: string;
}

const ProgressList: React.FC = () => {
  const navigate = useNavigate();
  const { projects, setProjects } = useProjectStore();
  const { stageDefinitions, setStageDefinitions } = useStageStore();
  const [searchText, setSearchText] = useState('');
  const [stageFilter, setStageFilter] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // 初始化数据
  useEffect(() => {
    if (projects.length === 0) {
      setProjects(mockProjects);
    }
    if (stageDefinitions.length === 0) {
      setStageDefinitions(mockStageDefinitions);
    }
  }, []);

  // 过滤出实施阶段的项目（准备/施工/配置/核对）
  const implementationProjects = projects.filter(p =>
    ['planning', 'construction', 'configuration', 'verification'].includes(p.stage)
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
      status: p.status,
      progress: p.progress,
      deviceCount: p.deviceCount,
      completedDeviceCount: p.completedDeviceCount,
      managerId: p.managerId,
      startDate: p.startDate,
      endDate: p.endDate,
      plannedEndDate: p.plannedEndDate,
    }));

  const handleReportProgress = (record: ProjectRecord) => {
    const project = projects.find(p => p.id === record.id);
    if (project) {
      setSelectedProject(project);
      setReportModalVisible(true);
    }
  };

  const handleCloseModal = () => {
    setReportModalVisible(false);
    setSelectedProject(null);
  };

  const columns: ColumnsType<ProjectRecord> = [
    {
      title: '项目编号',
      dataIndex: 'code',
      key: 'code',
      width: 130,
      fixed: 'left',
    },
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      fixed: 'left',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: string) => <StatusTag status={status} />,
    },
    {
      title: '实施阶段',
      dataIndex: 'stage',
      key: 'stage',
      width: 100,
      render: (stage: string) => {
        const { label, color } = getStageLabel(stage);
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: '项目整体进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 160,
      render: (progress: number) => (
        <div>
          <Progress
            percent={progress}
            size="small"
            status={progress === 100 ? 'success' : undefined}
          />
          <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
            自动计算
          </div>
        </div>
      ),
    },
    {
      title: '各阶段完成情况',
      key: 'stageProgress',
      width: 200,
      render: (_, record) => {
        const project = projects.find(p => p.id === record.id);
        if (!project || !project.stageConfigs || project.stageConfigs.length === 0) return '-';

        return (
          <div style={{ fontSize: 12 }}>
            {project.stageConfigs.map((config, index) => {
              const stageInfo = getStageLabel(config.stageKey);
              const progress = config.actualProgress || 0;
              const statusMap: Record<string, { text: string; color: string }> = {
                not_started: { text: '未开始', color: '#d9d9d9' },
                in_progress: { text: '进行中', color: '#1890ff' },
                completed: { text: '已完成', color: '#52c41a' },
              };
              const statusInfo = statusMap[config.status || 'not_started'];

              return (
                <div
                  key={config.stageKey}
                  style={{
                    marginBottom: index < project.stageConfigs!.length - 1 ? 4 : 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ color: '#666', flex: 1, minWidth: 60 }}>
                    {stageInfo.label}
                  </span>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Progress
                      percent={progress}
                      size="small"
                      showInfo={false}
                      style={{ flex: 1, minWidth: 40 }}
                    />
                    <span style={{ fontSize: 11, color: '#999', minWidth: 30 }}>
                      {progress}%
                    </span>
                    <Tag
                      color={statusInfo.color}
                      style={{ margin: 0, fontSize: 10, padding: '0 4px' }}
                    >
                      {statusInfo.text}
                    </Tag>
                  </div>
                </div>
              );
            })}
          </div>
        );
      },
    },
    {
      title: '实际开始日期',
      dataIndex: 'startDate',
      key: 'actualStartDate',
      width: 105,
    },
    {
      title: '实际完成日期',
      dataIndex: 'endDate',
      key: 'actualEndDate',
      width: 105,
      render: (date: string) => date || '-',
    },
    {
      title: '计划完成日期',
      dataIndex: 'plannedEndDate',
      key: 'plannedEndDate',
      width: 105,
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right' as const,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/project/${record.id}`)}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleReportProgress(record)}
          >
            填报
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
            <CheckCircleOutlined />
            <span>项目进度管理</span>
          </Space>
        }
        extra={
          <Space>
            <Input
              placeholder="搜索项目名称或编号"
              prefix={<SearchOutlined />}
              style={{ width: 250 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
            <Select
              placeholder="筛选阶段"
              style={{ width: 120 }}
              value={stageFilter}
              onChange={setStageFilter}
              allowClear
            >
              <Select.Option value="planning">准备阶段</Select.Option>
              <Select.Option value="construction">施工阶段</Select.Option>
              <Select.Option value="configuration">配置阶段</Select.Option>
              <Select.Option value="verification">核对阶段</Select.Option>
            </Select>
          </Space>
        }
      >
        <div style={{ marginBottom: 16, color: '#666', fontSize: 14 }}>
          本页面用于快速填报和查看项目进度。项目进度将根据各阶段完成情况自动计算。
          各阶段可并行推进，支持按任务或按设备填报进度。
        </div>

        <Table
          columns={columns}
          dataSource={filteredProjects}
          loading={loading}
          pagination={{
            total: filteredProjects.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 个项目`,
          }}
        />
      </Card>

      {/* 新的进度填报模态框 */}
      <ProgressReportModal
        visible={reportModalVisible}
        project={selectedProject}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default ProgressList;
