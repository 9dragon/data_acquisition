import React, { useState, useEffect } from 'react';
import { Card, Space, Button, message, Progress, Tag, Empty, Upload, Popconfirm, Modal } from 'antd';
import { PlusOutlined, CheckCircleOutlined, EditOutlined, EyeOutlined, DeleteOutlined, DownloadOutlined, UploadOutlined, ExportOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/Common/PageHeader';
import DataTable from '../../components/Common/DataTable';
import { useDeviceStore } from '../../stores/deviceStore';
import { mockDevices } from '../../services/mockData';
import { downloadResearchTemplate, exportResearchData, importResearchData, validateImportDeviceCodes } from '../../services/deviceResearchService';
import type { ColumnsType } from 'antd/es/table';
import type { Device } from '../../types/device';

interface DeviceWithResearch extends Device {
  researchProgress: number;
  basicCompleted: boolean;
  controllerCompleted: boolean;
  collectionCompleted: boolean;
}

const ResearchList: React.FC = () => {
  const navigate = useNavigate();
  const {
    devices,
    setDevices,
    getResearchByDeviceId,
    calculateResearchProgress,
    deleteResearch,
    deviceResearches
  } = useDeviceStore();
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<DeviceWithResearch[]>([]);
  const [importResultModalVisible, setImportResultModalVisible] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  useEffect(() => {
    if (devices.length === 0) {
      setDevices(mockDevices);
    }
  }, []);

  // 添加调研进度到设备数据
  const devicesWithResearch: DeviceWithResearch[] = devices.map(device => {
    const research = getResearchByDeviceId(device.id);
    const progress = calculateResearchProgress(device.id);

    return {
      ...device,
      researchProgress: progress,
      basicCompleted: research?.basicCompleted || false,
      controllerCompleted: research?.controllerCompleted || false,
      collectionCompleted: research?.collectionCompleted || false,
    };
  });

  const getStatusTag = (device: DeviceWithResearch) => {
    if (device.researchProgress === 100) {
      return <Tag color="success">已完成</Tag>;
    } else if (device.researchProgress > 0) {
      return <Tag color="processing">进行中</Tag>;
    } else {
      return <Tag color="default">未开始</Tag>;
    }
  };

  const getSectionStatus = (completed: boolean) => {
    return completed ? (
      <CheckCircleOutlined style={{ color: '#52c41a' }} />
    ) : (
      <span style={{ color: '#d9d9d9' }}>○</span>
    );
  };

  // 处理下载模板
  const handleDownloadTemplate = async () => {
    await downloadResearchTemplate();
  };

  // 处理批量导入
  const handleImport = async (file: File) => {
    const result = await importResearchData(file);

    // 验证导入的设备编号
    const existingDeviceCodes = new Set(devices.map(d => d.code));
    const validationErrors = validateImportDeviceCodes(result.data, existingDeviceCodes);

    if (validationErrors.length > 0) {
      result.errors.push(...validationErrors);
      result.success = false;
    }

    setImportResult(result);
    setImportResultModalVisible(true);

    if (result.success) {
      message.success(`成功导入 ${result.successCount} 条数据！`);
    } else {
      message.warning(`导入完成，成功 ${result.successCount} 条，失败 ${result.failCount} 条`);
    }

    return false; // 阻止自动上传
  };

  // 处理批量导出
  const handleExport = async () => {
    if (selectedRows.length === 0) {
      message.warning('请选择要导出的设备');
      return;
    }

    const researchesToExport = selectedRows
      .map(row => getResearchByDeviceId(row.id))
      .filter(r => r !== null);

    const deviceMap = new Map(selectedRows.map(d => [d.id, d]));
    await exportResearchData(researchesToExport, deviceMap);
  };

  // 处理删除调研记录
  const handleDeleteResearch = (deviceId: string) => {
    deleteResearch(deviceId);
    message.success('调研记录已删除');
  };

  // 处理新建调研
  const handleCreateNew = () => {
    navigate('/device/research/create');
  };

  const columns: ColumnsType<DeviceWithResearch> = [
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
    {
      title: '调研进度',
      dataIndex: 'researchProgress',
      key: 'researchProgress',
      width: 150,
      render: (progress: number, record: DeviceWithResearch) => (
        <Progress
          percent={progress}
          size="small"
          status={progress === 100 ? 'success' : 'active'}
        />
      ),
    },
    {
      title: '状态',
      dataIndex: 'researchProgress',
      key: 'status',
      width: 100,
      render: (progress: number, record: DeviceWithResearch) => getStatusTag(record),
    },
    {
      title: '基础信息',
      dataIndex: 'basicCompleted',
      key: 'basicCompleted',
      width: 100,
      align: 'center',
      render: (completed: boolean) => getSectionStatus(completed),
    },
    {
      title: '控制器信息',
      dataIndex: 'controllerCompleted',
      key: 'controllerCompleted',
      width: 100,
      align: 'center',
      render: (completed: boolean) => getSectionStatus(completed),
    },
    {
      title: '采集信息',
      dataIndex: 'collectionCompleted',
      key: 'collectionCompleted',
      width: 100,
      align: 'center',
      render: (completed: boolean) => getSectionStatus(completed),
    },
  ];

  const actions = [
    {
      key: 'view',
      label: '查看',
      render: (record: DeviceWithResearch) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/device/research/${record.id}?mode=view`)}
        >
          查看
        </Button>
      ),
    },
    {
      key: 'edit',
      label: '编辑',
      render: (record: DeviceWithResearch) => (
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => navigate(`/device/research/${record.id}?mode=edit`)}
        >
          编辑
        </Button>
      ),
    },
    {
      key: 'delete',
      label: '删除',
      render: (record: DeviceWithResearch) => (
        <Popconfirm
          title="确认删除"
          description="确定要删除这条调研记录吗？删除后无法恢复。"
          onConfirm={() => handleDeleteResearch(record.id)}
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

      {devicesWithResearch.length === 0 ? (
        <Empty description="暂无设备数据" />
      ) : (
        <DataTable
          columns={columns}
          dataSource={devicesWithResearch}
          actions={actions}
          loading={loading}
          rowKey="id"
          rowSelection={{
            selectedRowKeys: selectedRows.map(row => row.id),
            onChange: (selectedRowKeys: React.Key[], selectedRows: DeviceWithResearch[]) => {
              setSelectedRows(selectedRows);
            },
          }}
        />
      )}

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

            {importResult.errors.length > 0 && (
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