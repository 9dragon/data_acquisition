import React from 'react';
import { Card, Progress, Tag, Space, Typography, Button, Tooltip, Divider, Collapse } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ProjectOutlined,
  AppstoreOutlined,
  FileOutlined,
} from '@ant-design/icons';
import { TaskCardData } from '../../types/task';
import { getTaskStatusTag, formatTaskDate } from '../../utils/taskDataTransformer';

const { Text, Title } = Typography;
const { Panel } = Collapse;

interface TaskCardProps {
  data: TaskCardData;
  onClick: () => void;
}

/**
 * 任务卡片组件
 * 显示一种任务类型的整体进度，支持展开查看各项目详情
 */
const TaskCard: React.FC<TaskCardProps> = ({ data, onClick }) => {
  const statusTag = getTaskStatusTag(data.progress);
  const hasMaterials = data.materialRequirements && data.materialRequirements.length > 0;

  return (
    <Card
      hoverable
      style={{
        height: '100%',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'all 0.3s',
      }}
      bodyStyle={{ padding: 16 }}
      onClick={onClick}
    >
      {/* 任务标题和状态 */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Space direction="vertical" size={4} style={{ flex: 1 }}>
            <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
              {data.taskName}
            </Title>
            {hasMaterials && (
              <Tooltip title="需要收集资料">
                <Tag icon={<FileOutlined />} color="blue" style={{ fontSize: 11 }}>
                  需收集资料
                </Tag>
              </Tooltip>
            )}
          </Space>
          <Tag color={statusTag.color} icon={statusTag.color === 'success' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}>
            {statusTag.text}
          </Tag>
        </div>
      </div>

      {/* 进度条 */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            整体进度
          </Text>
          <Text strong style={{ fontSize: 14, color: data.progress === 100 ? '#52c41a' : '#1890ff' }}>
            {data.progress}%
          </Text>
        </div>
        <Progress
          percent={data.progress}
          size="small"
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
          status={data.progress === 100 ? 'success' : undefined}
        />
      </div>

      {/* 统计信息 */}
      <div style={{ marginBottom: 12 }}>
        <Space split={<Divider type="vertical" style={{ margin: '0 8px' }} />} size="small">
          <Text type="secondary" style={{ fontSize: 12 }}>
            <AppstoreOutlined style={{ marginRight: 4 }} />
            {data.totalDeviceCount} 台设备
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <CheckCircleOutlined style={{ marginRight: 4, color: '#52c41a' }} />
            {data.completedDeviceCount} 已完成
          </Text>
        </Space>
      </div>

      {/* 项目分组摘要 */}
      {data.projectGroups.length > 0 && (
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            涉及 {data.projectGroups.length} 个项目
          </Text>
          <div style={{ marginTop: 8, maxHeight: 80, overflow: 'auto' }}>
            {data.projectGroups.map(pg => (
              <Tooltip key={pg.projectId} title={`${pg.projectName} - ${pg.devices.length}台设备`}>
                <Tag
                  color="default"
                  style={{
                    margin: '2px 4px 2px 0',
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  <ProjectOutlined style={{ marginRight: 4 }} />
                  {pg.projectCode}
                  <Text type="secondary" style={{ marginLeft: 4 }}>
                    ({pg.devices.length})
                  </Text>
                </Tag>
              </Tooltip>
            ))}
          </div>
        </div>
      )}

      {/* 点击提示 */}
      <div style={{ marginTop: 12, textAlign: 'center' }}>
        <Button type="link" size="small" style={{ padding: 0 }}>
          查看详情
        </Button>
      </div>
    </Card>
  );
};

export default TaskCard;
