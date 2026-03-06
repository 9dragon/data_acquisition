import React from 'react';
import { Card, Tag, Space, Dropdown, Button } from 'antd';
import {
  ProjectOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SettingOutlined,
  ToolOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  ExperimentOutlined,
  DatabaseOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { StageDefinition } from '../../types/project';

interface StageCardProps {
  stage: StageDefinition;
  onEdit: (stage: StageDefinition) => void;
  onDelete: (stage: StageDefinition) => void;
}

// 图标映射
const IconMap: Record<string, React.ReactNode> = {
  ProjectOutlined: <ProjectOutlined />,
  SyncOutlined: <SyncOutlined />,
  ClockCircleOutlined: <ClockCircleOutlined />,
  CheckCircleOutlined: <CheckCircleOutlined />,
  SettingOutlined: <SettingOutlined />,
  ToolOutlined: <ToolOutlined />,
  RocketOutlined: <RocketOutlined />,
  ThunderboltOutlined: <ThunderboltOutlined />,
  ExperimentOutlined: <ExperimentOutlined />,
  DatabaseOutlined: <DatabaseOutlined />,
};

const StageCard: React.FC<StageCardProps> = ({ stage, onEdit, onDelete }) => {
  const getProgressModeTag = () => {
    return stage.progressMode === 'by_task' ? (
      <Tag color="blue">按任务</Tag>
    ) : (
      <Tag color="green">按设备</Tag>
    );
  };

  const getIcon = () => {
    return IconMap[stage.icon || 'ProjectOutlined'] || <ProjectOutlined />;
  };

  const menuItems = [
    {
      key: 'edit',
      label: '编辑',
      icon: <EditOutlined />,
      onClick: () => onEdit(stage),
    },
    {
      key: 'delete',
      label: '删除',
      icon: <DeleteOutlined />,
      danger: true,
      disabled: stage.isSystem,
      onClick: () => onDelete(stage),
    },
  ];

  return (
    <Card
      hoverable
      style={{
        borderTop: `4px solid ${stage.color}`,
        height: '100%',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 12 }}>
            <Space size={12} style={{ fontSize: 18, fontWeight: 600, color: stage.color }}>
              <span style={{ fontSize: 20 }}>{getIcon()}</span>
              <span>{stage.name}</span>
            </Space>
          </div>

          <div style={{ marginBottom: 12, minHeight: 40, color: '#666', fontSize: 13 }}>
            {stage.description}
          </div>

          <Space wrap>
            {getProgressModeTag()}
            {stage.defaultWeight !== undefined && stage.defaultWeight > 0 && (
              <Tag color="blue">默认权重 {stage.defaultWeight}%</Tag>
            )}
            {stage.isSystem && <Tag color="default">系统内置</Tag>}
          </Space>

          {stage.defaultTasks && stage.defaultTasks.length > 0 && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>默认任务：</div>
              <Space wrap size={[4, 4]}>
                {stage.defaultTasks.slice(0, 3).map((task, index) => (
                  <Tag key={index} color="default" style={{ fontSize: 11 }}>
                    {task}
                  </Tag>
                ))}
                {stage.defaultTasks.length > 3 && (
                  <Tag color="default" style={{ fontSize: 11 }}>
                    +{stage.defaultTasks.length - 3}
                  </Tag>
                )}
              </Space>
            </div>
          )}
        </div>

        <Dropdown menu={{ items: menuItems }} trigger={['click']}>
          <Button
            type="text"
            icon={<MoreOutlined />}
            style={{ flexShrink: 0 }}
          />
        </Dropdown>
      </div>
    </Card>
  );
};

export default StageCard;
