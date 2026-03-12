import React, { useState, useEffect } from 'react';
import { Card, Space, Button, message, Modal, Form, Input, Select, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '../../components/Common/PageHeader';
import FilterBar from '../../components/Common/FilterBar';
import DataTable from '../../components/Common/DataTable';
import { useWorkshopStore } from '../../stores/workshopStore';
import { useProjectStore } from '../../stores/projectStore';
import type { ColumnsType } from 'antd/es/table';
import type { Workshop } from '../../types/workshop';
import type { Project } from '../../types/project';
import { mockWorkshops } from '../../services/mockData';

const WorkshopList: React.FC = () => {
  const { workshops, addWorkshop, updateWorkshop, deleteWorkshop, loading, setLoading, setWorkshops, getWorkshopsByProject } = useWorkshopStore();
  const { projects } = useProjectStore();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [form] = Form.useForm();
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();
  const [workshopNameFilter, setWorkshopNameFilter] = useState<string>('');

  // 初始化模拟数据
  useEffect(() => {
    if (workshops.length === 0) {
      setWorkshops(mockWorkshops);
    }
  }, []);

  // 初始化：如果有项目数据，默认选择第一个项目
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects]);

  // 获取当前选中项目的车间列表
  let currentWorkshops = selectedProjectId
    ? getWorkshopsByProject(selectedProjectId)
    : workshops;

  // 按车间名称筛选
  if (workshopNameFilter) {
    currentWorkshops = currentWorkshops.filter(w =>
      w.name.toLowerCase().includes(workshopNameFilter.toLowerCase())
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
      name: 'workshopName',
      label: '车间',
      type: 'input' as const,
      placeholder: '请输入车间名称',
      value: workshopNameFilter,
    },
  ];

  const columns: ColumnsType<Workshop> = [
    {
      title: '所属项目',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 200,
      fixed: 'left',
    },
    {
      title: '车间名称',
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
      render: (record: Workshop) => (
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
      render: (record: Workshop) => (
        <Popconfirm
          title="确认删除"
          description="确定要删除这个车间吗？"
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
    setEditingWorkshop(null);
    form.resetFields();
    form.setFieldsValue({ projectId: selectedProjectId });
    setIsModalVisible(true);
  };

  const handleEdit = (workshop: Workshop) => {
    setEditingWorkshop(workshop);
    form.setFieldsValue({
      name: workshop.name,
      projectId: workshop.projectId,
      description: workshop.description,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    deleteWorkshop(id);
    message.success('删除成功');
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      // 获取项目名称
      const project = projects.find(p => p.id === values.projectId);

      if (editingWorkshop) {
        // 编辑模式
        updateWorkshop(editingWorkshop.id, {
          ...values,
          projectName: project?.name,
        });
        message.success('修改成功');
      } else {
        // 新增模式
        const newWorkshop: Workshop = {
          id: `workshop_${Date.now()}`,
          name: values.name,
          projectId: values.projectId,
          projectName: project?.name,
          description: values.description,
          sortOrder: values.sortOrder || currentWorkshops.length + 1,
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString(),
        };
        addWorkshop(newWorkshop);
        message.success('添加成功');
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingWorkshop(null);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingWorkshop(null);
  };

  const handleSearch = (values: any) => {
    if (values.projectId) {
      setSelectedProjectId(values.projectId);
    }
    if (values.workshopName !== undefined) {
      setWorkshopNameFilter(values.workshopName);
    }
  };

  return (
    <Card>
      <PageHeader
        title="车间管理"
        subTitle="按项目维护车间信息"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增车间
          </Button>
        }
      />

      <FilterBar
        filters={filters}
        onSearch={handleSearch}
        onReset={() => {
          setSelectedProjectId(projects[0]?.id);
          setWorkshopNameFilter('');
        }}
        loading={loading}
        initialValues={{ projectId: selectedProjectId }}
      />

      <DataTable
        columns={columns}
        dataSource={currentWorkshops}
        actions={actions}
        loading={loading}
        rowKey="id"
      />

      <Modal
        title={editingWorkshop ? '编辑车间' : '新增车间'}
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
              disabled={!!editingWorkshop}
            >
              {projects.map((project: Project) => (
                <Select.Option key={project.id} value={project.id} label={project.name}>
                  {project.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="车间名称"
            name="name"
            rules={[
              { required: true, message: '请输入车间名称' },
              { max: 50, message: '车间名称不能超过50个字符' }
            ]}
          >
            <Input placeholder="请输入车间名称" />
          </Form.Item>

          <Form.Item
            label="车间描述"
            name="description"
          >
            <Input.TextArea
              rows={4}
              placeholder="请输入车间描述（可选）"
              maxLength={200}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default WorkshopList;
