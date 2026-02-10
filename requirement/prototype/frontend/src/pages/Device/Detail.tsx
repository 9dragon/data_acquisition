import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Drawer, Descriptions, Tag, Button, Space, Progress, Tabs, List } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import StatusTag from '../../components/Common/StatusTag';
import { useDeviceStore } from '../../stores/deviceStore';
import { getDeviceById, mockDocuments, mockIssues } from '../../services/mockData';
import type { Device } from '../../types/device';

const DeviceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentDevice, setCurrentDevice } = useDeviceStore();
  const [documents] = useState(mockDocuments.filter(d => d.deviceId === id));
  const [issues] = useState(mockIssues.filter(i => i.deviceId === id));

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

  const categoryMap: Record<string, string> = {
    PLC: 'PLC',
    CNC: 'CNC',
    Robot: '机器人',
    Sensor: '传感器',
    Instrument: '仪表',
    Other: '其他',
  };

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
          <Descriptions.Item label="设备类型">{device.typeName}</Descriptions.Item>
          <Descriptions.Item label="设备分类">
            <Tag color="blue">{categoryMap[device.category]}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="设备状态">
            <StatusTag status={device.status} />
          </Descriptions.Item>
          <Descriptions.Item label="采集方式">
            {collectionMethodMap[device.collectionMethod]}
          </Descriptions.Item>
          <Descriptions.Item label="IP地址">
            {device.ip || '-'}
          </Descriptions.Item>
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
          <Descriptions.Item label="负责人">
            {device.responsiblePerson || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="开始日期">
            {device.startDate || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="完成日期">
            {device.completedDate || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="点位进度" span={2}>
            <Space>
              <span key="count">{device.collectedPointCount}/{device.pointCount}</span>
              <Progress
                key="progress"
                percent={device.pointCount > 0 ? Math.round((device.collectedPointCount / device.pointCount) * 100) : 0}
                style={{ width: 200 }}
              />
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="总进度" span={2}>
            <Progress percent={device.progress} style={{ width: 200 }} />
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
