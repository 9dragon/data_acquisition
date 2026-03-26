import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Input,
  Select,
  Space,
  Typography,
  Statistic,
  Tag,
  Button,
  Empty,
  Spin,
  Table,
  Tabs,
} from 'antd';
import {
  SearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  AppstoreOutlined,
  ReloadOutlined,
  EditOutlined,
  ProjectOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useProjectStore } from '../../stores/projectStore';
import { useStageStore } from '../../stores/stageStore';
import { mockProjects } from '../../services/mockData';
import { mockStageDefinitions } from '../../services/mockData';
import TaskReportModal from './TaskReportModal';
import {
  transformProjectsToDeviceTaskList,
  filterDeviceTaskList,
  calculateStatisticsFromDeviceList,
  transformProjectsToProjectTaskList,
  filterProjectTaskList,
  calculateStatisticsFromProjectTaskList,
  getTaskStatusTag,
  formatTaskDate,
} from '../../utils/taskDataTransformer';
import { DeviceTaskListItem, ProjectTaskListItem, TaskCardData } from '../../types/task';

const { Title, Text } = Typography;

/**
 * 任务列表页面
 * 使用 Tab 分类展示项目级任务和设备级任务
 */
const TaskList: React.FC = () => {
  const { projects, setProjects } = useProjectStore();
  const { stageDefinitions, setStageDefinitions } = useStageStore();
  const [loading, setLoading] = useState(false);

  // Tab 状态
  const [activeTab, setActiveTab] = useState<'project' | 'device'>('device');

  // 设备级任务数据
  const [deviceTaskList, setDeviceTaskList] = useState<DeviceTaskListItem[]>([]);
  const [deviceFilteredList, setDeviceFilteredList] = useState<DeviceTaskListItem[]>([]);
  const [deviceStatistics, setDeviceStatistics] = useState({
    totalTasks: 0,
    totalDevices: 0,
    completedDevices: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
  });

  // 项目级任务数据
  const [projectTaskList, setProjectTaskList] = useState<ProjectTaskListItem[]>([]);
  const [projectFilteredList, setProjectFilteredList] = useState<ProjectTaskListItem[]>([]);
  const [projectStatistics, setProjectStatistics] = useState({
    totalTasks: 0,
    totalDevices: 0,
    completedDevices: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
  });

  // 设备级任务筛选条件
  const [deviceSearchText, setDeviceSearchText] = useState('');
  const [deviceStatusFilter, setDeviceStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [deviceProjectFilter, setDeviceProjectFilter] = useState<string[]>([]);

  // 项目级任务筛选条件
  const [projectSearchText, setProjectSearchText] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [projectProjectFilter, setProjectProjectFilter] = useState<string[]>([]);

  // 填报模态框
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedTaskType, setSelectedTaskType] = useState<'device' | 'project'>('device');
  const [selectedDeviceItem, setSelectedDeviceItem] = useState<DeviceTaskListItem | null>(null);
  const [selectedProjectItem, setSelectedProjectItem] = useState<ProjectTaskListItem | null>(null);

  // 初始化数据
  useEffect(() => {
    if (projects.length === 0) {
      setProjects(mockProjects);
    }
    if (stageDefinitions.length === 0) {
      setStageDefinitions(mockStageDefinitions);
    }
  }, []);

  // 转换数据并计算统计
  useEffect(() => {
    setLoading(true);
    try {
      // 转换项目数据为设备任务列表
      const deviceList = transformProjectsToDeviceTaskList(projects, stageDefinitions);
      setDeviceTaskList(deviceList);

      // 计算设备级任务统计
      const deviceStats = calculateStatisticsFromDeviceList(deviceList);
      setDeviceStatistics(deviceStats);

      // 转换项目数据为项目级任务列表
      const projList = transformProjectsToProjectTaskList(projects, stageDefinitions);
      setProjectTaskList(projList);

      // 计算项目级任务统计
      const projStats = calculateStatisticsFromProjectTaskList(projList);
      setProjectStatistics(projStats);
    } catch (error) {
      console.error('数据转换失败:', error);
    } finally {
      setLoading(false);
    }
  }, [projects, stageDefinitions]);

  // 应用设备级任务筛选
  useEffect(() => {
    const filtered = filterDeviceTaskList(deviceTaskList, {
      searchText: deviceSearchText,
      status: deviceStatusFilter,
      projectIds: deviceProjectFilter.length > 0 ? deviceProjectFilter : undefined,
    });
    setDeviceFilteredList(filtered);
  }, [deviceTaskList, deviceSearchText, deviceStatusFilter, deviceProjectFilter]);

  // 应用项目级任务筛选
  useEffect(() => {
    const filtered = filterProjectTaskList(projectTaskList, {
      searchText: projectSearchText,
      status: projectStatusFilter,
      projectIds: projectProjectFilter.length > 0 ? projectProjectFilter : undefined,
    });
    setProjectFilteredList(filtered);
  }, [projectTaskList, projectSearchText, projectStatusFilter, projectProjectFilter]);

  // 处理设备级任务填报按钮点击
  const handleDeviceTaskClick = (item: DeviceTaskListItem) => {
    setSelectedTaskType('device');
    setSelectedDeviceItem(item);
    setSelectedProjectItem(null);
    setReportModalVisible(true);
  };

  // 处理项目级任务填报按钮点击
  const handleProjectTaskClick = (item: ProjectTaskListItem) => {
    setSelectedTaskType('project');
    setSelectedProjectItem(item);
    setSelectedDeviceItem(null);
    setReportModalVisible(true);
  };

  // 处理填报成功
  const handleReportSuccess = () => {
    // 刷新数据
    const deviceList = transformProjectsToDeviceTaskList(projects, stageDefinitions);
    setDeviceTaskList(deviceList);
    const deviceStats = calculateStatisticsFromDeviceList(deviceList);
    setDeviceStatistics(deviceStats);

    const projList = transformProjectsToProjectTaskList(projects, stageDefinitions);
    setProjectTaskList(projList);
    const projStats = calculateStatisticsFromProjectTaskList(projList);
    setProjectStatistics(projStats);
  };

  // 获取项目选项列表
  const projectOptions = projects.map(p => ({
    label: `${p.code} - ${p.name}`,
    value: p.id,
  }));

  // 状态筛选选项
  const statusOptions = [
    { label: '全部', value: 'all' },
    { label: '待处理', value: 'pending' },
    { label: '进行中', value: 'in_progress' },
    { label: '已完成', value: 'completed' },
  ];

  // 设备级任务表格列定义
  const deviceColumns: ColumnsType<DeviceTaskListItem> = [
    {
      title: '项目编号',
      dataIndex: 'projectCode',
      key: 'projectCode',
      width: 120,
      fixed: 'left',
    },
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '阶段',
      dataIndex: 'stageName',
      key: 'stageName',
      width: 120,
    },
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
      width: 150,
    },
    {
      title: '任务名称',
      dataIndex: 'taskName',
      key: 'taskName',
      width: 180,
      ellipsis: true,
    },
    {
      title: '完成日期',
      dataIndex: 'completedDate',
      key: 'completedDate',
      width: 120,
      render: (date: string) => formatTaskDate(date),
    },
    {
      title: '状态',
      dataIndex: 'completed',
      key: 'completed',
      width: 100,
      render: (completed: boolean) => (
        <Tag color={completed ? 'success' : 'default'} icon={completed ? <CheckCircleOutlined /> : <ClockCircleOutlined />}>
          {completed ? '已完成' : '待处理'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleDeviceTaskClick(record)}
        >
          填报
        </Button>
      ),
    },
  ];

  // 项目级任务表格列定义
  const projectColumns: ColumnsType<ProjectTaskListItem> = [
    {
      title: '项目编号',
      dataIndex: 'projectCode',
      key: 'projectCode',
      width: 120,
      fixed: 'left',
    },
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '阶段',
      dataIndex: 'stageName',
      key: 'stageName',
      width: 120,
    },
    {
      title: '任务名称',
      dataIndex: 'taskName',
      key: 'taskName',
      width: 180,
      ellipsis: true,
    },
    {
      title: '完成日期',
      dataIndex: 'completedDate',
      key: 'completedDate',
      width: 120,
      render: (date: string) => formatTaskDate(date),
    },
    {
      title: '状态',
      dataIndex: 'completed',
      key: 'completed',
      width: 100,
      render: (completed: boolean) => (
        <Tag color={completed ? 'success' : 'default'} icon={completed ? <CheckCircleOutlined /> : <ClockCircleOutlined />}>
          {completed ? '已完成' : '待处理'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleProjectTaskClick(record)}
        >
          填报
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* 页面标题 */}
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          任务列表
        </Title>
        <Text type="secondary">
          按任务类型分类展示，查看和填报项目级任务与设备级任务进度
        </Text>
      </div>

      {/* Tab 切换 */}
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as 'project' | 'device')}
        items={[
          {
            key: 'project',
            label: (
              <span>
                <ProjectOutlined />
                项目级任务
              </span>
            ),
            children: (
              <div>
                {/* 统计概览卡片 */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="任务总数"
                        value={projectStatistics.totalTasks}
                        prefix={<AppstoreOutlined />}
                        valueStyle={{ fontSize: 24, color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="涉及项目"
                        value={projectStatistics.totalDevices}
                        valueStyle={{ fontSize: 24, color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="已完成"
                        value={projectStatistics.completedTasks}
                        prefix={<CheckCircleOutlined />}
                        valueStyle={{ fontSize: 24, color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="待处理"
                        value={projectStatistics.pendingTasks}
                        prefix={<ClockCircleOutlined />}
                        valueStyle={{ fontSize: 24, color: '#d9d9d9' }}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* 筛选工具栏 */}
                <Card style={{ marginBottom: 16 }}>
                  <Space wrap size="middle">
                    <Input
                      placeholder="搜索任务名称"
                      prefix={<SearchOutlined />}
                      style={{ width: 200 }}
                      value={projectSearchText}
                      onChange={(e) => setProjectSearchText(e.target.value)}
                      allowClear
                    />
                    <Select
                      placeholder="状态筛选"
                      style={{ width: 120 }}
                      value={projectStatusFilter}
                      onChange={setProjectStatusFilter}
                      options={statusOptions}
                    />
                    <Select
                      mode="multiple"
                      placeholder="项目筛选"
                      style={{ width: 250 }}
                      value={projectProjectFilter}
                      onChange={setProjectProjectFilter}
                      options={projectOptions}
                      maxTagCount="responsive"
                      allowClear
                    />
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={() => {
                        setProjectSearchText('');
                        setProjectStatusFilter('all');
                        setProjectProjectFilter([]);
                      }}
                    >
                      重置筛选
                    </Button>
                  </Space>
                </Card>

                {/* 项目级任务列表表格 */}
                <Card>
                  <Spin spinning={loading}>
                    {projectFilteredList.length === 0 ? (
                      <Empty description="暂无项目级任务数据" />
                    ) : (
                      <Table
                        columns={projectColumns}
                        dataSource={projectFilteredList}
                        rowKey="key"
                        scroll={{ x: 900 }}
                        pagination={{
                          showSizeChanger: true,
                          showTotal: (total) => `共 ${total} 条`,
                          defaultPageSize: 20,
                          pageSizeOptions: ['10', '20', '50', '100'],
                        }}
                      />
                    )}
                  </Spin>
                </Card>
              </div>
            ),
          },
          {
            key: 'device',
            label: (
              <span>
                <AppstoreOutlined />
                设备级任务
              </span>
            ),
            children: (
              <div>
                {/* 统计概览卡片 */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={4}>
                    <Card>
                      <Statistic
                        title="任务类型"
                        value={deviceStatistics.totalTasks}
                        prefix={<AppstoreOutlined />}
                        valueStyle={{ fontSize: 24, color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                  <Col span={4}>
                    <Card>
                      <Statistic
                        title="设备总数"
                        value={deviceStatistics.totalDevices}
                        valueStyle={{ fontSize: 24, color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                  <Col span={4}>
                    <Card>
                      <Statistic
                        title="已完成设备"
                        value={deviceStatistics.completedDevices}
                        prefix={<CheckCircleOutlined />}
                        valueStyle={{ fontSize: 24, color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                  <Col span={4}>
                    <Card>
                      <Statistic
                        title="待处理"
                        value={deviceStatistics.pendingTasks}
                        prefix={<ClockCircleOutlined />}
                        valueStyle={{ fontSize: 24, color: '#d9d9d9' }}
                      />
                    </Card>
                  </Col>
                  <Col span={4}>
                    <Card>
                      <Statistic
                        title="进行中"
                        value={deviceStatistics.inProgressTasks}
                        valueStyle={{ fontSize: 24, color: '#faad14' }}
                      />
                    </Card>
                  </Col>
                  <Col span={4}>
                    <Card>
                      <Statistic
                        title="已完成"
                        value={deviceStatistics.completedTasks}
                        prefix={<CheckCircleOutlined />}
                        valueStyle={{ fontSize: 24, color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* 筛选工具栏 */}
                <Card style={{ marginBottom: 16 }}>
                  <Space wrap size="middle">
                    <Input
                      placeholder="搜索设备名称"
                      prefix={<SearchOutlined />}
                      style={{ width: 200 }}
                      value={deviceSearchText}
                      onChange={(e) => setDeviceSearchText(e.target.value)}
                      allowClear
                    />
                    <Select
                      placeholder="状态筛选"
                      style={{ width: 120 }}
                      value={deviceStatusFilter}
                      onChange={setDeviceStatusFilter}
                      options={statusOptions}
                    />
                    <Select
                      mode="multiple"
                      placeholder="项目筛选"
                      style={{ width: 250 }}
                      value={deviceProjectFilter}
                      onChange={setDeviceProjectFilter}
                      options={projectOptions}
                      maxTagCount="responsive"
                      allowClear
                    />
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={() => {
                        setDeviceSearchText('');
                        setDeviceStatusFilter('all');
                        setDeviceProjectFilter([]);
                      }}
                    >
                      重置筛选
                    </Button>
                  </Space>
                </Card>

                {/* 设备级任务列表表格 */}
                <Card>
                  <Spin spinning={loading}>
                    {deviceFilteredList.length === 0 ? (
                      <Empty description="暂无设备级任务数据" />
                    ) : (
                      <Table
                        columns={deviceColumns}
                        dataSource={deviceFilteredList}
                        rowKey="key"
                        scroll={{ x: 1100 }}
                        pagination={{
                          showSizeChanger: true,
                          showTotal: (total) => `共 ${total} 条`,
                          defaultPageSize: 20,
                          pageSizeOptions: ['10', '20', '50', '100'],
                        }}
                      />
                    )}
                  </Spin>
                </Card>
              </div>
            ),
          },
        ]}
      />

      {/* 填报模态框 - 设备级任务（单设备模式） */}
      {selectedTaskType === 'device' && selectedDeviceItem && (
        <TaskReportModal
          visible={reportModalVisible}
          deviceTaskItem={selectedDeviceItem}
          projects={projects}
          onClose={() => {
            setReportModalVisible(false);
            setSelectedDeviceItem(null);
          }}
          onSuccess={handleReportSuccess}
        />
      )}

      {/* 填报模态框 - 项目级任务 */}
      {selectedTaskType === 'project' && selectedProjectItem && (
        <TaskReportModal
          visible={reportModalVisible}
          taskCard={{
            taskKey: selectedProjectItem.taskKey,
            taskName: selectedProjectItem.taskName,
            totalDeviceCount: 1,
            completedDeviceCount: selectedProjectItem.completed ? 1 : 0,
            progress: selectedProjectItem.completed ? 100 : 0,
            projectGroups: [
              {
                projectId: selectedProjectItem.projectId,
                projectName: selectedProjectItem.projectName,
                projectCode: selectedProjectItem.projectCode,
                stageKey: selectedProjectItem.stageKey,
                stageName: selectedProjectItem.stageName,
                devices: [
                  {
                    deviceId: selectedProjectItem.projectId,
                    deviceName: selectedProjectItem.projectName,
                    completed: selectedProjectItem.completed,
                    completedDate: selectedProjectItem.completedDate,
                    remark: selectedProjectItem.remark,
                    taskId: selectedProjectItem.taskId,
                  },
                ],
              },
            ],
            materialRequirements: selectedProjectItem.materialRequirements,
          }}
          projects={projects}
          taskType="project"
          projectTaskItem={selectedProjectItem}
          onClose={() => {
            setReportModalVisible(false);
            setSelectedProjectItem(null);
          }}
          onSuccess={handleReportSuccess}
        />
      )}
    </div>
  );
};

export default TaskList;
