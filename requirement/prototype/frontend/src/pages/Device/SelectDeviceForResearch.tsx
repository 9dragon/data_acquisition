import React from 'react';
import { Card, Table, Button, Empty } from 'antd';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/Common/PageHeader';
import { useDeviceStore } from '../../stores/deviceStore';
import type { ColumnsType } from 'antd/es/table';
import type { Device } from '../../types/device';

const SelectDeviceForResearch: React.FC = () => {
  const navigate = useNavigate();
  const { devices, deviceResearches } = useDeviceStore();

  // 筛选没有调研记录的设备
  const devicesWithoutResearch = devices.filter(device =>
    !deviceResearches.some(research => research.deviceId === device.id)
  );

  const columns: ColumnsType<Device> = [
    {
      title: '设备编号',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
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
    {
      title: '设备类型',
      dataIndex: 'typeName',
      key: 'typeName',
      width: 150,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => navigate(`/device/research/${record.id}?mode=edit`)}
        >
          开始调研
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <PageHeader
        title="选择设备"
        subTitle="选择需要开始调研的设备"
        extra={
          <Button onClick={() => navigate('/device/research')}>
            返回列表
          </Button>
        }
      />

      {devicesWithoutResearch.length === 0 ? (
        <Empty description="暂无需要调研的设备" />
      ) : (
        <Table
          columns={columns}
          dataSource={devicesWithoutResearch}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 台设备`,
          }}
        />
      )}
    </Card>
  );
};

export default SelectDeviceForResearch;
