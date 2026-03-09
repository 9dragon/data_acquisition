import React, { useState } from 'react';
import { Card, Space, Button } from 'antd';
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

  const columns: ColumnsType<DeviceType> = [
    {
      title: '类型编号',
      dataIndex: 'code',
      key: 'code',
      width: 180,
      fixed: 'left',
    },
    {
      title: '类型名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 120,
      render: (text: string) => text?.split(' ')[0] || '-',
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
