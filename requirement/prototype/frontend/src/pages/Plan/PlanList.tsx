import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Input, Popconfirm, message } from 'antd';
import { SearchOutlined, PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../../stores/projectStore';
import { mockProjects } from '../../services/mockData';
import { ProjectPlan, ProjectStage } from '../../types/project';
import type { ColumnsType } from 'antd/es/table';
import PlanFormModal from '../../components/Plan/PlanFormModal';

// 实施阶段标签映射
const STAGE_LABELS: Record<string, { label: string; color: string }> = {
  planning: { label: '准备阶段', color: 'blue' },
  construction: { label: '施工阶段', color: 'processing' },
  configuration: { label: '配置阶段', color: 'orange' },
  verification: { label: '核对阶段', color: 'purple' },
};

interface PlanRecord {
  key: string;
  id: string;
  projectId: string;
  name: string;
  projectName: string;
  description?: string;
  startDate: string;
  endDate: string;
  stages: ProjectStage[];
}

const PlanList: React.FC = () => {
  const navigate = useNavigate();
  const { projects, setProjects, projectPlans, getProjectPlan, createProjectPlan, updateProjectPlan, deleteProjectPlan } = useProjectStore();
  const [searchText, setSearchText] = useState('');
  const [planModalVisible, setPlanModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ProjectPlan | null>(null);

  // 初始化项目数据
  useEffect(() => {
    if (projects.length === 0) {
      setProjects(mockProjects);
    }
  }, []);

  // 处理编辑
  const handleEdit = (planId: string) => {
    const plan = getProjectPlan(planId);
    if (plan) {
      setEditingPlan(plan);
      setPlanModalVisible(true);
    }
  };

  // 处理删除
  const handleDelete = (planId: string) => {
    deleteProjectPlan(planId);
    message.success('删除成功');
  };

  // 处理计划表单提交
  const handlePlanSubmit = (data: any) => {
    if (editingPlan) {
      updateProjectPlan(editingPlan.id, data);
      message.success('更新成功');
    } else {
      createProjectPlan(data);
      message.success('创建成功');
    }
    setPlanModalVisible(false);
    setEditingPlan(null);
  };

  // 处理关闭计划表单
  const handlePlanModalClose = () => {
    setPlanModalVisible(false);
    setEditingPlan(null);
  };

  // 处理创建新计划
  const handleCreatePlan = () => {
    setEditingPlan(null);
    setPlanModalVisible(true);
  };

  // 过滤后的计划列表
  const filteredPlans = projectPlans
    .filter(p => {
      const project = projects.find(proj => proj.id === p.projectId);
      const matchSearch = !searchText ||
        p.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (project && project.name.toLowerCase().includes(searchText.toLowerCase()));
      return matchSearch;
    })
    .map(p => {
      const project = projects.find(proj => proj.id === p.projectId);
      return {
        key: p.id,
        id: p.id,
        name: p.name,
        projectName: project?.name || '未知项目',
        description: p.description,
        startDate: p.startDate,
        endDate: p.endDate,
        stages: p.stages.map(s => s.stage),
        projectId: p.projectId,
      };
    });

  const columns: ColumnsType<PlanRecord> = [
    {
      title: '计划名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
    },
    {
      title: '所属项目',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 200,
      ellipsis: true,
    },
    {
      title: '包含阶段',
      dataIndex: 'stages',
      key: 'stages',
      width: 240,
      render: (stages: ProjectStage[]) => (
        <Space size="small" wrap>
          {stages.map(stage => {
            const { label, color } = STAGE_LABELS[stage] || { label: stage, color: 'default' };
            return <Tag key={stage} color={color}>{label}</Tag>;
          })}
        </Space>
      ),
    },
    {
      title: '计划开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
    },
    {
      title: '计划结束日期',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/plan/${record.projectId}`)}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.id)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除这个计划吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              icon={<DeleteOutlined />}
              danger
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={
          <Space>
            <span>项目计划管理</span>
          </Space>
        }
        extra={
          <Space>
            <Input
              placeholder="搜索计划名称或项目名称"
              prefix={<SearchOutlined />}
              style={{ width: 250 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreatePlan}
            >
              创建计划
            </Button>
          </Space>
        }
      >
        <div style={{ marginBottom: 16, color: '#666', fontSize: 14 }}>
          项目计划仅针对实施阶段（准备/施工/配置/核对），用于管理项目的实施计划和任务安排。
        </div>

        <Table
          columns={columns}
          dataSource={filteredPlans}
          pagination={{
            total: filteredPlans.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 个计划`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 计划表单 Modal */}
      {planModalVisible && (
        <PlanFormModal
          visible={planModalVisible}
          plan={editingPlan}
          projectId={editingPlan?.projectId || projects[0]?.id || ''}
          onClose={handlePlanModalClose}
          onSubmit={handlePlanSubmit}
        />
      )}
    </div>
  );
};

export default PlanList;
