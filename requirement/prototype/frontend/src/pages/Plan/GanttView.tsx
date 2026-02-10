import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Radio, Space, Alert } from 'antd';
import PageHeader from '../../components/Common/PageHeader';
import { getProjectById } from '../../services/mockData';
import { useProjectStore } from '../../stores/projectStore';
// Note: Gantt chart is not available in @ant-design/charts
// import { Gantt } from '@ant-design/charts';

const GanttView: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { currentProject, setCurrentProject } = useProjectStore();
  const [viewType, setViewType] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    if (projectId) {
      const project = getProjectById(projectId);
      if (project) {
        setCurrentProject(project);
      }
    }
  }, [projectId]);

  if (!currentProject) {
    return <div>项目不存在</div>;
  }

  const project = currentProject;

  // 模拟甘特图数据
  const data = [
    {
      id: '1',
      name: '需求调研',
      startDate: '2024-01-15',
      endDate: '2024-01-25',
      progress: 1,
      type: 'task',
    },
    {
      id: '2',
      name: '方案设计',
      startDate: '2024-01-20',
      endDate: '2024-01-31',
      progress: 1,
      type: 'task',
      dependencies: ['1'],
    },
    {
      id: '3',
      name: '系统设计',
      startDate: '2024-02-01',
      endDate: '2024-02-10',
      progress: 1,
      type: 'task',
      dependencies: ['2'],
    },
    {
      id: '4',
      name: '设备开发',
      startDate: '2024-02-11',
      endDate: '2024-03-31',
      progress: 0.6,
      type: 'task',
      dependencies: ['3'],
    },
    {
      id: '5',
      name: '注塑机采集',
      startDate: '2024-02-15',
      endDate: '2024-03-15',
      progress: 1,
      type: 'task',
      dependencies: ['4'],
    },
    {
      id: '6',
      name: '装配机器人采集',
      startDate: '2024-02-20',
      endDate: '2024-03-31',
      progress: 0.5,
      type: 'task',
      dependencies: ['4'],
    },
    {
      id: '7',
      name: 'CNC设备采集',
      startDate: '2024-03-01',
      endDate: '2024-03-31',
      progress: 0.7,
      type: 'task',
      dependencies: ['4'],
    },
    {
      id: '8',
      name: '单元测试',
      startDate: '2024-04-01',
      endDate: '2024-04-15',
      progress: 0,
      type: 'task',
    },
    {
      id: '9',
      name: '集成测试',
      startDate: '2024-04-16',
      endDate: '2024-04-30',
      progress: 0,
      type: 'task',
    },
    {
      id: '10',
      name: '现场部署',
      startDate: '2024-05-01',
      endDate: '2024-05-20',
      progress: 0,
      type: 'task',
    },
    {
      id: '11',
      name: '项目验收',
      startDate: '2024-05-21',
      endDate: '2024-05-31',
      progress: 0,
      type: 'task',
    },
  ];

  return (
    <Card>
      <PageHeader
        title={`${project.name} - 甘特图`}
        breadcrumbs={[
          { label: '项目管理', path: '/project' },
          { label: project.name, path: `/project/${projectId}` },
          { label: '甘特图' },
        ]}
        extra={
          <Radio.Group value={viewType} onChange={(e) => setViewType(e.target.value)}>
            <Radio.Button value="day">日视图</Radio.Button>
            <Radio.Button value="week">周视图</Radio.Button>
            <Radio.Button value="month">月视图</Radio.Button>
          </Radio.Group>
        }
      />

      <Alert
        message="甘特图功能"
        description="甘特图组件暂不可用。@ant-design/charts 库未提供甘特图组件。"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Card title="任务列表（按时间排序）">
        {data.map((task) => (
          <Card key={task.id} type="inner" style={{ marginBottom: 8 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <strong>{task.name}</strong>
              <span>时间: {task.startDate} ~ {task.endDate}</span>
              <span>进度: {task.progress * 100}%</span>
            </Space>
          </Card>
        ))}
      </Card>
    </Card>
  );
};

export default GanttView;
