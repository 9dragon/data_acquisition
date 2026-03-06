import React, { useState } from 'react';
import { Card, Tabs, Descriptions, Button, Form, Input, message, Space, List, Tag } from 'antd';
import { UserOutlined, LockOutlined, HistoryOutlined } from '@ant-design/icons';
import PageHeader from '../../components/Common/PageHeader';
import { useUserStore } from '../../stores/userStore';

const { TabPane } = Tabs;

interface ActivityLog {
  id: string;
  action: string;
  description: string;
  time: string;
  type: 'login' | 'operation' | 'security';
}

const ProfileCenter: React.FC = () => {
  const { currentUser, updateUserProfile, changePassword } = useUserStore();
  const [editing, setEditing] = useState(false);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // 模拟活动记录数据
  const activityLogs: ActivityLog[] = [
    {
      id: '1',
      action: '登录系统',
      description: '从 Chrome 浏览器登录',
      time: '2024-03-06 09:30:25',
      type: 'login',
    },
    {
      id: '2',
      action: '修改个人信息',
      description: '更新了手机号码',
      time: '2024-03-05 14:20:10',
      type: 'operation',
    },
    {
      id: '3',
      action: '登录系统',
      description: '从 Edge 浏览器登录',
      time: '2024-03-05 08:45:33',
      type: 'login',
    },
    {
      id: '4',
      action: '修改密码',
      description: '定期更新密码',
      time: '2024-03-01 16:30:00',
      type: 'security',
    },
    {
      id: '5',
      action: '登录系统',
      description: '从 Chrome 浏览器登录',
      time: '2024-03-01 08:15:42',
      type: 'login',
    },
  ];

  const handleEditProfile = () => {
    profileForm.setFieldsValue({
      name: currentUser?.name,
      email: currentUser?.email,
      phone: currentUser?.phone,
    });
    setEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      const values = await profileForm.validateFields();
      if (currentUser) {
        updateUserProfile(currentUser.id, values);
        message.success('个人信息更新成功');
        setEditing(false);
      }
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      if (currentUser) {
        const success = changePassword(currentUser.id, values.oldPassword, values.newPassword);
        if (success) {
          message.success('密码修改成功，请重新登录');
          passwordForm.resetFields();
        } else {
          message.error('旧密码不正确或新密码与旧密码相同');
        }
      }
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  const getRoleText = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: '管理员',
      manager: '项目经理',
      engineer: '工程师',
      tester: '测试员',
    };
    return roleMap[role] || role;
  };

  const getStatusText = (status: string) => {
    return status === 'active' ? '正常' : '停用';
  };

  const getActivityTypeTag = (type: string) => {
    switch (type) {
      case 'login':
        return <Tag color="blue">登录</Tag>;
      case 'operation':
        return <Tag color="green">操作</Tag>;
      case 'security':
        return <Tag color="orange">安全</Tag>;
      default:
        return <Tag>未知</Tag>;
    }
  };

  if (!currentUser) {
    return <div>加载中...</div>;
  }

  return (
    <Card>
      <PageHeader title="个人中心" />

      <Tabs defaultActiveKey="info">
        <TabPane
          key="info"
          tab={
            <span>
              <UserOutlined />
              基本信息
            </span>
          }
        >
          <Descriptions
            title="用户信息"
            bordered
            column={2}
            extra={
              !editing && (
                <Button type="primary" onClick={handleEditProfile}>
                  编辑信息
                </Button>
              )
            }
          >
            <Descriptions.Item label="用户名">{currentUser.username}</Descriptions.Item>
            <Descriptions.Item label="姓名">
              {editing ? (
                <Form.Item
                  name="name"
                  style={{ margin: 0 }}
                  rules={[{ required: true, message: '请输入姓名' }]}
                >
                  <Input placeholder="请输入姓名" />
                </Form.Item>
              ) : (
                currentUser.name
              )}
            </Descriptions.Item>
            <Descriptions.Item label="邮箱">
              {editing ? (
                <Form.Item
                  name="email"
                  style={{ margin: 0 }}
                  rules={[
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '请输入有效的邮箱地址' },
                  ]}
                >
                  <Input placeholder="请输入邮箱" />
                </Form.Item>
              ) : (
                currentUser.email
              )}
            </Descriptions.Item>
            <Descriptions.Item label="手机号">
              {editing ? (
                <Form.Item
                  name="phone"
                  style={{ margin: 0 }}
                  rules={[
                    { required: true, message: '请输入手机号' },
                    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' },
                  ]}
                >
                  <Input placeholder="请输入手机号" />
                </Form.Item>
              ) : (
                currentUser.phone
              )}
            </Descriptions.Item>
            <Descriptions.Item label="角色">{getRoleText(currentUser.role)}</Descriptions.Item>
            <Descriptions.Item label="状态">{getStatusText(currentUser.status)}</Descriptions.Item>
          </Descriptions>

          {editing && (
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Space>
                <Button onClick={() => setEditing(false)}>取消</Button>
                <Button type="primary" onClick={handleSaveProfile}>
                  保存
                </Button>
              </Space>
            </div>
          )}
        </TabPane>

        <TabPane
          key="security"
          tab={
            <span>
              <LockOutlined />
              安全设置
            </span>
          }
        >
          <Card title="修改密码" style={{ maxWidth: 600 }}>
            <Form form={passwordForm} layout="vertical">
              <Form.Item
                name="oldPassword"
                label="旧密码"
                rules={[{ required: true, message: '请输入旧密码' }]}
              >
                <Input.Password placeholder="请输入旧密码" />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="新密码"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码至少6位' },
                ]}
              >
                <Input.Password placeholder="请输入新密码" />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="确认密码"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: '请再次输入新密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="请再次输入新密码" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" onClick={handleChangePassword}>
                  修改密码
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane
          key="activity"
          tab={
            <span>
              <HistoryOutlined />
              活动记录
            </span>
          }
        >
          <List
            dataSource={activityLogs}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Space>
                      {getActivityTypeTag(item.type)}
                      <span>{item.action}</span>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={0}>
                      <span>{item.description}</span>
                      <span style={{ color: '#999', fontSize: '12px' }}>{item.time}</span>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default ProfileCenter;
