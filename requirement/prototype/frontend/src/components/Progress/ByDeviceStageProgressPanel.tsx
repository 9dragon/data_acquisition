import React, { useState, useEffect } from 'react';
import { Checkbox, Input, DatePicker, Space, Typography, Tag, Progress, Card, Tooltip, Collapse, Alert } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { StageDeviceProgress, StageTaskTemplate } from '../../types/project';
import { calculateByDeviceStageProgress, calculateByDeviceStageProgressWithTasks } from '../../utils/progressCalculators';
import DeviceTaskProgressPanel from './DeviceTaskProgressPanel';

const { TextArea } = Input;
const { Text } = Typography;

interface ByDeviceStageProgressPanelProps {
  deviceProgress: StageDeviceProgress[];
  totalDeviceCount: number;
  taskTemplates?: StageTaskTemplate[];  // 新增：任务模板
  onChange: (deviceProgress: StageDeviceProgress[]) => void;
  disabled?: boolean;
}

/**
 * 按设备推进的阶段进度面板
 * 支持两种模式：
 * 1. 旧模式：直接标记设备完成状态
 * 2. 新模式：每个设备的每个任务单独填报（需要任务模板）
 */
const ByDeviceStageProgressPanel: React.FC<ByDeviceStageProgressPanelProps> = ({
  deviceProgress,
  totalDeviceCount,
  taskTemplates = [],
  onChange,
  disabled = false,
}) => {
  const [localDevices, setLocalDevices] = useState<StageDeviceProgress[]>(deviceProgress);
  const [activeDeviceKeys, setActiveDeviceKeys] = useState<string[]>([]);

  useEffect(() => {
    setLocalDevices(deviceProgress);
  }, [deviceProgress]);

  // 检测是否需要任务级填报
  const needsTaskLevel = taskTemplates && taskTemplates.length > 0 &&
    localDevices.some(device => device.taskProgress && device.taskProgress.length > 0);

  // 计算阶段进度
  const stageProgress = needsTaskLevel
    ? calculateByDeviceStageProgressWithTasks(localDevices, taskTemplates, totalDeviceCount)
    : calculateByDeviceStageProgress(localDevices, totalDeviceCount);

  // 计算完成数量
  const completedCount = localDevices.filter(device => {
    if (needsTaskLevel && device.taskProgress) {
      // 任务级模式：检查所有任务是否完成
      return device.taskProgress.every(task => task.completed);
    }
    return device.completed;
  }).length;

  // 处理设备完成状态变化（旧模式）
  const handleDeviceCompleteChange = (deviceId: string, completed: boolean) => {
    const updatedDevices = localDevices.map(device => {
      if (device.deviceId === deviceId) {
        return {
          ...device,
          completed,
          completedDate: completed ? new Date().toISOString().split('T')[0] : undefined,
        };
      }
      return device;
    });
    setLocalDevices(updatedDevices);
    onChange(updatedDevices);
  };

  // 处理设备备注变化（旧模式）
  const handleDeviceRemarkChange = (deviceId: string, remark: string) => {
    const updatedDevices = localDevices.map(device =>
      device.deviceId === deviceId ? { ...device, remark } : device
    );
    setLocalDevices(updatedDevices);
    onChange(updatedDevices);
  };

  // 处理完成日期变化（旧模式）
  const handleDeviceDateChange = (deviceId: string, date: dayjs.Dayjs | null) => {
    const updatedDevices = localDevices.map(device => {
      if (device.deviceId === deviceId) {
        return {
          ...device,
          completedDate: date ? date.format('YYYY-MM-DD') : undefined,
        };
      }
      return device;
    });
    setLocalDevices(updatedDevices);
    onChange(updatedDevices);
  };

  // 处理设备任务进度变化（新模式）
  const handleDeviceTaskProgressChange = (deviceId: string, taskProgress: any[]) => {
    const updatedDevices = localDevices.map(device => {
      if (device.deviceId === deviceId) {
        // 根据任务完成情况更新设备完成状态
        const allTasksCompleted = taskProgress.every(task => task.completed);

        return {
          ...device,
          taskProgress,
          completed: allTasksCompleted,
          completedDate: allTasksCompleted ? new Date().toISOString().split('T')[0] : device.completedDate,
        };
      }
      return device;
    });
    setLocalDevices(updatedDevices);
    onChange(updatedDevices);
  };

  // 批量操作
  const handleBatchComplete = () => {
    const updatedDevices = localDevices.map(device => {
      if (needsTaskLevel && taskTemplates.length > 0) {
        // 任务级模式：完成所有任务
        const updatedTaskProgress = (device.taskProgress || []).map(task => ({
          ...task,
          completed: true,
          completedDate: new Date().toISOString().split('T')[0],
        }));
        return {
          ...device,
          taskProgress: updatedTaskProgress,
          completed: true,
          completedDate: new Date().toISOString().split('T')[0],
        };
      }
      // 旧模式
      return {
        ...device,
        completed: true,
        completedDate: new Date().toISOString().split('T')[0],
      };
    });
    setLocalDevices(updatedDevices);
    onChange(updatedDevices);
  };

  const handleBatchReset = () => {
    const updatedDevices = localDevices.map(device => {
      if (needsTaskLevel) {
        // 任务级模式：重置所有任务
        const updatedTaskProgress = (device.taskProgress || []).map(task => ({
          ...task,
          completed: false,
          completedDate: undefined,
        }));
        return {
          ...device,
          taskProgress: updatedTaskProgress,
          completed: false,
          completedDate: undefined,
        };
      }
      // 旧模式
      return {
        ...device,
        completed: false,
        completedDate: undefined,
      };
    });
    setLocalDevices(updatedDevices);
    onChange(updatedDevices);
  };

  // 展开所有设备
  const handleExpandAll = () => {
    setActiveDeviceKeys(localDevices.map(d => d.deviceId));
  };

  // 收起所有设备
  const handleCollapseAll = () => {
    setActiveDeviceKeys([]);
  };

  // 获取设备完成状态
  const getDeviceCompleted = (device: StageDeviceProgress): boolean => {
    if (needsTaskLevel && device.taskProgress) {
      return device.taskProgress.every(task => task.completed);
    }
    return device.completed;
  };

  if (localDevices.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>
        暂无设备，请先为项目添加设备
      </div>
    );
  }

  return (
    <div>
      {/* 进度概览 */}
      <div style={{ marginBottom: 16, padding: 12, background: '#f0f2f5', borderRadius: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Space>
            <Text strong>阶段进度</Text>
            {needsTaskLevel && (
              <Tag color="blue" style={{ fontSize: 11 }}>任务级填报</Tag>
            )}
          </Space>
          <Tag color={stageProgress === 100 ? 'success' : stageProgress > 0 ? 'processing' : 'default'}>
            {stageProgress}%
          </Tag>
        </div>
        <Progress percent={stageProgress} size="small" />
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666' }}>
          <span>已完成 {completedCount} / {totalDeviceCount} 台设备</span>
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
            {needsTaskLevel && (
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

      {/* 任务级填报提示 */}
      {needsTaskLevel && (
        <Alert
          message="任务级填报模式"
          description="当前阶段采用任务级填报，请展开设备详情填写每个任务的完成情况和相关资料"
          type="info"
          showIcon
          closable
          style={{ marginBottom: 12 }}
        />
      )}

      {/* 设备列表 */}
      {needsTaskLevel ? (
        // 新模式：任务级填报，使用折叠面板
        <Collapse
          activeKey={activeDeviceKeys}
          onChange={(keys) => setActiveDeviceKeys(keys as string[])}
          expandIconPosition="end"
        >
          {localDevices.map((device) => {
            const isDeviceCompleted = getDeviceCompleted(device);
            const completedTasks = device.taskProgress?.filter(t => t.completed).length || 0;
            const totalTasks = taskTemplates.length;

            return (
              <Collapse.Panel
                key={device.deviceId}
                header={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, paddingRight: 16 }}>
                    <Checkbox
                      checked={isDeviceCompleted}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleDeviceCompleteChange(device.deviceId, e.target.checked);
                      }}
                      disabled={disabled}
                    />
                    <Text strong style={{ flex: 1 }}>
                      {device.deviceName}
                    </Text>
                    <Tag color={isDeviceCompleted ? 'success' : 'default'}>
                      {completedTasks}/{totalTasks} 任务
                    </Tag>
                    {isDeviceCompleted ? (
                      <Tag icon={<CheckCircleOutlined />} color="success">已完成</Tag>
                    ) : (
                      <Tag icon={<ClockCircleOutlined />} color="default">未完成</Tag>
                    )}
                  </div>
                }
                style={{
                  backgroundColor: isDeviceCompleted ? '#f6ffed' : undefined,
                  marginBottom: 4,
                }}
              >
                <DeviceTaskProgressPanel
                  device={{ deviceId: device.deviceId, deviceName: device.deviceName }}
                  taskTemplates={taskTemplates}
                  taskProgress={device.taskProgress || []}
                  onChange={(taskProgress) => handleDeviceTaskProgressChange(device.deviceId, taskProgress)}
                  disabled={disabled}
                />
              </Collapse.Panel>
            );
          })}
        </Collapse>
      ) : (
        // 旧模式：卡片网格布局
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {localDevices.map((device) => (
            <Card
              key={device.deviceId}
              size="small"
              style={{
                borderColor: device.completed ? '#52c41a' : '#f0f0f0',
                background: device.completed ? '#f6ffed' : '#fff',
              }}
              styles={{ body: { padding: 12 } }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                {/* 完成复选框 */}
                <Checkbox
                  checked={device.completed}
                  onChange={(e) => handleDeviceCompleteChange(device.deviceId, e.target.checked)}
                  disabled={disabled}
                  style={{ marginTop: 2 }}
                />

                {/* 设备信息 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Tooltip title={device.deviceName}>
                      <Text strong ellipsis style={{ maxWidth: 180 }}>
                        {device.deviceName}
                      </Text>
                    </Tooltip>
                    {device.completed ? (
                      <Tag icon={<CheckCircleOutlined />} color="success" style={{ margin: 0 }}>
                        已完成
                      </Tag>
                    ) : (
                      <Tag icon={<ClockCircleOutlined />} color="default" style={{ margin: 0 }}>
                        未完成
                      </Tag>
                    )}
                  </div>

                  {/* 完成日期 */}
                  {device.completed && (
                    <div style={{ marginBottom: 8 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        完成日期：
                      </Text>
                      <DatePicker
                        value={device.completedDate ? dayjs(device.completedDate) : null}
                        onChange={(date) => handleDeviceDateChange(device.deviceId, date)}
                        disabled={disabled}
                        size="small"
                        style={{ marginLeft: 8, width: 120 }}
                      />
                    </div>
                  )}

                  <TextArea
                    placeholder="填写设备完成情况说明、存在的问题等"
                    value={device.remark || ''}
                    onChange={(e) => handleDeviceRemarkChange(device.deviceId, e.target.value)}
                    disabled={disabled}
                    rows={1}
                    maxLength={100}
                    showCount
                    style={{ fontSize: 12 }}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 统计信息 */}
      <div style={{ marginTop: 16, padding: 12, background: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#52c41a' }}>{completedCount}</div>
            <div style={{ fontSize: 12, color: '#666' }}>已完成</div>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#faad14' }}>
              {localDevices.length - completedCount}
            </div>
            <div style={{ fontSize: 12, color: '#666' }}>未完成</div>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>{totalDeviceCount}</div>
            <div style={{ fontSize: 12, color: '#666' }}>总设备数</div>
          </div>
          {needsTaskLevel && (
            <div>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: '#722ed1' }}>{taskTemplates.length}</div>
              <div style={{ fontSize: 12, color: '#666' }}>任务数/设备</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ByDeviceStageProgressPanel;
