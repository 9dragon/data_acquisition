import React from 'react';
import { Card, Progress, Tag, Space, Button, Popconfirm, Empty } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ProjectTask } from '../../types/project';
import StatusTag from '../Common/StatusTag';
import { getUserById } from '../../services/mockData';

interface TaskListProps {
  tasks: ProjectTask[];
  onEdit: (task: ProjectTask) => void;
  onDelete: (taskId: string) => void;
  stageTitle?: string;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onEdit,
  onDelete,
  stageTitle,
}) => {
  if (tasks.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Tag color="default">暂无任务</Tag>
      </div>
    );
  }

  return (
    <div>
      {tasks.map(task => {
        // 获取负责人名称
        const assigneeNames = task.assignees
          .map(id => getUserById(id)?.name)
          .filter(Boolean)
          .join('、');

        return (
          <div
            key={task.id}
            style={{
              padding: '12px',
              background: '#fafafa',
              border: '1px solid #f0f0f0',
              borderRadius: 6,
              marginBottom: 8,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f0f0f0';
              e.currentTarget.style.borderColor = '#d9d9d9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fafafa';
              e.currentTarget.style.borderColor = '#f0f0f0';
            }}
          >
            {/* 任务头部 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <Space style={{ flex: 1 }}>
                <StatusTag status={task.status} />
                <span style={{ fontWeight: 500, fontSize: 14 }}>{task.name}</span>
              </Space>
              <Space size="small">
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(task);
                  }}
                />
                <Popconfirm
                  title="确认删除"
                  description="确定要删除这个任务吗？"
                  onConfirm={(e) => {
                    e?.stopPropagation();
                    onDelete(task.id);
                  }}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Popconfirm>
              </Space>
            </div>

            {/* 任务描述 */}
            {task.description && (
              <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                {task.description}
              </div>
            )}

            {/* 进度和时间 */}
            <div style={{ marginBottom: 8 }}>
              <Progress
                percent={task.progress}
                size="small"
                status={task.progress === 100 ? 'success' : undefined}
              />
            </div>

            {/* 底部信息 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#999' }}>
              <Space>
                <span>📅 {task.startDate} ~ {task.endDate}</span>
                {assigneeNames && <span>👤 {assigneeNames}</span>}
              </Space>
              {task.dependencies && task.dependencies.length > 0 && (
                <Tag size="small" color="orange">
                  依赖 {task.dependencies.length} 个任务
                </Tag>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskList;
