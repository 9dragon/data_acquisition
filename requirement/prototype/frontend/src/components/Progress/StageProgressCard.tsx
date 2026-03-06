import React, { useState } from 'react';
import { Card, Collapse, Typography, Tag, Space, Divider, Input } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { ProjectStageConfig, StageDefinition } from '../../types/project';
import { getStageStatusText, getStageStatusColor, formatReportDate } from '../../utils/progressCalculators';
import ByTaskStageProgressPanel from './ByTaskStageProgressPanel';
import ByDeviceStageProgressPanel from './ByDeviceStageProgressPanel';

const { TextArea } = Input;
const { Text } = Typography;

interface StageProgressCardProps {
  stageConfig: ProjectStageConfig;
  stageDefinition: StageDefinition;
  projectDeviceCount: number;
  onChange: (updatedConfig: ProjectStageConfig) => void;
  disabled?: boolean;
}

const StageProgressCard: React.FC<StageProgressCardProps> = ({
  stageConfig,
  stageDefinition,
  projectDeviceCount,
  onChange,
  disabled = false,
}) => {
  const [collapsed, setCollapsed] = useState(stageConfig.status === 'completed');

  // 默认已完成阶段折叠，其他阶段展开
  const isDefaultCollapsed = stageConfig.status === 'completed';

  const statusText = getStageStatusText(stageConfig.status || 'not_started');
  const statusColor = getStageStatusColor(stageConfig.status || 'not_started');

  // 处理阶段进度更新
  const handleStageProgressChange = (updates: Partial<ProjectStageConfig>) => {
    onChange({
      ...stageConfig,
      ...updates,
    });
  };

  // 处理阶段备注更新
  const handleRemarkChange = (remark: string) => {
    handleStageProgressChange({ remark });
  };

  // 处理任务/设备进度更新
  const handleProgressDataChange = (key: keyof ProjectStageConfig, value: any) => {
    handleStageProgressChange({ [key]: value });
  };

  return (
    <Card
      size="small"
      style={{ marginBottom: 12 }}
      styles={{
        body: { padding: 0 },
      }}
    >
      {/* 卡片头部 */}
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          padding: '12px 16px',
          cursor: 'pointer',
          background: '#fafafa',
          borderBottom: collapsed ? 'none' : '1px solid #f0f0f0',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space size="middle">
            {/* 阶段名称和进度 */}
            <div>
              <Text strong>{stageDefinition.name}</Text>
              <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                ({stageDefinition.progressMode === 'by_task' ? '按任务' : '按设备'}推进)
              </Text>
            </div>

            {/* 阶段权重 */}
            <Tag color="blue">权重 {stageConfig.weight}%</Tag>

            {/* 进度 */}
            {stageConfig.actualProgress !== undefined && (
              <Tag color={stageConfig.actualProgress === 100 ? 'success' : stageConfig.actualProgress > 0 ? 'processing' : 'default'}>
                进度 {stageConfig.actualProgress}%
              </Tag>
            )}

            {/* 状态 */}
            <Tag color={statusColor}>{statusText}</Tag>
          </Space>

          {/* 展开/折叠图标 */}
          {collapsed ? <DownOutlined /> : <UpOutlined />}
        </div>
      </div>

      {/* 卡片内容 */}
      {!collapsed && (
        <div style={{ padding: '16px' }}>
          {/* 阶段描述 */}
          {stageDefinition.description && (
            <div style={{ marginBottom: 12, padding: 8, background: '#f0f2f5', borderRadius: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {stageDefinition.description}
              </Text>
            </div>
          )}

          <Divider style={{ margin: '12px 0' }} />

          {/* 进度填报面板 */}
          {stageDefinition.progressMode === 'by_task' ? (
            <ByTaskStageProgressPanel
              taskProgress={stageConfig.taskProgress || []}
              onChange={(taskProgress) => handleProgressDataChange('taskProgress', taskProgress)}
              disabled={disabled}
            />
          ) : (
            <ByDeviceStageProgressPanel
              deviceProgress={stageConfig.deviceProgress || []}
              totalDeviceCount={projectDeviceCount}
              onChange={(deviceProgress) => handleProgressDataChange('deviceProgress', deviceProgress)}
              disabled={disabled}
            />
          )}

          <Divider style={{ margin: '12px 0' }} />

          {/* 阶段备注 */}
          <div>
            <div style={{ marginBottom: 8 }}>
              <Text strong>阶段说明</Text>
              <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                （选填）
              </Text>
            </div>
            <TextArea
              placeholder={`请描述${stageDefinition.name}的完成情况、存在问题、需要协调的资源等`}
              value={stageConfig.remark || ''}
              onChange={(e) => handleRemarkChange(e.target.value)}
              disabled={disabled}
              rows={2}
              maxLength={200}
              showCount
            />
          </div>

          {/* 最后填报时间 */}
          {stageConfig.lastReportDate && (
            <div style={{ marginTop: 8, textAlign: 'right' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                最后填报：{formatReportDate(stageConfig.lastReportDate)}
              </Text>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default StageProgressCard;
