import React, { useState, useEffect } from 'react';
import { Card, Space, Button, message, Modal, Form, Input, Select, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '../../components/Common/PageHeader';
import FilterBar from '../../components/Common/FilterBar';
import DataTable from '../../components/Common/DataTable';
import { useProcessStore } from '../../stores/processStore';
import { useProjectStore } from '../../stores/projectStore';
import type { ColumnsType } from 'antd/es/table';
import type { Process } from '../../types/process';
import type { Project } from '../../types/project';

const ProcessList: React.FC = () => {
  const { processes, addProcess, updateProcess, deleteProcess, getProcessesByProject, loading, setLoading } = useProcessStore();
  const { projects } = useProjectStore();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProcess, setEditingProcess] = useState<Process | null>(null);
  const [form] = Form.useForm();
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();
  const [processNameFilter, setProcessNameFilter] = useState<string>('');

  // 初始化：如果有项目数据，默认选择第一个项目
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects]);

  // 获取当前选中项目的工序列表
  let currentProcesses = selectedProjectId
    ? getProcessesByProject(selectedProjectId)
    : processes;

  // 按工序名称筛选
  if (processNameFilter) {
    currentProcesses = currentProcesses.filter(p =>
      p.name.toLowerCase().includes(processNameFilter.toLowerCase())
    );
  }

  const filters = [
    {
      name: 'projectId',
      label: '所属项目',
      type: 'select' as const,
      placeholder: '请选择项目',
      options: projects.map((p: Project) => ({ label: p.name, value: p.id })),
      value: selectedProjectId,
    },
    {
      name: 'processName',
      label: '工序',
      type: 'input' as const,
      placeholder: '请输入工序名称',
      value: processNameFilter,
    },
  ];

  const columns: ColumnsType<Process> = [
    {
      title: '所属项目',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 200,
      fixed: 'left',
    },
    {
      title: '工序编号',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code: string) => code || '-',
    },
    {
      title: '工序名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => description || '-',
    },
  ];

  const actions = [
    {
      key: 'edit',
      label: '编辑',
      render: (record: Process) => (
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          编辑
        </Button>
      ),
    },
    {
      key: 'delete',
      label: '删除',
      render: (record: Process) => (
        <Popconfirm
          title="确认删除"
          description="确定要删除这个工序吗？"
          onConfirm={() => handleDelete(record.id)}
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

  const handleAdd = () => {
    if (!selectedProjectId) {
      message.warning('请先选择项目');
      return;
    }
    setEditingProcess(null);
    form.resetFields();
    form.setFieldsValue({ projectId: selectedProjectId });
    setIsModalVisible(true);
  };

  const handleEdit = (process: Process) => {
    setEditingProcess(process);
    form.setFieldsValue({
      name: process.name,
      code: process.code,
      projectId: process.projectId,
      description: process.description,
      sortOrder: process.sortOrder,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    deleteProcess(id);
    message.success('删除成功');
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      // 获取项目名称
      const project = projects.find(p => p.id === values.projectId);

      if (editingProcess) {
        // 编辑模式
        updateProcess(editingProcess.id, {
          ...values,
          projectName: project?.name,
        });
        message.success('修改成功');
      } else {
        // 新增模式
        const newProcess: Process = {
          id: `process_${Date.now()}`,
          name: values.name,
          code: values.code,
          projectId: values.projectId,
          projectName: project?.name,
          description: values.description,
          sortOrder: values.sortOrder || currentProcesses.length + 1,
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString(),
        };
        addProcess(newProcess);
        message.success('添加成功');
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingProcess(null);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingProcess(null);
  };

  const handleSearch = (values: any) => {
    if (values.projectId) {
      setSelectedProjectId(values.projectId);
    }
    if (values.processName !== undefined) {
      setProcessNameFilter(values.processName);
    }
  };

  return (
    <Card>
      <PageHeader
        title="工序管理"
        subTitle="按项目维护工序信息"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增工序
          </Button>
        }
      />

      <FilterBar
        filters={filters}
        onSearch={handleSearch}
        onReset={() => setSelectedProjectId(projects[0]?.id)}
        loading={loading}
        initialValues={{ projectId: selectedProjectId }}
      />

      <DataTable
        columns={columns}
        dataSource={currentProcesses}
        actions={actions}
        loading={loading}
        rowKey="id"
      />

      <Modal
        title={editingProcess ? '编辑工序' : '新增工序'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            label="所属项目"
            name="projectId"
            rules={[{ required: true, message: '请选择项目' }]}
          >
            <Select
              placeholder="请选择项目"
              showSearch
              optionFilterProp="label"
              disabled={!!editingProcess}
            >
              {projects.map((project: Project) => (
                <Select.Option key={project.id} value={project.id} label={project.name}>
                  {project.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="工序名称"
            name="name"
            rules={[
              { required: true, message: '请输入工序名称' },
              { max: 50, message: '工序名称不能超过50个字符' }
            ]}
          >
            <Input placeholder="请输入工序名称" />
          </Form.Item>

          <Form.Item
            label="工序编号"
            name="code"
          >
            <Input placeholder="请输入工序编号（可选）" />
          </Form.Item>

          <Form.Item
            label="排序序号"
            name="sortOrder"
          >
            <Input type="number" placeholder="请输入排序序号（可选）" />
          </Form.Item>

          <Form.Item
            label="工序描述"
            name="description"
          >
            <Input.TextArea
              rows={4}
              placeholder="请输入工序描述（可选）"
              maxLength={200}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ProcessList;
