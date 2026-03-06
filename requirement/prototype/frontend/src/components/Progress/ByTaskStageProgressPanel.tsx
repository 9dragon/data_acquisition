import React, { useState, useEffect } from 'react';
import { Checkbox, Input, DatePicker, Space, Typography, Tag, Progress } from 'antd';
import dayjs from 'dayjs';
import { StageTaskProgress } from '../../types/project';
import { calculateByTaskStageProgress } from '../../utils/progressCalculators';

const { TextArea } = Input;
const { Text } = Typography;

interface ByTaskStageProgressPanelProps {
  taskProgress: StageTaskProgress[];
  onChange: (taskProgress: StageTaskProgress[]) => void;
  disabled?: boolean;
}

const ByTaskStageProgressPanel: React.FC<ByTaskStageProgressPanelProps> = ({
  taskProgress,
  onChange,
  disabled = false,
}) => {
  const [localTasks, setLocalTasks] = useState<StageTaskProgress[]>(taskProgress);

  useEffect(() => {
    setLocalTasks(taskProgress);
  }, [taskProgress]);

  // 计算阶段进度
  const stageProgress = calculateByTaskStageProgress(localTasks);
  const completedCount = localTasks.filter(task => task.completed).length;
  const totalCount = localTasks.length;

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
        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
          已完成 {completedCount} / {totalCount} 个任务
        </div>
      </div>

      {/* 任务列表 */}
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
    </div>
  );
};

export default ByTaskStageProgressPanel;
