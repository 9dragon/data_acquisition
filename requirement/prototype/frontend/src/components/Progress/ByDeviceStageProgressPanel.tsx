import React, { useState, useEffect } from 'react';
import { Checkbox, Input, DatePicker, Space, Typography, Tag, Progress, Card, Tooltip } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, StopOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { StageDeviceProgress } from '../../types/project';
import { calculateByDeviceStageProgress } from '../../utils/progressCalculators';

const { TextArea } = Input;
const { Text } = Typography;

interface ByDeviceStageProgressPanelProps {
  deviceProgress: StageDeviceProgress[];
  totalDeviceCount: number;
  onChange: (deviceProgress: StageDeviceProgress[]) => void;
  disabled?: boolean;
}

const ByDeviceStageProgressPanel: React.FC<ByDeviceStageProgressPanelProps> = ({
  deviceProgress,
  totalDeviceCount,
  onChange,
  disabled = false,
}) => {
  const [localDevices, setLocalDevices] = useState<StageDeviceProgress[]>(deviceProgress);

  useEffect(() => {
    setLocalDevices(deviceProgress);
  }, [deviceProgress]);

  // 计算阶段进度（基于项目总设备数）
  const stageProgress = calculateByDeviceStageProgress(localDevices, totalDeviceCount);
  const completedCount = localDevices.filter(device => device.completed).length;

  // 处理设备完成状态变化
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

  // 处理设备备注变化
  const handleDeviceRemarkChange = (deviceId: string, remark: string) => {
    const updatedDevices = localDevices.map(device =>
      device.deviceId === deviceId ? { ...device, remark } : device
    );
    setLocalDevices(updatedDevices);
    onChange(updatedDevices);
  };

  // 处理完成日期变化
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

  // 批量操作
  const handleBatchComplete = () => {
    const updatedDevices = localDevices.map(device => ({
      ...device,
      completed: true,
      completedDate: new Date().toISOString().split('T')[0],
    }));
    setLocalDevices(updatedDevices);
    onChange(updatedDevices);
  };

  const handleBatchReset = () => {
    const updatedDevices = localDevices.map(device => ({
      ...device,
      completed: false,
      completedDate: undefined,
    }));
    setLocalDevices(updatedDevices);
    onChange(updatedDevices);
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
          <Text strong>阶段进度</Text>
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
          </Space>
        </div>
      </div>

      {/* 设备列表 */}
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
        </div>
      </div>
    </div>
  );
};

export default ByDeviceStageProgressPanel;
