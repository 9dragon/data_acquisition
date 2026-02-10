import React, { useState, useEffect } from 'react';
import { Card, Space, Button, Tag, Progress } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/Common/PageHeader';
import FilterBar from '../../components/Common/FilterBar';
import DataTable from '../../components/Common/DataTable';
import StatusTag from '../../components/Common/StatusTag';
import { useDeviceStore } from '../../stores/deviceStore';
import { mockDevices, mockProjects } from '../../services/mockData';
import type { ColumnsType } from 'antd/es/table';
import type { Device } from '../../types/device';

const DeviceList: React.FC = () => {
  const navigate = useNavigate();
  const { devices, setDevices } = useDeviceStore();
  const [loading, setLoading] = useState(false);

  // 初始化设备数据
  useEffect(() => {
    if (devices.length === 0) {
      setDevices(mockDevices);
    }
  }, []);

  // 添加项目名称到设备数据
  const devicesWithProjectName = devices.map(device => ({
    ...device,
    projectName: mockProjects.find(p => p.id === device.projectId)?.name || '',
  }));

  const filters = [
    { name: 'name', label: '设备名称', type: 'input' as const, placeholder: '请输入设备名称' },
    { name: 'code', label: '设备编号', type: 'input' as const, placeholder: '请输入设备编号' },
    { name: 'projectId', label: '所属项目', type: 'select' as const, placeholder: '请选择项目', options: [
      ...mockProjects.map(p => ({ label: p.name, value: p.id })),
    ]},
    { name: 'category', label: '设备分类', type: 'select' as const, placeholder: '请选择分类', options: [
      { label: 'PLC', value: 'PLC' },
      { label: 'CNC', value: 'CNC' },
      { label: 'Robot', value: 'Robot' },
      { label: 'Sensor', value: 'Sensor' },
      { label: 'Instrument', value: 'Instrument' },
      { label: 'Other', value: 'Other' },
    ]},
  ];

  const columns: ColumnsType<Device> = [
    {
      title: '设备编号',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      fixed: 'left',
    },
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      fixed: 'left',
    },
    {
      title: '所属项目',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 200,
    },
    {
      title: '设备类型',
      dataIndex: 'typeName',
      key: 'typeName',
      width: 150,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => {
        const categoryMap: Record<string, { text: string; color: string }> = {
          PLC: { text: 'PLC', color: 'blue' },
          CNC: { text: 'CNC', color: 'green' },
          Robot: { text: '机器人', color: 'purple' },
          Sensor: { text: '传感器', color: 'orange' },
          Instrument: { text: '仪表', color: 'cyan' },
          Other: { text: '其他', color: 'default' },
        };
        const c = categoryMap[category] || { text: category, color: 'default' };
        return <Tag color={c.color}>{c.text}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => <StatusTag status={status} />,
    },
    {
      title: '采集方式',
      dataIndex: 'collectionMethod',
      key: 'collectionMethod',
      width: 120,
      render: (method: string) => {
        const methodMap: Record<string, string> = {
          OPC_UA: 'OPC UA',
          Modbus_TCP: 'Modbus TCP',
          Modbus_RTU: 'Modbus RTU',
          MQTT: 'MQTT',
          HTTP: 'HTTP',
          Other: '其他',
        };
        return methodMap[method] || method;
      },
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 140,
    },
    {
      title: '点位进度',
      key: 'pointProgress',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontSize: '12px' }}>
            {record.collectedPointCount}/{record.pointCount}
          </span>
          <Progress
            percent={record.pointCount > 0 ? Math.round((record.collectedPointCount / record.pointCount) * 100) : 0}
            size="small"
            showInfo={false}
          />
        </Space>
      ),
    },
    {
      title: '总进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 120,
      render: (progress: number) => (
        <Progress
          percent={progress}
          size="small"
          status={progress === 100 ? 'success' : undefined}
        />
      ),
    },
    {
      title: '负责人',
      dataIndex: 'responsiblePerson',
      key: 'responsiblePerson',
      width: 120,
    },
  ];

  const actions = [
    {
      label: '查看',
      onClick: (record: Device) => navigate(`/device/${record.id}`),
    },
    {
      label: '填报进度',
      onClick: (record: Device) => navigate(`/plan/report/${record.id}`),
    },
    {
      label: '编辑',
      onClick: (record: Device) => console.log('编辑设备', record),
    },
  ];

  const handleSearch = (values: any) => {
    setLoading(true);
    // 模拟筛选
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const handleReset = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  return (
    <Card>
      <PageHeader
        title="设备管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            新建设备
          </Button>
        }
      />

      <FilterBar
        filters={filters}
        onSearch={handleSearch}
        onReset={handleReset}
        loading={loading}
      />

      <DataTable
        columns={columns}
        dataSource={devicesWithProjectName}
        actions={actions}
        loading={loading}
        rowKey="id"
      />
    </Card>
  );
};

export default DeviceList;
