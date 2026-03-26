import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Tabs, Input, message, Spin, Empty, Alert, Tag, Space, Typography, Collapse, Button, Progress, Checkbox, Card } from 'antd';
import { SearchOutlined, ProjectOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { TaskCardData, ProjectDeviceGroup, ProjectTaskListItem, DeviceTaskListItem } from '../../types/task';
import { Project, StageDeviceProgress } from '../../types/project';
import { useProjectStore } from '../../stores/projectStore';
import { useStageStore } from '../../stores/stageStore';
import DeviceTaskProgressPanel from '../../components/Progress/DeviceTaskProgressPanel';
import { StageTaskTemplate } from '../../types/project';

const { Text, Title } = Typography;
const { Search } = Input;

// 扩展设备进度类型，包含任务进度
type ExtendedDeviceProgress = StageDeviceProgress & {
  taskProgress?: Array<{
    deviceId: string;
    deviceName: string;
    taskId: string;
    taskKey: string;
    taskName: string;
    completed: boolean;
    completedDate?: string;
    remark?: string;
    materials?: any[];
  }>;
};

interface TaskReportModalProps {
  visible: boolean;
  // 单设备填报模式：直接传递单个设备任务项
  deviceTaskItem?: DeviceTaskListItem;
  // 批量填报模式：传递聚合的任务卡片数据（向后兼容）
  taskCard?: TaskCardData | null;
  projects: Project[];
  taskType?: 'device' | 'project'; // 任务类型
  projectTaskItem?: ProjectTaskListItem | null; // 项目级任务项
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * 任务填报模态框
 * 支持设备级任务和项目级任务的填报
 */
const TaskReportModal: React.FC<TaskReportModalProps> = ({
  visible,
  deviceTaskItem,
  taskCard,
  projects,
  taskType = 'device',
  projectTaskItem,
  onClose,
  onSuccess,
}) => {
  const { updateStageProgress } = useProjectStore();
  const { stageDefinitions } = useStageStore();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeProjectKey, setActiveProjectKey] = useState<string | string[]>([]);

  // 本地状态：存储每个项目的设备进度数据
  const [projectStageData, setProjectStageData] = useState<Map<string, {
    projectId: string;
    stageKey: string;
    deviceProgress: ExtendedDeviceProgress[];
    // 项目级任务的任务进度
    taskProgress?: Array<{
      taskId: string;
      taskKey: string;
      taskName: string;
      completed: boolean;
      completedDate?: string;
      remark?: string;
      materials?: any[];
    }>;
  }>>(new Map());

  // 项目级任务的本地状态
  const [projectTaskCompleted, setProjectTaskCompleted] = useState(false);
  const [projectTaskRemark, setProjectTaskRemark] = useState('');
  const [projectTaskMaterials, setProjectTaskMaterials] = useState<any[]>([]);

  // 单设备任务的本地状态
  const [singleDeviceTaskProgress, setSingleDeviceTaskProgress] = useState<any[]>([]);
  const [singleDeviceCompleted, setSingleDeviceCompleted] = useState(false);
  const [singleDeviceRemark, setSingleDeviceRemark] = useState('');

  // 判断当前渲染模式
  const renderMode = useMemo(() => {
    if (deviceTaskItem) return 'single-device';
    if (taskType === 'project' && projectTaskItem) return 'project-task';
    return 'batch-device';  // 原有的批量设备填报
  }, [deviceTaskItem, taskType, projectTaskItem]);

  // 获取完整的阶段任务模板列表（用于渲染）
  const stageTaskTemplates: StageTaskTemplate[] = useMemo(() => {
    if (renderMode === 'single-device' && deviceTaskItem) {
      // 单设备模式：从 deviceTaskItem 获取任务模板
      const stageDef = stageDefinitions.find(def => def.key === deviceTaskItem.stageKey);
      return stageDef?.taskTemplates || [];
    }

    if (!taskCard || taskCard.projectGroups.length === 0) {
      return [];
    }

    // 批量模式：尝试从 stageDefinitions 获取任务模板
    for (const pg of taskCard.projectGroups) {
      const project = projects.find(p => p.id === pg.projectId);
      if (!project) continue;

      const stageConfig = project.stageConfigs.find(sc => sc.stageKey === pg.stageKey);
      if (!stageConfig) continue;

      const stageDef = stageDefinitions.find(def => def.key === pg.stageKey);
      if (!stageDef || !stageDef.taskTemplates) continue;

      return stageDef.taskTemplates;
    }

    return [];
  }, [renderMode, deviceTaskItem, taskCard, projects, stageDefinitions]);

  // 获取当前任务对应的模板
  const currentTaskTemplate: StageTaskTemplate | null = useMemo(() => {
    const taskKey = renderMode === 'single-device' ? deviceTaskItem?.taskKey : taskCard?.taskKey;
    const taskName = renderMode === 'single-device' ? deviceTaskItem?.taskName : taskCard?.taskName;
    const materialRequirements = renderMode === 'single-device'
      ? deviceTaskItem?.materialRequirements
      : taskCard?.materialRequirements;

    const templates = stageTaskTemplates;
    const matchedTemplate = templates.find(t => t.key === taskKey);

    if (matchedTemplate) {
      return matchedTemplate;
    }

    // 兜底逻辑：从 materialRequirements 构建临时任务模板
    if (materialRequirements && materialRequirements.length > 0 && taskKey) {
      return {
        id: `fallback_${taskKey}`,
        key: taskKey,
        name: taskName || '未知任务',
        description: '从资料需求自动生成的模板',
        materialRequirements: materialRequirements,
      };
    }

    return null;
  }, [renderMode, deviceTaskItem, taskCard, stageTaskTemplates]);

  // 初始化数据
  useEffect(() => {
    if (visible) {
      setSearchText('');

      // 单设备模式：初始化单个设备任务数据
      if (deviceTaskItem && renderMode === 'single-device') {
        const project = projects.find(p => p.id === deviceTaskItem.projectId);
        if (project) {
          const stageConfig = project.stageConfigs.find(sc => sc.stageKey === deviceTaskItem.stageKey);
          if (stageConfig) {
            const deviceProgress = stageConfig.deviceProgress?.find(dp => dp.deviceId === deviceTaskItem.deviceId);
            const existingTaskProgress = deviceProgress?.taskProgress?.find(tp => tp.taskKey === deviceTaskItem.taskKey);

            setSingleDeviceCompleted(existingTaskProgress?.completed || false);
            setSingleDeviceRemark(existingTaskProgress?.remark || '');
            setSingleDeviceTaskProgress(existingTaskProgress ? [existingTaskProgress] : [{
              deviceId: deviceTaskItem.deviceId,
              deviceName: deviceTaskItem.deviceName,
              taskId: deviceTaskItem.taskId,
              taskKey: deviceTaskItem.taskKey,
              taskName: deviceTaskItem.taskName,
              completed: false,
              materials: deviceTaskItem.materialRequirements?.map(req => ({
                requirementKey: req.key,
                requirementName: req.name,
                files: [],
                completed: false,
              })) || [],
            }]);
          }
        }
        return;
      }

      // 批量模式或项目级任务模式：原有逻辑
      if (!taskCard || !currentTaskTemplate) return;

      setActiveProjectKey(taskCard.projectGroups.map(pg => pg.projectId));

      if (taskType === 'project' && projectTaskItem) {
        // 初始化项目级任务数据
        setProjectTaskCompleted(projectTaskItem.completed || false);
        setProjectTaskRemark(projectTaskItem.remark || '');
        setProjectTaskMaterials(projectTaskItem.materials || []);

        const dataMap = new Map();
        const project = projects.find(p => p.id === projectTaskItem.projectId);
        if (project) {
          const stageConfig = project.stageConfigs.find(sc => sc.stageKey === projectTaskItem.stageKey);
          if (stageConfig) {
            dataMap.set(projectTaskItem.projectId, {
              projectId: projectTaskItem.projectId,
              stageKey: projectTaskItem.stageKey,
              deviceProgress: [],
              taskProgress: stageConfig.taskProgress || [],
            });
          }
        }
        setProjectStageData(dataMap);
      } else {
        // 初始化设备级任务数据
        const dataMap = new Map<string, {
          projectId: string;
          stageKey: string;
          deviceProgress: ExtendedDeviceProgress[];
        }>();
        taskCard.projectGroups.forEach(pg => {
          const project = projects.find(p => p.id === pg.projectId);
          if (!project) return;

          const stageConfig = project.stageConfigs.find(sc => sc.stageKey === pg.stageKey);
          if (!stageConfig) return;

          // 找到该任务对应的设备进度数据
          const deviceProgress: ExtendedDeviceProgress[] = (stageConfig.deviceProgress || []).map(dp => {
            const updatedTaskProgress = dp.taskProgress?.map(tp => {
              if (tp.taskKey === taskCard.taskKey) {
                if (!tp.materials || tp.materials.length === 0) {
                  tp.materials = currentTaskTemplate.materialRequirements.map(req => ({
                    requirementKey: req.key,
                    requirementName: req.name,
                    files: [],
                    completed: false,
                  }));
                }
              }
              return tp;
            }) || [];

            return {
              ...dp,
              taskProgress: updatedTaskProgress,
            };
          });

          dataMap.set(pg.projectId, {
            projectId: pg.projectId,
            stageKey: pg.stageKey,
            deviceProgress,
          });
        });

        setProjectStageData(dataMap);
      }
    }
  }, [visible, deviceTaskItem, taskCard, projects, stageDefinitions, currentTaskTemplate, taskType, projectTaskItem, renderMode]);

  // 单设备模式不需要 taskCard
  if (renderMode === 'single-device') {
    // 数据将在初始化后加载
  } else if (!taskCard || !currentTaskTemplate) {
    return null;
  }

  // 处理设备任务进度变化
  const handleDeviceTaskChange = (projectId: string, deviceIndex: number, taskProgress: any[]) => {
    setProjectStageData(prev => {
      const newMap = new Map(prev);
      const data = newMap.get(projectId);
      if (!data) return newMap;

      const updatedDeviceProgress = [...data.deviceProgress];
      updatedDeviceProgress[deviceIndex] = {
        ...updatedDeviceProgress[deviceIndex],
        taskProgress,
      };

      newMap.set(projectId, {
        ...data,
        deviceProgress: updatedDeviceProgress,
      });

      return newMap;
    });
  };

  // 过滤设备列表
  const filterDevices = (devices: ExtendedDeviceProgress[]) => {
    if (!searchText.trim()) return devices;
    const searchLower = searchText.toLowerCase();
    return devices.filter(d => d.deviceName.toLowerCase().includes(searchLower));
  };

  // 计算完成统计（设备级任务）
  const calculateDeviceCompletionStats = () => {
    if (!taskCard) return { totalDevices: 0, completedDevices: 0 };

    let totalDevices = 0;
    let completedDevices = 0;

    taskCard.projectGroups.forEach(pg => {
      const data = projectStageData.get(pg.projectId);
      if (!data) return;

      data.deviceProgress.forEach((dp: ExtendedDeviceProgress) => {
        totalDevices++;
        const taskProgress = dp.taskProgress?.find((tp: any) => tp.taskKey === taskCard?.taskKey);
        if (taskProgress?.completed) {
          completedDevices++;
        }
      });
    });

    return { totalDevices, completedDevices };
  };

  const deviceStats = calculateDeviceCompletionStats();

  // 处理提交
  const handleSubmit = () => {
    setLoading(true);

    try {
      if (renderMode === 'single-device' && deviceTaskItem) {
        // 单设备模式：只更新单个设备的任务进度
        const project = projects.find(p => p.id === deviceTaskItem.projectId);
        if (!project) {
          throw new Error('项目不存在');
        }

        const stageConfigIndex = project.stageConfigs.findIndex(
          sc => sc.stageKey === deviceTaskItem.stageKey
        );

        if (stageConfigIndex === -1) {
          throw new Error('阶段配置不存在');
        }

        const stageConfig = project.stageConfigs[stageConfigIndex];
        const deviceProgressIndex = stageConfig.deviceProgress?.findIndex(
          dp => dp.deviceId === deviceTaskItem.deviceId
        ) ?? -1;

        if (deviceProgressIndex === -1) {
          throw new Error('设备不存在');
        }

        // 更新目标设备的任务进度
        const updatedDeviceProgress = [...(stageConfig.deviceProgress || [])];
        const existingTaskProgress = updatedDeviceProgress[deviceProgressIndex].taskProgress || [];
        const taskProgressIndex = existingTaskProgress.findIndex(
          tp => tp.taskKey === deviceTaskItem.taskKey
        );

        const newTaskProgress = {
          deviceId: deviceTaskItem.deviceId,
          deviceName: deviceTaskItem.deviceName,
          taskId: deviceTaskItem.taskId,
          taskKey: deviceTaskItem.taskKey,
          taskName: deviceTaskItem.taskName,
          completed: singleDeviceCompleted,
          completedDate: singleDeviceCompleted ? new Date().toISOString() : undefined,
          remark: singleDeviceRemark,
          materials: singleDeviceTaskProgress[0]?.materials || [],
        };

        let updatedTaskProgress;
        if (taskProgressIndex >= 0) {
          updatedTaskProgress = [...existingTaskProgress];
          updatedTaskProgress[taskProgressIndex] = newTaskProgress;
        } else {
          updatedTaskProgress = [...existingTaskProgress, newTaskProgress];
        }

        updatedDeviceProgress[deviceProgressIndex] = {
          ...updatedDeviceProgress[deviceProgressIndex],
          taskProgress: updatedTaskProgress,
        };

        updateStageProgress(
          deviceTaskItem.projectId,
          deviceTaskItem.stageKey,
          { deviceProgress: updatedDeviceProgress }
        );

        message.success('填报成功！');
      } else if (taskType === 'project' && projectTaskItem) {
        // 提交项目级任务
        const project = projects.find(p => p.id === projectTaskItem.projectId);
        if (!project) {
          throw new Error('项目不存在');
        }

        const stageConfigIndex = project.stageConfigs.findIndex(
          sc => sc.stageKey === projectTaskItem.stageKey
        );

        if (stageConfigIndex === -1) {
          throw new Error('阶段配置不存在');
        }

        // 更新项目级任务进度
        const updatedTaskProgress = (project.stageConfigs[stageConfigIndex].taskProgress || []).map(tp => {
          if (tp.taskKey === projectTaskItem.taskKey) {
            return {
              ...tp,
              completed: projectTaskCompleted,
              completedDate: projectTaskCompleted ? new Date().toISOString() : undefined,
              remark: projectTaskRemark,
              materials: projectTaskMaterials,
            };
          }
          return tp;
        });

        // 如果任务不存在，添加它
        if (!updatedTaskProgress.some(tp => tp.taskKey === projectTaskItem.taskKey)) {
          updatedTaskProgress.push({
            taskId: projectTaskItem.taskId,
            taskKey: projectTaskItem.taskKey,
            taskName: projectTaskItem.taskName,
            completed: projectTaskCompleted,
            completedDate: projectTaskCompleted ? new Date().toISOString() : undefined,
            remark: projectTaskRemark,
            materials: projectTaskMaterials,
          });
        }

        updateStageProgress(
          projectTaskItem.projectId,
          projectTaskItem.stageKey,
          { taskProgress: updatedTaskProgress }
        );

        message.success('填报成功！');
      } else {
        // 提交设备级任务
        projectStageData.forEach((data, projectId) => {
          const project = projects.find(p => p.id === projectId);
          if (!project) return;

          const stageConfigIndex = project.stageConfigs.findIndex(
            sc => sc.stageKey === data.stageKey
          );

          if (stageConfigIndex === -1) return;

          const updateData: any = {
            deviceProgress: data.deviceProgress,
          };

          updateStageProgress(projectId, data.stageKey, updateData);
        });

        message.success('填报成功！');
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      message.error('填报失败，请重试');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 渲染设备级任务的项目标签页内容
  const renderDeviceProjectContent = (pg: ProjectDeviceGroup) => {
    const data = projectStageData.get(pg.projectId);
    if (!data) {
      return <Empty description="数据加载失败" />;
    }

    const filteredDevices = filterDevices(data.deviceProgress);

    return (
      <div style={{ padding: '16px 0' }}>
        <Alert
          message={
            <Space>
              <ProjectOutlined />
              <Text strong>{pg.projectName}</Text>
              <Text type="secondary">({pg.projectCode})</Text>
              <Tag color="blue">{pg.stageName}</Tag>
            </Space>
          }
          type="info"
          style={{ marginBottom: 16 }}
        />

        {filteredDevices.length === 0 ? (
          <Empty description="未找到匹配的设备" />
        ) : (
          <Collapse
            defaultActiveKey={[]}
            expandIconPosition="end"
            size="small"
          >
            {filteredDevices.map((device, index) => {
              const originalIndex = data.deviceProgress.findIndex(
                d => d.deviceId === device.deviceId
              );

              return (
                <Collapse.Panel
                  key={device.deviceId}
                  header={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                      <Text strong>{device.deviceName}</Text>
                      <Tag
                        color={device.taskProgress?.find(tp => tp.taskKey === taskCard?.taskKey)?.completed
                          ? 'success'
                          : 'default'
                        }
                      >
                        {device.taskProgress?.find(tp => tp.taskKey === taskCard?.taskKey)?.completed
                          ? '已完成'
                          : '未完成'
                        }
                      </Tag>
                    </div>
                  }
                >
                  <DeviceTaskProgressPanel
                    device={{
                      deviceId: device.deviceId,
                      deviceName: device.deviceName,
                    }}
                    taskTemplates={stageTaskTemplates.length > 0 ? stageTaskTemplates : (currentTaskTemplate ? [currentTaskTemplate] : [])}
                    taskProgress={device.taskProgress?.filter(tp => tp.taskKey === taskCard?.taskKey) || [
                      {
                        deviceId: device.deviceId,
                        deviceName: device.deviceName,
                        taskId: currentTaskTemplate?.id || '',
                        taskKey: taskCard?.taskKey || '',
                        taskName: taskCard?.taskName || '',
                        completed: false,
                        materials: (currentTaskTemplate?.materialRequirements || []).map(req => ({
                          requirementKey: req.key,
                          requirementName: req.name,
                          files: [],
                          completed: false,
                        })),
                      }
                    ]}
                    onChange={(taskProgress) => handleDeviceTaskChange(pg.projectId, originalIndex, taskProgress)}
                  />
                </Collapse.Panel>
              );
            })}
          </Collapse>
        )}
      </div>
    );
  };

  // 渲染项目级任务内容
  const renderProjectTaskContent = () => {
    if (!projectTaskItem) {
      return <Empty description="数据加载失败" />;
    }

    const project = projects.find(p => p.id === projectTaskItem.projectId);
    if (!project) {
      return <Empty description="项目不存在" />;
    }

    return (
      <div style={{ padding: '16px 0' }}>
        <Alert
          message={
            <Space>
              <ProjectOutlined />
              <Text strong>{projectTaskItem.projectName}</Text>
              <Text type="secondary">({projectTaskItem.projectCode})</Text>
              <Tag color="blue">{projectTaskItem.stageName}</Tag>
            </Space>
          }
          type="info"
          style={{ marginBottom: 16 }}
        />

        <Card title="任务信息" size="small" style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>任务名称：</Text>
              <Text>{projectTaskItem.taskName}</Text>
            </div>
            <div>
              <Text strong>完成状态：</Text>
              <Checkbox
                checked={projectTaskCompleted}
                onChange={(e) => setProjectTaskCompleted(e.target.checked)}
              >
                已完成
              </Checkbox>
            </div>
            <div>
              <Text strong>备注：</Text>
              <Input.TextArea
                value={projectTaskRemark}
                onChange={(e) => setProjectTaskRemark(e.target.value)}
                placeholder="请输入备注信息"
                rows={3}
              />
            </div>
          </Space>
        </Card>

        {currentTaskTemplate && currentTaskTemplate.materialRequirements && currentTaskTemplate.materialRequirements.length > 0 && (
          <Card title="资料需求" size="small">
            <DeviceTaskProgressPanel
              device={{
                deviceId: projectTaskItem.projectId,
                deviceName: projectTaskItem.projectName,
              }}
              taskTemplates={[currentTaskTemplate]}
              taskProgress={[
                {
                  deviceId: projectTaskItem.projectId,
                  deviceName: projectTaskItem.projectName,
                  taskId: projectTaskItem.taskId,
                  taskKey: projectTaskItem.taskKey,
                  taskName: projectTaskItem.taskName,
                  completed: projectTaskCompleted,
                  remark: projectTaskRemark,
                  materials: projectTaskMaterials,
                }
              ]}
              onChange={(taskProgress) => {
                if (taskProgress && taskProgress.length > 0) {
                  const materials = taskProgress[0]?.materials || [];
                  setProjectTaskMaterials(materials);
                }
              }}
            />
          </Card>
        )}
      </div>
    );
  };

  return (
    <Modal
      title={
        <Space>
          <Title level={5} style={{ margin: 0 }}>
            {renderMode === 'single-device'
              ? `${deviceTaskItem?.deviceName} - ${deviceTaskItem?.taskName}`
              : `${taskCard?.taskName} - 任务填报`
            }
          </Title>
          {renderMode === 'batch-device' && taskCard && (
            <Tag color={taskCard.progress === 100 ? 'success' : 'processing'}>
              {taskCard.progress}%
            </Tag>
          )}
          <Tag color={taskType === 'project' ? 'blue' : 'green'}>
            {taskType === 'project' ? '项目级任务' : renderMode === 'single-device' ? '设备任务填报' : '设备级任务'}
          </Tag>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={taskType === 'project' || renderMode === 'single-device' ? 800 : 1000}
      styles={{ body: { padding: '16px 24px' } }}
      footer={null}
    >
      <Spin spinning={loading}>
        {renderMode === 'single-device' && deviceTaskItem ? (
          <>
            {/* 单设备模式 */}
            {(() => {
              const project = projects.find(p => p.id === deviceTaskItem.projectId);
              const stageDef = stageDefinitions.find(def => def.key === deviceTaskItem.stageKey);

              return (
                <>
                  <Alert
                    message={
                      <Space>
                        <ProjectOutlined />
                        <Text strong>{project?.name || deviceTaskItem.projectName}</Text>
                        <Text type="secondary">({deviceTaskItem.projectCode})</Text>
                        <Tag color="blue">{stageDef?.name || deviceTaskItem.stageName}</Tag>
                      </Space>
                    }
                    type="info"
                    style={{ marginBottom: 16 }}
                  />

                  <Card title="任务信息" size="small" style={{ marginBottom: 16 }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text strong>任务名称：</Text>
                        <Text>{deviceTaskItem.taskName}</Text>
                      </div>
                      <div>
                        <Text strong>完成状态：</Text>
                        <Checkbox
                          checked={singleDeviceCompleted}
                          onChange={(e) => setSingleDeviceCompleted(e.target.checked)}
                        >
                          已完成
                        </Checkbox>
                      </div>
                      <div>
                        <Text strong>备注：</Text>
                        <Input.TextArea
                          value={singleDeviceRemark}
                          onChange={(e) => setSingleDeviceRemark(e.target.value)}
                          placeholder="请输入备注信息"
                          rows={3}
                        />
                      </div>
                    </Space>
                  </Card>

                  {currentTaskTemplate && (
                    <Card title="资料需求" size="small">
                      <DeviceTaskProgressPanel
                        device={{
                          deviceId: deviceTaskItem.deviceId,
                          deviceName: deviceTaskItem.deviceName,
                        }}
                        taskTemplates={[currentTaskTemplate]}
                        taskProgress={singleDeviceTaskProgress}
                        onChange={(taskProgress) => {
                          if (taskProgress && taskProgress.length > 0) {
                            setSingleDeviceTaskProgress(taskProgress);
                            // 同步完成状态
                            if (taskProgress[0].completed !== singleDeviceCompleted) {
                              setSingleDeviceCompleted(taskProgress[0].completed);
                            }
                          }
                        }}
                      />
                    </Card>
                  )}
                </>
              );
            })()}
          </>
        ) : taskType === 'project' ? (
          <>
            {/* 项目级任务视图 */}
            <Alert
              message={
                <div>
                  <Space>
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                    <Text strong>项目级任务填报</Text>
                    <Tag color={projectTaskCompleted ? 'success' : 'default'}>
                      {projectTaskCompleted ? '已完成' : '待处理'}
                    </Tag>
                  </Space>
                </div>
              }
              type="info"
              showIcon={false}
              style={{ marginBottom: 16 }}
            />

            {renderProjectTaskContent()}
          </>
        ) : (
          <>
            {/* 设备级任务视图 */}
            <Alert
              message={
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Space>
                      <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                      <Text strong>填报进度</Text>
                    </Space>
                    <Text>
                      已完成 <Text strong style={{ color: '#52c41a' }}>{deviceStats.completedDevices}</Text> / {deviceStats.totalDevices} 台设备
                    </Text>
                  </div>
                  <Progress
                    percent={(deviceStats.completedDevices / deviceStats.totalDevices * 100) || 0}
                    strokeColor={deviceStats.completedDevices === deviceStats.totalDevices ? '#52c41a' : '#1890ff'}
                    format={(percent) => `${Math.round(percent || 0)}%`}
                  />
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, marginTop: 8 }}>
                    <Text type="secondary">涉及 {taskCard?.projectGroups.length || 0} 个项目</Text>
                    <Text type="secondary">共 {taskCard?.totalDeviceCount || 0} 台设备</Text>
                    {stageTaskTemplates.length > 0 && (
                      <Text type="secondary">包含 {stageTaskTemplates.length} 个任务</Text>
                    )}
                  </div>
                </div>
              }
              type="info"
              showIcon={false}
              style={{ marginBottom: 16 }}
            />

            <Search
              placeholder="搜索设备名称"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ marginBottom: 16 }}
            />

            {taskCard?.projectGroups.length === 0 ? (
              <Empty description="暂无数据" />
            ) : (
              <Tabs
                activeKey={activeProjectKey as string}
                onChange={setActiveProjectKey}
                type="card"
                size="small"
                items={taskCard?.projectGroups.map((pg, index) => ({
                  key: pg.projectId,
                  label: (
                    <Space>
                      <Text>{pg.projectCode}</Text>
                      <Tag>{pg.devices.length}台</Tag>
                    </Space>
                  ),
                  children: renderDeviceProjectContent(pg),
                }))}
              />
            )}
          </>
        )}

        {/* 底部操作按钮 */}
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button type="primary" onClick={handleSubmit} disabled={loading} loading={loading}>
            {loading ? '提交中...' : '提交'}
          </Button>
        </div>
      </Spin>
    </Modal>
  );
};

export default TaskReportModal;
