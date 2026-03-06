import React, { useState } from 'react';
import { Card, Space, Button, Tag, Modal, Form, Input, Select, message, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '../../components/Common/PageHeader';
import DataTable from '../../components/Common/DataTable';
import { useNotificationStore } from '../../stores/notificationStore';
import type { ColumnsType } from 'antd/es/table';
import type { Notification } from '../../types/common';

const NotificationManage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [form] = Form.useForm();

  const { notifications, addNotification, updateNotification, deleteNotification } = useNotificationStore();

  // 根据类型筛选通知
  const filteredNotifications = typeFilter === 'all'
    ? notifications
    : notifications.filter(n => n.type === typeFilter);

  const columns: ColumnsType<Notification> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const typeMap: Record<string, { text: string; color: string }> = {
          info: { text: '通知', color: 'blue' },
          warning: { text: '重要', color: 'orange' },
          error: { text: '错误', color: 'red' },
          success: { text: '成功', color: 'green' },
        };
        const t = typeMap[type] || { text: type, color: 'default' };
        return <Tag color={t.color}>{t.text}</Tag>;
      },
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: '已读',
      dataIndex: 'read',
      key: 'read',
      width: 80,
      render: (read: boolean, record) => (
        <Button
          type="text"
          size="small"
          onClick={() => {
            updateNotification(record.id, { read: !read });
            message.success(read ? '已标记为未读' : '已标记为已读');
          }}
        >
          {read ? '是' : '否'}
        </Button>
      ),
    },
    {
      title: '发布时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
    },
  ];

  const actions = [
    {
      label: '编辑',
      onClick: (record: Notification) => {
        setEditingNotification(record);
        form.setFieldsValue({
          title: record.title,
          type: record.type,
          content: record.content,
          read: record.read,
        });
        setModalVisible(true);
      },
    },
    {
      label: '删除',
      onClick: (record: Notification) => {
        Modal.confirm({
          title: '确认删除',
          content: `确定要删除通知"${record.title}"吗？`,
          onOk: () => {
            deleteNotification(record.id);
            message.success('删除成功');
          },
        });
      },
      danger: true,
    },
  ];

  const handleAdd = () => {
    setEditingNotification(null);
    form.resetFields();
    form.setFieldsValue({ type: 'info', read: false });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingNotification) {
        updateNotification(editingNotification.id, values);
        message.success('更新成功');
      } else {
        addNotification(values);
        message.success('创建成功');
      }

      setModalVisible(false);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'blue';
      case 'warning': return 'orange';
      case 'error': return 'red';
      case 'success': return 'green';
      default: return 'default';
    }
  };

  return (
    <Card>
      <PageHeader
        title="通知公告管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建通知
          </Button>
        }
      />

      <Space style={{ marginBottom: 16 }}>
        <Button
          type={typeFilter === 'all' ? 'primary' : 'default'}
          onClick={() => setTypeFilter('all')}
        >
          全部 ({notifications.length})
        </Button>
        <Button
          type={typeFilter === 'info' ? 'primary' : 'default'}
          onClick={() => setTypeFilter('info')}
          icon={<Tag color="blue" />}
        >
          通知
        </Button>
        <Button
          type={typeFilter === 'warning' ? 'primary' : 'default'}
          onClick={() => setTypeFilter('warning')}
          icon={<Tag color="orange" />}
        >
          重要
        </Button>
        <Button
          type={typeFilter === 'error' ? 'primary' : 'default'}
          onClick={() => setTypeFilter('error')}
          icon={<Tag color="red" />}
        >
          错误
        </Button>
        <Button
          type={typeFilter === 'success' ? 'primary' : 'default'}
          onClick={() => setTypeFilter('success')}
          icon={<Tag color="green" />}
        >
          成功
        </Button>
      </Space>

      <DataTable
        columns={columns}
        dataSource={filteredNotifications}
        actions={actions}
        loading={loading}
        rowKey="id"
      />

      <Modal
        title={editingNotification ? '编辑通知' : '新建通知'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入标题" />
          </Form.Item>

          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select placeholder="请选择类型">
              <Select.Option value="info">通知</Select.Option>
              <Select.Option value="warning">重要</Select.Option>
              <Select.Option value="error">错误</Select.Option>
              <Select.Option value="success">成功</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <Input.TextArea rows={4} placeholder="请输入通知内容" />
          </Form.Item>

          {editingNotification && (
            <Form.Item
              name="read"
              label="已读状态"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Card>
  );
};

export default NotificationManage;
