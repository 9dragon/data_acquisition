import React, { useState, useEffect } from 'react';
import { Checkbox, Input, DatePicker, Space, Typography, Tag, Progress, Collapse, Alert } from 'antd';
import dayjs from 'dayjs';
import { StageTaskProgress, StageTaskTemplate } from '../../types/project';
import { calculateByTaskStageProgress, validateTaskMaterials } from '../../utils/progressCalculators';
import TaskMaterialCollection from './TaskMaterialCollection';

const { TextArea } = Input;
const { Text } = Typography;

interface ByTaskStageProgressPanelProps {
  taskProgress: StageTaskProgress[];
  taskTemplates?: StageTaskTemplate[];  // 新增：任务模板
  onChange: (taskProgress: StageTaskProgress[]) => void;
  disabled?: boolean;
}

/**
 * 按任务推进的阶段进度面板
 * 支持两种模式：
 * 1. 旧模式：简单的任务列表
 * 2. 新模式：带资料收集的任务列表
 */
const ByTaskStageProgressPanel: React.FC<ByTaskStageProgressPanelProps> = ({
  taskProgress,
  taskTemplates = [],
  onChange,
  disabled = false,
}) => {
  const [localTasks, setLocalTasks] = useState<StageTaskProgress[]>(taskProgress);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  useEffect(() => {
    setLocalTasks(taskProgress);
  }, [taskProgress]);

  // 检测是否需要资料收集
  const needsMaterials = taskTemplates && taskTemplates.length > 0 &&
    taskTemplates.some(t => t.materialRequirements && t.materialRequirements.length > 0);

  // 计算阶段进度
  const stageProgress = calculateByTaskStageProgress(localTasks);
  const completedCount = localTasks.filter(task => task.completed).length;
  const totalCount = localTasks.length;

  // 处理任务完成状态变化
  const handleTaskCompleteChange = (taskId: string, completed: boolean) => {
    const updatedTasks = localTasks.map(task => {
      if (task.taskId === taskId) {
        // 检查资料是否完整
        const template = taskTemplates.find(t => t.id === taskId);
        let canComplete = completed;

        if (completed && template && template.materialRequirements.length > 0) {
          const validation = validateTaskMaterials(task, template);
          canComplete = validation.valid;
        }

        return {
          ...task,
          completed: canComplete,
          completedDate: canComplete ? new Date().toISOString().split('T')[0] : undefined,
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
          } else if (!validation.valid && task.completed) {
            // 如果资料不完整，取消完成状态
            newCompletedState = false;
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

  // 批量操作
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

  // 获取任务对应的模板
  const getTaskTemplate = (task: StageTaskProgress): StageTaskTemplate | undefined => {
    return taskTemplates.find(t => t.id === task.taskId || t.key === task.taskKey);
  };

  // 获取任务状态
  const getTaskStatus = (task: StageTaskProgress) => {
    if (!task.completed) {
      return <Tag style={{ margin: 0 }}>未完成</Tag>;
    }

    const template = getTaskTemplate(task);
    if (template && template.materialRequirements.length > 0) {
      const validation = validateTaskMaterials(task, template);
      if (!validation.valid) {
        return <Tag color="warning" style={{ margin: 0 }}>资料未完成</Tag>;
      }
    }

    return <Tag color="success" style={{ margin: 0 }}>已完成</Tag>;
  };

  if (localTasks.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>
        暂无任务，请在阶段定义中配置默认任务
      </div>
    );
  }

  return (
    <div>
      {/* 进度概览 */}
      <div style={{ marginBottom: 16, padding: 12, background: '#f0f2f5', borderRadius: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text strong>阶段进度</Text>
          <Tag color={stageProgress === 100 ? 'success' : stageProgress > 0 ? 'processing' : 'default'}>
            {stageProgress}%
          </Tag>
        </div>
        <Progress percent={stageProgress} size="small" />
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666' }}>
          <span>已完成 {completedCount} / {totalCount} 个任务</span>
          <Space size="small">
            <a
              onClick={disabled ? undefined : handleBatchComplete}
              style={{ fontSize: 12, color: disabled ? '#ccc' : undefined, cursor: disabled ? 'not-allowed' : 'pointer' }}
            >
              全部完成
            </a>
            <a
              onClick={disabled ? undefined : handleBatchReset}
              style={{ fontSize: 12, color: disabled ? '#ccc' : undefined, cursor: disabled ? 'not-allowed' : 'pointer' }}
            >
              全部重置
            </a>
            {needsMaterials && (
              <>
                <span style={{ color: '#d9d9d9' }}>|</span>
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
              </>
            )}
          </Space>
        </div>
      </div>

      {/* 资料收集提示 */}
      {needsMaterials && (
        <Alert
          message="资料收集模式"
          description="当前任务需要上传相关佐证资料，请展开任务详情完成资料上传"
          type="info"
          showIcon
          closable
          style={{ marginBottom: 12 }}
        />
      )}

      {/* 任务列表 */}
      {needsMaterials ? (
        // 新模式：带资料收集的折叠面板
        <Collapse
          activeKey={activeKeys}
          onChange={(keys) => setActiveKeys(keys as string[])}
          expandIconPosition="end"
        >
          {localTasks.map((task, index) => {
            const template = getTaskTemplate(task);
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
                <Text strong style={{ flex: 1, textDecoration: task.completed ? 'line-through' : 'none' }}>
                  {task.taskName}
                </Text>
                {hasMaterials && (
                  <Tag color="blue" style={{ fontSize: 11 }}>需资料</Tag>
                )}
                {getTaskStatus(task)}
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
      ) : (
        // 旧模式：简单列表
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {localTasks.map((task, index) => (
            <div
              key={task.taskId}
              style={{
                padding: 12,
                border: '1px solid #f0f0f0',
                borderRadius: 4,
                background: task.completed ? '#f6ffed' : '#fff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                {/* 完成复选框 */}
                <Checkbox
                  checked={task.completed}
                  onChange={(e) => handleTaskCompleteChange(task.taskId, e.target.checked)}
                  disabled={disabled}
                  style={{ marginTop: 2 }}
                />

                {/* 任务信息 */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text strong={task.completed} style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                      {task.taskName}
                    </Text>
                    {task.completed ? (
                      <Tag color="success" style={{ margin: 0 }}>已完成</Tag>
                    ) : (
                      <Tag style={{ margin: 0 }}>未完成</Tag>
                    )}
                  </div>

                  {/* 完成日期和备注 */}
                  {task.completed && (
                    <div style={{ marginBottom: 8 }}>
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

                  <TextArea
                    placeholder="填写任务完成情况说明、存在的问题等"
                    value={task.remark || ''}
                    onChange={(e) => handleTaskRemarkChange(task.taskId, e.target.value)}
                    disabled={disabled}
                    rows={1}
                    maxLength={100}
                    showCount
                    style={{ fontSize: 12 }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ByTaskStageProgressPanel;
