import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Drawer, Descriptions, Button, Space, Tabs, List, Card, Progress, Empty } from 'antd';
import { EditOutlined, FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useDeviceStore } from '../../stores/deviceStore';
import { getDeviceById, mockDocuments, mockIssues } from '../../services/mockData';
import type { Device } from '../../types/device';

const DeviceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentDevice, setCurrentDevice, getResearchByDeviceId, calculateResearchProgress } = useDeviceStore();
  const [documents] = useState(mockDocuments.filter(d => d.deviceId === id));
  const [issues] = useState(mockIssues.filter(i => i.deviceId === id));
  const [researchProgress, setResearchProgress] = useState(0);

  useEffect(() => {
    if (id) {
      const device = getDeviceById(id);
      if (device) {
        setCurrentDevice(device);

        // 获取调研进度
        const progress = calculateResearchProgress(id);
        setResearchProgress(progress);
      }
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      const device = getDeviceById(id);
      if (device) {
        setCurrentDevice(device);
      }
    }
  }, [id]);

  if (!currentDevice) {
    return <div>设备不存在</div>;
  }

  const device = currentDevice;

  const collectionMethodMap: Record<string, string> = {
    OPC_UA: 'OPC UA',
    Modbus_TCP: 'Modbus TCP',
    Modbus_RTU: 'Modbus RTU',
    MQTT: 'MQTT',
    HTTP: 'HTTP',
    Other: '其他',
  };

  const tabItems = [
    {
      key: 'basic',
      label: '基本信息',
      children: (
        <Descriptions bordered column={2}>
          <Descriptions.Item label="设备编号">{device.code}</Descriptions.Item>
          <Descriptions.Item label="设备名称">{device.name}</Descriptions.Item>
          <Descriptions.Item label="所属项目">{device.projectName}</Descriptions.Item>
          <Descriptions.Item label="所属车间">{device.workshop || '-'}</Descriptions.Item>
          <Descriptions.Item label="端口">
            {device.port || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="位置">
            {device.location || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="制造商">
            {device.manufacturer || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="型号">
            {device.model || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="序列号">
            {device.serialNumber || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="开始日期">
            {device.startDate || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="完成日期">
            {device.completedDate || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">{device.createTime}</Descriptions.Item>
          <Descriptions.Item label="更新时间">{device.updateTime}</Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: 'config',
      label: '采集配置',
      children: (
        <Descriptions bordered column={1}>
          <Descriptions.Item label="采集方式">
            {collectionMethodMap[device.collectionMethod]}
          </Descriptions.Item>
          <Descriptions.Item label="IP地址">
            {device.ip || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="端口">
            {device.port || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="连接配置">
            <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
              {JSON.stringify(device.connectionConfig || {}, null, 2)}
            </pre>
          </Descriptions.Item>
        </Descriptions>
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
                    <span key="dot">·</span>
                    <span key="type">{doc.type}</span>
                  </Space>
                }
              />
              <StatusTag status={doc.status} />
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
                    <span key="dot">·</span>
                    <span key="type">{issue.type}</span>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      ),
    },
    {
      key: 'research',
      label: `调研记录 (${researchProgress}%)`,
      children: (
        <Card>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* 进度概览 */}
            <div>
              <div style={{ marginBottom: 16, fontWeight: 500 }}>调研进度</div>
              <Progress
                percent={researchProgress}
                status={researchProgress === 100 ? 'success' : 'active'}
                strokeWidth={8}
              />
            </div>

            {/* 调研详情 */}
            {(() => {
              const research = getResearchByDeviceId(id || '');
              if (!research) {
                return (
                  <Empty
                    description="暂无调研记录"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                );
              }

              return (
                <div>
                  <div style={{ marginBottom: 16, fontWeight: 500 }}>调研详情</div>
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    {/* 基础信息状态 */}
                    <Card size="small">
                      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Space>
                          {research.basicCompleted ? (
                            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                          ) : (
                            <span style={{ color: '#d9d9d9', fontSize: 16 }}>○</span>
                          )}
                          <span>基础信息</span>
                        </Space>
                        <span style={{ color: research.basicCompleted ? '#52c41a' : '#999' }}>
                          {research.basicCompleted ? '已完成' : '未完成'}
                        </span>
                      </Space>
                    </Card>

                    {/* 控制器信息状态 */}
                    <Card size="small">
                      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Space>
                          {research.controllerCompleted ? (
                            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                          ) : (
                            <span style={{ color: '#d9d9d9', fontSize: 16 }}>○</span>
                          )}
                          <span>控制器信息</span>
                        </Space>
                        <span style={{ color: research.controllerCompleted ? '#52c41a' : '#999' }}>
                          {research.controllerCompleted ? '已完成' : '未完成'}
                        </span>
                      </Space>
                    </Card>

                    {/* 采集信息状态 */}
                    <Card size="small">
                      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Space>
                          {research.collectionCompleted ? (
                            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                          ) : (
                            <span style={{ color: '#d9d9d9', fontSize: 16 }}>○</span>
                          )}
                          <span>采集信息</span>
                        </Space>
                        <span style={{ color: research.collectionCompleted ? '#52c41a' : '#999' }}>
                          {research.collectionCompleted ? '已完成' : '未完成'}
                        </span>
                      </Space>
                    </Card>

                    {/* 调研人员信息 */}
                    {research.researcherName && (
                      <Card size="small">
                        <Space direction="vertical" style={{ width: '100%' }} size="small">
                          <div>
                            <span style={{ color: '#666' }}>调研人员： </span>
                            {research.researcherName}
                          </div>
                          {research.researchDate && (
                            <div>
                              <span style={{ color: '#666' }}>调研日期： </span>
                              {research.researchDate}
                            </div>
                          )}
                        </Space>
                      </Card>
                    )}
                  </Space>
                </div>
              );
            })()}

            {/* 操作按钮 */}
            <Button
              type="primary"
              icon={<FileTextOutlined />}
              onClick={() => navigate(`/device/research/${id}`)}
              block
            >
              {researchProgress > 0 ? '继续调研' : '开始调研'}
            </Button>
          </Space>
        </Card>
      ),
    },
  ];

  return (
    <Drawer
      title={device.name}
      placement="right"
      width={720}
      onClose={() => navigate(-1)}
      open={true}
      extra={
        <Button type="primary" icon={<EditOutlined />}>
          编辑设备
        </Button>
      }
    >
      <Tabs items={tabItems} />
    </Drawer>
  );
};

export default DeviceDetail;
