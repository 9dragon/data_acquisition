import React from 'react';
import { Tag } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, SyncOutlined, CloseCircleOutlined } from '@ant-design/icons';

interface StatusTagProps {
  status: string;
  text?: string;
}

const StatusTag: React.FC<StatusTagProps> = ({ status, text }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return { color: 'success', icon: <CheckCircleOutlined />, text: text || '已完成' };
      case 'in_progress':
        return { color: 'processing', icon: <SyncOutlined spin />, text: text || '进行中' };
      case 'pending':
      case 'not_started':
        return { color: 'default', icon: <ClockCircleOutlined />, text: text || '未开始' };
      case 'on_hold':
        return { color: 'warning', icon: <ClockCircleOutlined />, text: text || '暂停' };
      case 'cancelled':
        return { color: 'error', icon: <CloseCircleOutlined />, text: text || '已取消' };
      case 'abnormal':
        return { color: 'error', icon: <CloseCircleOutlined />, text: text || '异常' };
      case 'open':
        return { color: 'default', icon: <ClockCircleOutlined />, text: text || '待处理' };
      case 'assigned':
        return { color: 'processing', icon: <SyncOutlined />, text: text || '已分配' };
      case 'resolved':
        return { color: 'success', icon: <CheckCircleOutlined />, text: text || '已解决' };
      case 'closed':
        return { color: 'default', icon: <CheckCircleOutlined />, text: text || '已关闭' };
      case 'draft':
        return { color: 'default', icon: <ClockCircleOutlined />, text: text || '草稿' };
      case 'review':
        return { color: 'processing', icon: <SyncOutlined />, text: text || '审阅中' };
      case 'approved':
        return { color: 'success', icon: <CheckCircleOutlined />, text: text || '已通过' };
      case 'rejected':
        return { color: 'error', icon: <CloseCircleOutlined />, text: text || '已拒绝' };
      default:
        return { color: 'default', icon: null, text: text || status };
    }
  };

  const config = getStatusConfig();

  return (
    <Tag color={config.color} icon={config.icon}>
      {config.text}
    </Tag>
  );
};

export default StatusTag;
