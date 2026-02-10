import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Timeline, Progress, Tag, Button, Space, message } from 'antd';
import { CheckCircleOutlined, SyncOutlined, ClockCircleOutlined, EditOutlined, FastForwardOutlined } from '@ant-design/icons';
import PageHeader from '../../components/Common/PageHeader';
import StatusTag from '../../components/Common/StatusTag';
import QuickReportModal from '../../components/Plan/QuickReportModal';
import { getProjectById, mockDevices } from '../../services/mockData';

const ProjectPlan: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [quickReportVisible, setQuickReportVisible] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);

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

  // 实施阶段计划（仅针对实施阶段：准备/施工/配置/核对）
  const implementationStages = [
    {
      key: 'preparation',
      title: '准备阶段',
      status: 'finish',
      date: '2024-02-01 ~ 2024-02-15',
      progress: 100,
      tasks: ['人员配置', '设备采购', '工具准备', '技术方案确认'],
    },
    {
      key: 'construction',
      title: '施工阶段',
      status: 'process',
      date: '2024-02-16 ~ 2024-04-15',
      progress: 60,
      tasks: ['设备安装', '网络布线', '硬件调试', '现场测试'],
    },
    {
      key: 'configuration',
      title: '配置阶段',
      status: 'wait',
      date: '2024-04-16 ~ 2024-05-15',
      progress: 0,
      tasks: ['点位配置', '协议配置', '状态逻辑配置', '采集测试'],
    },
    {
      key: 'verification',
      title: '核对阶段',
      status: 'wait',
      date: '2024-05-16 ~ 2024-05-31',
      progress: 0,
      tasks: ['数据核对', '准确性验证', '完整性检查', '问题修复'],
    },
  ];

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
                    <div>
                      {stage.tasks.map((task, index) => (
                        <Tag key={index} style={{ marginBottom: 4 }}>
                          {task}
                        </Tag>
                      ))}
                    </div>
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
                  onClick={() => handleBatchReport('preparation')}
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
    </Card>
  );
};

export default ProjectPlan;
