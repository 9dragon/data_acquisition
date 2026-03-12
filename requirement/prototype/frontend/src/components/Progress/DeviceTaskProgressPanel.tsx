import React, { useState, useEffect } from 'react';
import { Checkbox, Input, DatePicker, Space, Typography, Tag, Collapse, Progress, Button, Tooltip, Card } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, DownOutlined, UpOutlined, FileOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { DeviceTaskProgress, StageTaskTemplate } from '../../types/project';
import { calculateDeviceTaskProgress, isDeviceFullyCompleted, validateTaskMaterials } from '../../utils/progressCalculators';
import TaskMaterialCollection from './TaskMaterialCollection';

const { TextArea } = Input;
const { Text } = Typography;

interface DeviceTaskProgressPanelProps {
  device: {
    deviceId: string;
    deviceName: string;
  };
  taskTemplates: StageTaskTemplate[];
  taskProgress: DeviceTaskProgress[];
  onChange: (taskProgress: DeviceTaskProgress[]) => void;
  disabled?: boolean;
}

/**
 * 设备任务填报面板
 * 展示设备的所有任务，每个任务可折叠展开显示资料收集面板
 */
const DeviceTaskProgressPanel: React.FC<DeviceTaskProgressPanelProps> = ({
  device,
  taskTemplates,
  taskProgress,
  onChange,
  disabled = false,
}) => {
  const [localTasks, setLocalTasks] = useState<DeviceTaskProgress[]>(taskProgress);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  useEffect(() => {
    setLocalTasks(taskProgress);
  }, [taskProgress]);

  // 确保所有任务模板都有对应的进度记录
  useEffect(() => {
    const existingTaskIds = localTasks.map(t => t.taskId);
    const missingTasks = taskTemplates.filter(template => !existingTaskIds.includes(template.id));

    if (missingTasks.length > 0) {
      const newTasks = missingTasks.map(template => ({
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        taskId: template.id,
        taskKey: template.key,
        taskName: template.name,
        completed: false,
        materials: template.materialRequirements.map(req => ({
          requirementKey: req.key,
          requirementName: req.name,
          files: [],
          completed: false,
        })),
      }));
      setLocalTasks(prev => [...prev, ...newTasks]);
      onChange([...localTasks, ...newTasks]);
    }
  }, [taskTemplates, localTasks, device, onChange]);

  // 计算设备整体完成度
  const deviceProgress = calculateDeviceTaskProgress(localTasks, taskTemplates);
  const isFullyCompleted = isDeviceFullyCompleted(localTasks, taskTemplates);

  // 处理任务完成状态变化
  const handleTaskCompleteChange = (taskId: string, completed: boolean) => {
    const updatedTasks = localTasks.map(task => {
      if (task.taskId === taskId) {
        return {
          ...task,
          completed,
          completedDate: completed ? new Date().toISOString().split('T')[0] : undefined,
        };
      }
      return task;
    });
    setLocalTasks(updatedTasks);
    onChange(updatedTasks);
  };

  // 处理任务备注变化
  const handleTaskRemarkChange = (taskId: string, remark: string) => {
    const updatedTasks = localTasks.map(task =>
      task.taskId === taskId ? { ...task, remark } : task
    );
    setLocalTasks(updatedTasks);
    onChange(updatedTasks);
  };

  // 处理完成日期变化
  const handleTaskDateChange = (taskId: string, date: dayjs.Dayjs | null) => {
    const updatedTasks = localTasks.map(task => {
      if (task.taskId === taskId) {
        return {
          ...task,
          completedDate: date ? date.format('YYYY-MM-DD') : undefined,
        };
      }
      return task;
    });
    setLocalTasks(updatedTasks);
    onChange(updatedTasks);
  };

  // 处理资料变化
  const handleMaterialChange = (taskId: string, materials: any[]) => {
    const updatedTasks = localTasks.map(task => {
      if (task.taskId === taskId) {
        // 检查任务是否应该标记为完成（所有必填资料已完成）
        const template = taskTemplates.find(t => t.id === taskId);
        let newCompletedState = task.completed;

        if (template) {
          const validation = validateTaskMaterials({ ...task, materials }, template);
          // 如果所有资料都完成了，自动将任务标记为完成
          if (validation.valid && !task.completed) {
            newCompletedState = true;
          }
        }

        return {
          ...task,
          materials,
          completed: newCompletedState,
          completedDate: newCompletedState && !task.completedDate ? new Date().toISOString().split('T')[0] : task.completedDate,
        };
      }
      return task;
    });
    setLocalTasks(updatedTasks);
    onChange(updatedTasks);
  };

  // 批量操作：全部完成
  const handleBatchComplete = () => {
    const updatedTasks = localTasks.map(task => {
      // 检查资料是否完整
      const template = taskTemplates.find(t => t.id === task.taskId);
      const canComplete = !template || template.materialRequirements.length === 0 ||
        (task.materials && task.materials.every(m => m.completed));

      return {
        ...task,
        completed: canComplete,
        completedDate: canComplete ? new Date().toISOString().split('T')[0] : task.completedDate,
      };
    });
    setLocalTasks(updatedTasks);
    onChange(updatedTasks);
  };

  // 批量操作：全部重置
  const handleBatchReset = () => {
    const updatedTasks = localTasks.map(task => ({
      ...task,
      completed: false,
      completedDate: undefined,
    }));
    setLocalTasks(updatedTasks);
    onChange(updatedTasks);
  };

  // 展开所有
  const handleExpandAll = () => {
    setActiveKeys(localTasks.map(t => t.taskId));
  };

  // 收起所有
  const handleCollapseAll = () => {
    setActiveKeys([]);
  };

  // 获取任务状态标签
  const getTaskStatusTag = (task: DeviceTaskProgress) => {
    if (task.completed) {
      // 检查资料是否完整
      const template = taskTemplates.find(t => t.id === task.taskId);
      if (template && template.materialRequirements.length > 0) {
        const validation = validateTaskMaterials(task, template);
        if (!validation.valid) {
          return <Tag color="warning">资料未完成</Tag>;
        }
      }
      return <Tag icon={<CheckCircleOutlined />} color="success">已完成</Tag>;
    }
    return <Tag icon={<ClockCircleOutlined />} color="default">未完成</Tag>;
  };

  return (
    <div>
      {/* 设备进度概览 */}
      <div style={{ marginBottom: 12, padding: 12, background: '#f0f2f5', borderRadius: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text strong>{device.deviceName}</Text>
          <Tag color={isFullyCompleted ? 'success' : 'processing'}>
            {deviceProgress}%
          </Tag>
        </div>
        <Progress
          percent={deviceProgress}
          size="small"
          strokeColor={isFullyCompleted ? '#52c41a' : '#1890ff'}
        />
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            已完成 {localTasks.filter(t => t.completed).length} / {taskTemplates.length} 个任务
          </Text>
          <Space size="small">
            <a
              onClick={disabled ? undefined : handleExpandAll}
              style={{ fontSize: 12, color: disabled ? '#ccc' : '#1890ff' }}
            >
              展开全部
            </a>
            <a
              onClick={disabled ? undefined : handleCollapseAll}
              style={{ fontSize: 12, color: disabled ? '#ccc' : '#1890ff' }}
            >
              收起全部
            </a>
          </Space>
        </div>
      </div>

      {/* 任务列表 */}
      <Collapse
        activeKey={activeKeys}
        onChange={(keys) => setActiveKeys(keys as string[])}
        expandIconPosition="end"
        size="small"
      >
        {localTasks.map((task) => {
          const template = taskTemplates.find(t => t.id === task.taskId);
          const hasMaterials = template && template.materialRequirements.length > 0;

          return (
            <Collapse.Panel
              key={task.taskId}
              header={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, paddingRight: 16 }}>
                  <Checkbox
                    checked={task.completed}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleTaskCompleteChange(task.taskId, e.target.checked);
                    }}
                    disabled={disabled}
                  />
                  <Text strong={task.completed} style={{ flex: 1, textDecoration: task.completed ? 'line-through' : 'none' }}>
                    {task.taskName}
                  </Text>
                  {hasMaterials && (
                    <Tooltip title="需要上传资料">
                      <FileOutlined style={{ color: '#1890ff' }} />
                    </Tooltip>
                  )}
                  {getTaskStatusTag(task)}
                </div>
              }
              style={{
                backgroundColor: task.completed ? '#f6ffed' : undefined,
                marginBottom: 4,
              }}
            >
              <div style={{ padding: '8px 0' }}>
                {/* 完成日期 */}
                {task.completed && (
                  <div style={{ marginBottom: 12 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      完成日期：
                    </Text>
                    <DatePicker
                      value={task.completedDate ? dayjs(task.completedDate) : null}
                      onChange={(date) => handleTaskDateChange(task.taskId, date)}
                      disabled={disabled}
                      size="small"
                      style={{ marginLeft: 8, width: 140 }}
                    />
                  </div>
                )}

                {/* 备注 */}
                <div style={{ marginBottom: hasMaterials ? 12 : 0 }}>
                  <TextArea
                    placeholder="填写任务完成情况说明、存在的问题等"
                    value={task.remark || ''}
                    onChange={(e) => handleTaskRemarkChange(task.taskId, e.target.value)}
                    disabled={disabled}
                    rows={2}
                    maxLength={200}
                    showCount
                    style={{ fontSize: 12 }}
                  />
                </div>

                {/* 资料收集 */}
                {hasMaterials && template && (
                  <TaskMaterialCollection
                    taskName={task.taskName}
                    materialRequirements={template.materialRequirements}
                    materials={task.materials || []}
                    onChange={(materials) => handleMaterialChange(task.taskId, materials)}
                    disabled={disabled}
                  />
                )}
              </div>
            </Collapse.Panel>
          );
        })}
      </Collapse>

      {/* 批量操作 */}
      <div style={{ marginTop: 12, textAlign: 'center' }}>
        <Space>
          <Button
            size="small"
            onClick={handleBatchComplete}
            disabled={disabled}
          >
            全部完成
          </Button>
          <Button
            size="small"
            onClick={handleBatchReset}
            disabled={disabled}
          >
            全部重置
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default DeviceTaskProgressPanel;
