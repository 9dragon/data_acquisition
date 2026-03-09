import React, { useState, useEffect } from 'react';
import { Card, Space, Button, Tag, Progress, message, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../../components/Common/PageHeader';
import FilterBar from '../../components/Common/FilterBar';
import DataTable from '../../components/Common/DataTable';
import StatusTag from '../../components/Common/StatusTag';
import ProjectFormModal from '../../components/Project/ProjectFormModal';
import { useProjectStore } from '../../stores/projectStore';
import { mockProjects } from '../../services/mockData';
import type { ColumnsType } from 'antd/es/table';
import type { Project } from '../../types/project';
import dayjs from 'dayjs';

const ProjectList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { projects, setProjects, updateProject, deleteProject } = useProjectStore();
  const [loading, setLoading] = useState(false);
  const [filterValues, setFilterValues] = React.useState<Record<string, any>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // 初始化项目数据
  useEffect(() => {
    if (projects.length === 0) {
      setProjects(mockProjects);
    }
  }, []);

  // 从 URL 参数读取初始筛选值
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stage = params.get('stage');
    if (stage) {
      setFilterValues({ stage });
    }
  }, []);

  const filters = [
    { name: 'name', label: '项目名称', type: 'input' as const, placeholder: '请输入项目名称' },
    { name: 'code', label: '项目编号', type: 'input' as const, placeholder: '请输入项目编号' },
    { name: 'status', label: '项目状态', type: 'select' as const, placeholder: '请选择状态', options: [
      { label: '未开始', value: 'not_started' },
      { label: '进行中', value: 'in_progress' },
      { label: '已完成', value: 'completed' },
      { label: '暂停', value: 'on_hold' },
    ]},
    { name: 'stage', label: '项目阶段', type: 'select' as const, placeholder: '请选择阶段', options: [
      { label: '售前调研', value: 'presale' },
      { label: '准备阶段', value: 'planning' },
      { label: '施工阶段', value: 'construction' },
      { label: '配置阶段', value: 'configuration' },
      { label: '核对阶段', value: 'verification' },
      { label: '验收阶段', value: 'acceptance' },
      { label: '已完成', value: 'completed' },
    ]},
  ];

  // 应用筛选到数据源
  const getFilteredData = () => {
    return projects.filter((project: any) => {
      if (filterValues.stage && project.stage !== filterValues.stage) {
        return false;
      }
      if (filterValues.status && project.status !== filterValues.status) {
        return false;
      }
      if (filterValues.name && !project.name.toLowerCase().includes(filterValues.name.toLowerCase())) {
        return false;
      }
      if (filterValues.code && !project.code.toLowerCase().includes(filterValues.code.toLowerCase())) {
        return false;
      }
      return true;
    });
  };

  const columns: ColumnsType<Project> = [
    {
      title: '项目编号',
      dataIndex: 'code',
      key: 'code',
      width: 140,
      fixed: 'left',
    },
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => <StatusTag status={status} />,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => {
        const priorityMap: Record<string, { text: string; color: string }> = {
          low: { text: '低', color: 'default' },
          medium: { text: '中', color: 'processing' },
          high: { text: '高', color: 'warning' },
          urgent: { text: '紧急', color: 'error' },
        };
        const p = priorityMap[priority] || { text: priority, color: 'default' };
        return <Tag color={p.color}>{p.text}</Tag>;
      },
    },
    {
      title: '项目经理',
      dataIndex: 'manager',
      key: 'manager',
      width: 120,
      render: (_, record) => (record.manager?.name as string) || '张经理',
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
      label: '查看',
      onClick: (record: Project) => navigate(`/project/${record.id}`),
    },
    {
      label: '编辑',
      onClick: (record: Project) => handleEdit(record),
    },
    {
      label: '删除',
      danger: true,
      render: (record: Project) => (
        <Popconfirm
          title="确认删除"
          description="确定要删除这个项目吗？删除后无法恢复。"
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

  const handleSearch = (values: any) => {
    setFilterValues(values);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const handleReset = () => {
    setFilterValues({});
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const handleCreateProject = () => {
    setModalVisible(true);
  };

  const handleModalOk = (values: any) => {
    const newProject: Project = {
      id: String(projects.length + 1),
      ...values,
      stage: 'planning',
      status: 'not_started',
      progress: 0,
      deviceCount: 0,
      completedDeviceCount: 0,
      issueCount: 0,
      documentCount: 0,
      teamMembers: [values.managerId],
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      creator: '当前用户',
    };
    setProjects([...projects, newProject]);
    setModalVisible(false);
    message.success('项目创建成功');
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setModalVisible(true);
  };

  const handleEditSubmit = (values: any) => {
    updateProject(editingProject!.id, values);
    setModalVisible(false);
    setEditingProject(null);
    message.success('项目更新成功');
  };

  const handleDelete = (project: Project) => {
    deleteProject(project.id);
    message.success('删除成功');
    // 如果当前在详情页，导航回列表页
    if (location.pathname.startsWith('/project/') && location.pathname !== '/project') {
      navigate('/project');
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingProject(null);
  };

  return (
    <Card>
      <PageHeader
        title="项目管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateProject}>
            新建项目
          </Button>
        }
      />

      <FilterBar
        filters={filters}
        onSearch={handleSearch}
        onReset={handleReset}
        loading={loading}
        initialValues={filterValues}
      />

      <DataTable
        columns={columns}
        dataSource={getFilteredData()}
        actions={actions}
        loading={loading}
        rowKey="id"
      />

      <ProjectFormModal
        visible={modalVisible}
        project={editingProject}
        mode={editingProject ? 'edit' : 'create'}
        onCancel={handleModalCancel}
        onOk={editingProject ? handleEditSubmit : handleModalOk}
      />
    </Card>
  );
};

export default ProjectList;
