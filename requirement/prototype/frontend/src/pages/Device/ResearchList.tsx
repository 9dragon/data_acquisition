import React, { useState, useEffect } from 'react';
import { Card, Space, Button, message, Upload, Popconfirm, Modal } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, UploadOutlined, ExportOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/Common/PageHeader';
import DataTable from '../../components/Common/DataTable';
import { useDeviceStore } from '../../stores/deviceStore';
import { useProcessStore } from '../../stores/processStore';
import { useWorkshopStore } from '../../stores/workshopStore';
import { useProjectStore } from '../../stores/projectStore';
import { mockProcesses, mockDeviceResearches, mockWorkshops, mockDeviceTypes, mockProjects } from '../../services/mockData';
import type { ColumnsType } from 'antd/es/table';
import type { DeviceResearch } from '../../types/device';

const ResearchList: React.FC = () => {
  const navigate = useNavigate();
  const {
    deviceResearches,
    setDeviceResearches,
    deleteResearch,
    setDeviceTypes,
    deviceTypes,
  } = useDeviceStore();
  const { setProcesses, processes } = useProcessStore();
  const { setWorkshops, workshops } = useWorkshopStore();
  const { setProjects, projects } = useProjectStore();

  // 初始化模拟数据
  useEffect(() => {
    if (deviceResearches.length === 0) {
      setDeviceResearches(mockDeviceResearches);
    }
    if (processes.length === 0) {
      setProcesses(mockProcesses);
    }
    if (workshops.length === 0) {
      setWorkshops(mockWorkshops);
    }
    if (deviceTypes.length === 0) {
      setDeviceTypes(mockDeviceTypes);
    }
    if (projects.length === 0) {
      setProjects(mockProjects);
    }
  }, []);

  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<DeviceResearch[]>([]);
  const [importResultModalVisible, setImportResultModalVisible] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  // 处理下载模板
  const handleDownloadTemplate = async () => {
    // TODO: 实现下载模板功能
    message.info('下载模板功能待实现');
  };

  // 处理批量导入
  const handleImport = async (file: File) => {
    // TODO: 实现批量导入功能
    message.info('批量导入功能待实现');
    return false;
  };

  // 处理批量导出
  const handleExport = async () => {
    if (selectedRows.length === 0) {
      message.warning('请选择要导出的调研记录');
      return;
    }
    // TODO: 实现批量导出功能
    message.info('批量导出功能待实现');
  };

  // 处理删除调研记录
  const handleDeleteResearch = (research: DeviceResearch) => {
    const id = research.deviceId || research.id;
    if (id) {
      deleteResearch(id);
      message.success('调研记录已删除');
    }
  };

  // 处理新建调研
  const handleCreateNew = () => {
    navigate('/device/research/create');
  };

  const columns: ColumnsType<DeviceResearch> = [
    {
      title: '所属项目',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 125,
      render: (projectName: string) => projectName || '-',
    },
    {
      title: '所属车间',
      dataIndex: 'workshop',
      key: 'workshop',
      width: 90,
      render: (workshop: string) => workshop || '-',
    },
    {
      title: '工序',
      dataIndex: 'processName',
      key: 'processName',
      width: 90,
      render: (processName: string) => processName || '-',
    },
    {
      title: '设备类型',
      dataIndex: 'deviceType',
      key: 'deviceType',
      width: 100,
      render: (deviceType: string) => deviceType || '-',
    },
    {
      title: '设备厂商',
      dataIndex: 'deviceManufacturer',
      key: 'deviceManufacturer',
      width: 110,
      render: (deviceManufacturer: string) => deviceManufacturer || '-',
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 55,
      align: 'center',
      render: (quantity: number) => quantity || 1,
    },
    {
      title: '控制器品牌',
      key: 'controllerBrand',
      width: 100,
      render: (_: any, record: DeviceResearch) => record.controller?.controllerBrand || '-',
    },
    {
      title: '控制器型号',
      key: 'controllerModel',
      width: 100,
      render: (_: any, record: DeviceResearch) => record.controller?.controllerModel || '-',
    },
    {
      title: '接口',
      key: 'interfaceType',
      width: 60,
      render: (_: any, record: DeviceResearch) => {
        const type = record.controller?.interfaceType;
        if (type === 'serial') return '串口';
        if (type === 'network') return '网口';
        return '-';
      },
    },
    {
      title: (
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
          接口<br/>是否占用
        </div>
      ),
      key: 'isInterfaceOccupied',
      width: 75,
      align: 'center',
      render: (_: any, record: DeviceResearch) => {
        const occupied = record.controller?.isInterfaceOccupied;
        if (occupied === true) return '是';
        if (occupied === false) return '否';
        return '-';
      },
    },
    {
      title: (
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
          是否连接<br/>触摸屏
        </div>
      ),
      key: 'hasTouchScreen',
      width: 85,
      align: 'center',
      render: (_: any, record: DeviceResearch) => {
        const hasScreen = record.controller?.hasTouchScreen;
        if (hasScreen === true) return '是';
        if (hasScreen === false) return '否';
        return '-';
      },
    },
  ];

  const actions = [
    {
      key: 'view',
      label: '查看',
      render: (record: DeviceResearch) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => {
            const id = record.id || record.deviceId;
            if (id) navigate(`/device/research/view/${id}?mode=view`);
          }}
        >
          查看
        </Button>
      ),
    },
    {
      key: 'edit',
      label: '编辑',
      render: (record: DeviceResearch) => (
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => {
            const id = record.id || record.deviceId;
            if (id) navigate(`/device/research/view/${id}?mode=edit`);
          }}
        >
          编辑
        </Button>
      ),
    },
    {
      key: 'delete',
      label: '删除',
      render: (record: DeviceResearch) => (
        <Popconfirm
          title="确认删除"
          description="确定要删除这条调研记录吗？删除后无法恢复。"
          onConfirm={() => handleDeleteResearch(record)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card>
      <PageHeader
        title="设备调研"
        subTitle="管理设备调研信息，跟踪调研进度"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateNew}
            >
              新建调研
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
              下载模板
            </Button>
            <Upload
              accept=".xlsx,.xls"
              showUploadList={false}
              beforeUpload={handleImport}
            >
              <Button icon={<UploadOutlined />}>批量导入</Button>
            </Upload>
            <Button
              icon={<ExportOutlined />}
              onClick={handleExport}
              disabled={selectedRows.length === 0}
            >
              批量导出 ({selectedRows.length})
            </Button>
          </Space>
        }
      />

      <DataTable
        columns={columns}
        dataSource={deviceResearches}
        actions={actions}
        loading={loading}
        rowKey="id"
        rowSelection={{
          selectedRowKeys: selectedRows.map(row => row.id),
          onChange: (selectedRowKeys: React.Key[], selectedRows: DeviceResearch[]) => {
            setSelectedRows(selectedRows);
          },
        }}
      />

      {/* 导入结果弹窗 */}
      <Modal
        title="导入结果"
        open={importResultModalVisible}
        onOk={() => setImportResultModalVisible(false)}
        onCancel={() => setImportResultModalVisible(false)}
        width={800}
      >
        {importResult && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <p>总计: <strong>{importResult.total}</strong> 条</p>
              <p style={{ color: '#52c41a' }}>成功: <strong>{importResult.successCount}</strong> 条</p>
              <p style={{ color: '#ff4d4f' }}>失败: <strong>{importResult.failCount}</strong> 条</p>
            </div>

            {importResult.errors && importResult.errors.length > 0 && (
              <div>
                <p style={{ fontWeight: 500, marginBottom: 8 }}>错误详情:</p>
                <div style={{ maxHeight: 300, overflow: 'auto', background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                  {importResult.errors.map((error: string, index: number) => (
                    <div key={index} style={{ color: '#ff4d4f', marginBottom: 4 }}>
                      {index + 1}. {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default ResearchList;
