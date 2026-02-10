import React, { useState } from 'react';
import { Card, Space, Button, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import PageHeader from '../../components/Common/PageHeader';
import DataTable from '../../components/Common/DataTable';
import { useDeviceStore } from '../../stores/deviceStore';
import { mockDeviceTypes } from '../../services/mockData';
import type { ColumnsType } from 'antd/es/table';
import type { DeviceType } from '../../types/device';

const DeviceTypeManage: React.FC = () => {
  const { deviceTypes, setDeviceTypes } = useDeviceStore();
  const [loading, setLoading] = useState(false);

  const categoryMap: Record<string, { text: string; color: string }> = {
    PLC: { text: 'PLC', color: 'blue' },
    CNC: { text: 'CNC', color: 'green' },
    Robot: { text: '机器人', color: 'purple' },
    Sensor: { text: '传感器', color: 'orange' },
    Instrument: { text: '仪表', color: 'cyan' },
    Other: { text: '其他', color: 'default' },
  };

  const collectionMethodMap: Record<string, string> = {
    OPC_UA: 'OPC UA',
    Modbus_TCP: 'Modbus TCP',
    Modbus_RTU: 'Modbus RTU',
    MQTT: 'MQTT',
    HTTP: 'HTTP',
    Other: '其他',
  };

  const columns: ColumnsType<DeviceType> = [
    {
      title: '类型编号',
      dataIndex: 'code',
      key: 'code',
      width: 180,
    },
    {
      title: '类型名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '设备分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string) => {
        const c = categoryMap[category] || { text: category, color: 'default' };
        return <Tag color={c.color}>{c.text}</Tag>;
      },
    },
    {
      title: '默认采集方式',
      dataIndex: 'defaultCollectionMethod',
      key: 'defaultCollectionMethod',
      width: 150,
      render: (method: string) => collectionMethodMap[method] || method,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 100,
      render: (time: string) => time?.split(' ')[0],
    },
  ];

  const actions = [
    {
      label: '编辑',
      onClick: (record: DeviceType) => console.log('编辑类型', record),
    },
    {
      label: '删除',
      onClick: (record: DeviceType) => console.log('删除类型', record),
      danger: true,
    },
  ];

  return (
    <Card>
      <PageHeader
        title="设备类型管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            新建类型
          </Button>
        }
      />

      <DataTable
        columns={columns}
        dataSource={mockDeviceTypes}
        actions={actions}
        loading={loading}
        rowKey="id"
      />
    </Card>
  );
};

export default DeviceTypeManage;
