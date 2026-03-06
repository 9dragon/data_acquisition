import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Timeline, Progress, Tag, Button, Space, message, Modal } from 'antd';
import { CheckCircleOutlined, SyncOutlined, ClockCircleOutlined, EditOutlined, FastForwardOutlined, PlusOutlined } from '@ant-design/icons';
import PageHeader from '../../components/Common/PageHeader';
import StatusTag from '../../components/Common/StatusTag';
import QuickReportModal from '../../components/Plan/QuickReportModal';
import TaskFormModal from '../../components/Plan/TaskFormModal';
import TaskList from '../../components/Plan/TaskList';
import { getProjectById, mockDevices, mockProjectPlans } from '../../services/mockData';
import { ProjectTask } from '../../types/project';

const ProjectPlan: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [quickReportVisible, setQuickReportVisible] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);

  // 任务管理状态
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);

  // 使用 useMemo 动态计算设备和项目数据
  const project = useMemo(() => {
    if (!projectId) return null;
    return getProjectById(projectId) || null;
  }, [projectId]);

  const devices = useMemo(() => {
    if (!projectId) return [];
    return mockDevices.filter(d => d.projectId === projectId);
  }, [projectId]);

  // 打开快速填报
  const handleQuickReport = (device: any) => {
    setSelectedDevice(device);
    setQuickReportVisible(true);
  };

  // 批量填报
  const handleBatchReport = (stage: string) => {
    navigate(`/plan/batch-report/${projectId}/${stage}`);
  };

  // 快速填报提交
  const handleQuickReportSubmit = (data: any) => {
    message.success(`设备 ${selectedDevice?.name} 进度填报成功！`);
    // 这里可以添加更新设备数据的逻辑
  };

  // 从mock数据加载任务
  useEffect(() => {
    if (projectId) {
      const projectTasks = mockProjectPlans
        .filter(p => p.projectId === projectId)
        .flatMap(p => p.tasks);
      setTasks(projectTasks);
    }
  }, [projectId]);

  // 创建任务
  const handleCreateTask = () => {
    setEditingTask(null);
    setTaskModalVisible(true);
  };

  // 编辑任务
  const handleEditTask = (task: ProjectTask) => {
    setEditingTask(task);
    setTaskModalVisible(true);
  };

  // 删除任务
  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    message.success('任务删除成功');
  };

  // 任务表单提交
  const handleTaskSubmit = (taskData: any) => {
    if (editingTask) {
      // 编辑模式
      setTasks(tasks.map(t =>
        t.id === editingTask.id ? { ...t, ...taskData } : t
      ));
      message.success('任务更新成功');
    } else {
      // 新建模式
      const newTask: ProjectTask = {
        id: `task-${Date.now()}`,
        ...taskData,
      };
      setTasks([...tasks, newTask]);
      message.success('任务创建成功');
    }
    setTaskModalVisible(false);
    setEditingTask(null);
  };

  if (!project) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <h2>项目不存在</h2>
          <p style={{ color: '#666' }}>请检查项目ID是否正确</p>
        </div>
      </Card>
    );
  }

  // 实施阶段计划（动态计算）
  const implementationStages = useMemo(() => {
    const stages = [
      { key: 'planning', title: '准备阶段', tasks: [] as ProjectTask[] },
      { key: 'construction', title: '施工阶段', tasks: [] as ProjectTask[] },
      { key: 'configuration', title: '配置阶段', tasks: [] as ProjectTask[] },
      { key: 'verification', title: '核对阶段', tasks: [] as ProjectTask[] },
    ];

    // 按阶段分组任务
    tasks.forEach(task => {
      const stage = stages.find(s => s.key === task.stage);
      if (stage) {
        stage.tasks.push(task);
      }
    });

    // 计算每个阶段的进度
    return stages.map(stage => {
      const stageTasks = stage.tasks;
      const avgProgress = stageTasks.length > 0
        ? Math.round(stageTasks.reduce((sum, t) => sum + t.progress, 0) / stageTasks.length)
        : 0;
      const completedCount = stageTasks.filter(t => t.status === 'completed').length;
      const inProgressCount = stageTasks.filter(t => t.status === 'in_progress').length;
      const status = completedCount === stageTasks.length && stageTasks.length > 0 ? 'finish' :
                     inProgressCount > 0 ? 'process' : 'wait';

      // 计算日期范围
      let dateRange = '未设置';
      if (stageTasks.length > 0) {
        const sortedTasks = [...stageTasks].sort((a, b) =>
          a.startDate.localeCompare(b.startDate)
        );
        dateRange = `${sortedTasks[0].startDate} ~ ${sortedTasks[sortedTasks.length - 1].endDate}`;
      }

      return {
        ...stage,
        status,
        progress: avgProgress,
        date: dateRange,
      };
    });
  }, [tasks]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'finish':
        return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />;
      case 'process':
        return <SyncOutlined spin style={{ color: '#1890ff', fontSize: 16 }} />;
      case 'wait':
        return <ClockCircleOutlined style={{ color: '#d9d9d9', fontSize: 16 }} />;
      default:
        return <ClockCircleOutlined style={{ fontSize: 16 }} />;
    }
  };

  return (
    <Card>
      <PageHeader
        title={`${project.name} - 项目计划`}
        breadcrumbs={[
          { label: '项目管理', path: '/project' },
          { label: project.name, path: `/project/${projectId}` },
          { label: '项目计划' },
        ]}
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateTask}
            >
              创建任务
            </Button>
            <Button
              icon={<FastForwardOutlined />}
              onClick={() => {
                if (devices.length > 0) {
                  handleQuickReport(devices[0]);
                } else {
                  message.warning('暂无设备可填报');
                }
              }}
            >
              快速填报
            </Button>
            <Button
              type="primary"
              onClick={() => {
                // 选择批量填报的阶段
                message.info({
                  content: '请选择要批量填报的阶段',
                  duration: 3,
                });
              }}
            >
              批量填报
            </Button>
          </Space>
        }
      />

      <Row gutter={24}>
        <Col key="stages" span={16}>
          <Card title="实施阶段计划" bordered={false}>
            <div style={{ marginBottom: 16, color: '#666', fontSize: 14 }}>
              项目计划仅针对实施阶段（准备/施工/配置/核对），不包括售前调研和验收阶段
            </div>
            <Timeline mode="left">
              {implementationStages.map((stage) => (
                <Timeline.Item
                  key={stage.key}
                  label={stage.date}
                  dot={getStatusIcon(stage.status)}
                >
                  <div style={{ marginBottom: 16 }}>
                    <Space style={{ marginBottom: 8 }}>
                      <Tag key="tag" color={stage.status === 'finish' ? 'success' : stage.status === 'process' ? 'processing' : 'default'}>
                        {stage.title}
                      </Tag>
                      <span key="date" style={{ color: '#666' }}>{stage.date}</span>
                    </Space>
                    <Progress percent={stage.progress} style={{ marginBottom: 8 }} />
                    <TaskList
                      tasks={stage.tasks}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      stageTitle={stage.title}
                    />
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>

            {/* 批量填报快捷入口 */}
            <div style={{ marginTop: 24, padding: 16, background: '#f0f2f5', borderRadius: 4 }}>
              <div style={{ marginBottom: 12, fontWeight: 500 }}>批量填报快捷入口：</div>
              <Space wrap>
                <Button
                  key="preparation"
                  size="small"
                  onClick={() => handleBatchReport('planning')}
                >
                  批量填报准备阶段
                </Button>
                <Button
                  key="construction"
                  size="small"
                  onClick={() => handleBatchReport('construction')}
                >
                  批量填报施工阶段
                </Button>
                <Button
                  key="configuration"
                  size="small"
                  onClick={() => handleBatchReport('configuration')}
                >
                  批量填报配置阶段
                </Button>
                <Button
                  key="verification"
                  size="small"
                  onClick={() => handleBatchReport('verification')}
                >
                  批量填报核对阶段
                </Button>
              </Space>
            </div>
          </Card>
        </Col>

        <Col key="devices" span={8}>
          <Card
            title="设备进度概览"
            bordered={false}
            extra={
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  // 批量填报功能 - 可以选择多个设备
                  message.info('批量填报功能开发中，请点击单个设备填报');
                }}
              >
                批量填报
              </Button>
            }
          >
            <div style={{ maxHeight: 600, overflow: 'auto' }}>
              {devices.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                  暂无设备数据
                </div>
              ) : (
                devices.map((device) => (
                  <div key={device.id} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontWeight: 500, flex: 1 }}>{device.name}</span>
                      <Space size="small">
                        <StatusTag status={device.status} />
                        <Button
                          type="link"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => navigate(`/plan/report/${device.id}`)}
                        >
                          填报
                        </Button>
                      </Space>
                    </div>
                    <Progress
                      percent={device.progress}
                      size="small"
                      showInfo={true}
                      style={{ marginBottom: 4 }}
                    />
                    <div style={{ fontSize: 12, color: '#999' }}>
                      点位: {device.collectedPointCount}/{device.pointCount}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 快速填报弹窗 */}
      <QuickReportModal
        visible={quickReportVisible}
        device={selectedDevice}
        onClose={() => {
          setQuickReportVisible(false);
          setSelectedDevice(null);
        }}
        onSubmit={handleQuickReportSubmit}
      />

      {/* 任务表单弹窗 */}
      <TaskFormModal
        visible={taskModalVisible}
        task={editingTask}
        projectId={projectId || ''}
        allTasks={tasks}
        onClose={() => {
          setTaskModalVisible(false);
          setEditingTask(null);
        }}
        onSubmit={handleTaskSubmit}
      />
    </Card>
  );
};

export default ProjectPlan;
