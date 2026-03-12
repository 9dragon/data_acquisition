import React, { useState, useEffect } from 'react';
import { Card, Space, Button, Tag, message, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const { devices, setDevices, deleteDevice } = useDeviceStore();
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
    { name: 'workshop', label: '所属车间', type: 'select' as const, placeholder: '请选择车间', options: [
      { label: '车间A区', value: '车间A区' },
      { label: '车间B区', value: '车间B区' },
      { label: '装配车间', value: '装配车间' },
      { label: '加工车间', value: '加工车间' },
      { label: '涂装车间', value: '涂装车间' },
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
      title: '所属车间',
      dataIndex: 'workshop',
      key: 'workshop',
      width: 120,
      render: (workshop: string) => workshop || '-',
    },
  ];

  const actions = [
    {
      label: '查看',
      onClick: (record: Device) => navigate(`/device/${record.id}`),
    },
    {
      label: '编辑',
      onClick: (record: Device) => console.log('编辑设备', record),
    },
    {
      label: '删除',
      danger: true,
      render: (record: Device) => (
        <Popconfirm
          title="确认删除"
          description={
            <div>
              <p>确定要删除这个设备吗？删除后无法恢复。</p>
              <p style={{ fontSize: '12px', color: '#666' }}>
                关联数据：{record.pointCount || 0} 个数据点、
                {record.issues || 0} 个问题、
                {record.documents || 0} 个文档
              </p>
            </div>
          }
          onConfirm={() => handleDelete(record)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" size="small" danger>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const handleDelete = (device: Device) => {
    deleteDevice(device.id);
    message.success('删除成功');

    // 如果当前在详情页，自动返回列表页
    if (location.pathname.startsWith('/device/') && location.pathname !== '/device') {
      navigate('/device');
    }
  };

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
