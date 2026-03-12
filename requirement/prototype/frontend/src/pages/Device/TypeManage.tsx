import React, { useState, useMemo, useEffect } from 'react';
import { Card, Space, Button, Select, Modal, Form, Input, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import PageHeader from '../../components/Common/PageHeader';
import DataTable from '../../components/Common/DataTable';
import { useDeviceStore } from '../../stores/deviceStore';
import { useProjectStore } from '../../stores/projectStore';
import { useProcessStore } from '../../stores/processStore';
import { mockDeviceTypes, mockProcesses } from '../../services/mockData';
import type { ColumnsType } from 'antd/es/table';
import type { DeviceType } from '../../types/device';

const DeviceTypeManage: React.FC = () => {
  const { deviceTypes, setDeviceTypes, addDeviceType, updateDeviceType } = useDeviceStore();
  const { projects } = useProjectStore();
  const { processes, setProcesses } = useProcessStore();
  const [loading, setLoading] = useState(false);
  const [filterProject, setFilterProject] = useState<string | undefined>();
  const [filterProcess, setFilterProcess] = useState<string | undefined>();

  // 新建/编辑模态框状态
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DeviceType | null>(null);
  const [form] = Form.useForm();
  const [selectedProjectId, setSelectedProjectId] = useState<string>();

  // 初始化数据
  useEffect(() => {
    // 检查是否有processName字段，如果没有则重新加载数据
    const hasProcessName = deviceTypes.length > 0 && deviceTypes[0].processName !== undefined;
    if (deviceTypes.length === 0 || !hasProcessName) {
      setDeviceTypes(mockDeviceTypes);
    }
    // 初始化工序列表
    if (processes.length === 0) {
      setProcesses(mockProcesses);
    }
  }, []);

  // 获取筛选后的设备类型列表
  const filteredDeviceTypes = useMemo(() => {
    let result = deviceTypes;
    if (filterProject) {
      result = result.filter(type => type.projectId === filterProject);
    }
    if (filterProcess) {
      result = result.filter(type => type.processId === filterProcess);
    }
    return result;
  }, [deviceTypes, filterProject, filterProcess]);

  // 根据选中的项目筛选工序
  const processOptions = useMemo(() => {
    if (!selectedProjectId) return [];
    return processes
      .filter(p => p.projectId === selectedProjectId)
      .map(p => ({ label: p.name, value: p.id }));
  }, [processes, selectedProjectId]);

  const columns: ColumnsType<DeviceType> = [
    {
      title: '所属项目',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 150,
      fixed: 'left',
    },
    {
      title: '所属工序',
      dataIndex: 'processName',
      key: 'processName',
      width: 150,
      render: (processName: string) => processName || '-',
    },
    {
      title: '类型编号',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: '类型名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
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
      onClick: (record: DeviceType) => handleEdit(record),
    },
    {
      label: '删除',
      onClick: (record: DeviceType) => handleDelete(record),
      danger: true,
    },
  ];

  // 打开新建模态框
  const handleAdd = () => {
    setEditingRecord(null);
    setSelectedProjectId(undefined);
    form.resetFields();
    setModalVisible(true);
  };

  // 打开编辑模态框
  const handleEdit = (record: DeviceType) => {
    setEditingRecord(record);
    setSelectedProjectId(record.projectId);
    form.setFieldsValue({
      projectId: record.projectId,
      processId: record.processId,
      name: record.name,
      code: record.code,
      description: record.description,
    });
    setModalVisible(true);
  };

  // 删除设备类型
  const handleDelete = (record: DeviceType) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除设备类型"${record.name}"吗？`,
      onOk: () => {
        // TODO: 调用删除方法
        message.success('删除成功');
      },
    });
  };

  // 保存设备类型
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const project = projects.find(p => p.id === values.projectId);
      const process = processes.find(p => p.id === values.processId);

      if (editingRecord) {
        // 编辑
        updateDeviceType(editingRecord.id, {
          ...values,
          projectName: project?.name,
          processName: process?.name,
        });
        message.success('更新成功');
      } else {
        // 新建
        addDeviceType({
          ...values,
          id: `type_${Date.now()}`,
          projectName: project?.name,
          processName: process?.name,
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString(),
        } as DeviceType);
        message.success('创建成功');
      }

      setModalVisible(false);
      form.resetFields();
      setSelectedProjectId(undefined);
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  // 项目选择变化
  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    form.setFieldsValue({ processId: undefined });
  };

  return (
    <Card>
      <PageHeader
        title="设备类型管理"
        extra={
          <Space>
            <Select
              placeholder="筛选项目"
              allowClear
              style={{ width: 150 }}
              value={filterProject}
              onChange={(value) => {
                setFilterProject(value);
                setFilterProcess(undefined);
              }}
              options={projects.map(p => ({ label: p.name, value: p.id }))}
            />
            <Select
              placeholder="筛选工序"
              allowClear
              style={{ width: 150 }}
              value={filterProcess}
              onChange={setFilterProcess}
              options={processes
                .filter(p => !filterProject || p.projectId === filterProject)
                .map(p => ({ label: p.name, value: p.id }))}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新建类型
            </Button>
          </Space>
        }
      />

      <DataTable
        columns={columns}
        dataSource={filteredDeviceTypes}
        actions={actions}
        loading={loading}
        rowKey="id"
      />

      {/* 新建/编辑模态框 */}
      <Modal
        title={editingRecord ? '编辑设备类型' : '新建设备类型'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setSelectedProjectId(undefined);
        }}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="projectId"
            label="所属项目"
            rules={[{ required: true, message: '请选择所属项目' }]}
          >
            <Select
              placeholder="请选择所属项目"
              onChange={handleProjectChange}
              options={projects.map(p => ({ label: p.name, value: p.id }))}
            />
          </Form.Item>

          <Form.Item
            name="processId"
            label="所属工序"
          >
            <Select
              placeholder="请选择所属工序（可选）"
              allowClear
              options={processOptions}
            />
          </Form.Item>

          <Form.Item
            name="code"
            label="类型编号"
            rules={[{ required: true, message: '请输入类型编号' }]}
          >
            <Input placeholder="请输入类型编号" />
          </Form.Item>

          <Form.Item
            name="name"
            label="类型名称"
            rules={[{ required: true, message: '请输入类型名称' }]}
          >
            <Input placeholder="请输入类型名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={3} placeholder="请输入描述" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default DeviceTypeManage;
