import React, { useState } from 'react';
import { Card, Tabs, Button, Modal, Form, Input, message, Space, Table } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '../../components/Common/PageHeader';
import type { ColumnsType } from 'antd/es/table';

const ConfigManage: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('device');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form] = Form.useForm();

  // 设备分类配置
  const deviceCategories = [
    { id: '1', name: 'PLC', code: 'PLC', description: '可编程逻辑控制器' },
    { id: '2', name: 'CNC', code: 'CNC', description: '数控机床' },
    { id: '3', name: 'Robot', code: 'Robot', description: '工业机器人' },
    { id: '4', name: 'Sensor', code: 'Sensor', description: '传感器' },
    { id: '5', name: 'Instrument', code: 'Instrument', description: '仪器仪表' },
  ];

  // 问题分类配置
  const issueCategories = [
    { id: '1', name: '设备问题', code: 'device', description: '设备相关的问题' },
    { id: '2', name: '计划问题', code: 'plan', description: '项目计划相关的问题' },
    { id: '3', name: '技术问题', code: 'technical', description: '技术实现相关的问题' },
    { id: '4', name: '资源问题', code: 'resource', description: '人员、设备等资源问题' },
  ];

  // 文档分类配置
  const documentCategories = [
    { id: '1', name: '需求文档', code: 'requirement', description: '项目需求相关文档' },
    { id: '2', name: '设计文档', code: 'design', description: '系统设计相关文档' },
    { id: '3', name: '操作手册', code: 'manual', description: '系统操作说明文档' },
    { id: '4', name: '测试报告', code: 'test', description: '测试相关报告' },
    { id: '5', name: '验收文档', code: 'acceptance', description: '项目验收相关文档' },
  ];

  const [dataSource, setDataSource] = useState(deviceCategories);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (key === 'device') {
      setDataSource(deviceCategories);
    } else if (key === 'issue') {
      setDataSource(issueCategories);
    } else if (key === 'document') {
      setDataSource(documentCategories);
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: '分类编号',
      dataIndex: 'code',
      key: 'code',
      width: 150,
    },
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          <Button
            key="edit"
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            key="delete"
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除分类"${record.name}"吗？`,
      onOk: () => {
        message.success('删除成功');
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log('提交分类:', values);
      message.success(editingItem ? '更新成功' : '创建成功');
      setModalVisible(false);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  const getTabTitle = (key: string) => {
    switch (key) {
      case 'device':
        return '设备分类';
      case 'issue':
        return '问题分类';
      case 'document':
        return '文档分类';
      default:
        return '';
    }
  };

  const tabItems = [
    {
      key: 'device',
      label: '设备分类',
      children: (
        <Table
          columns={columns}
          dataSource={deviceCategories}
          rowKey="id"
          pagination={false}
        />
      ),
    },
    {
      key: 'issue',
      label: '问题分类',
      children: (
        <Table
          columns={columns}
          dataSource={issueCategories}
          rowKey="id"
          pagination={false}
        />
      ),
    },
    {
      key: 'document',
      label: '文档分类',
      children: (
        <Table
          columns={columns}
          dataSource={documentCategories}
          rowKey="id"
          pagination={false}
        />
      ),
    },
  ];

  return (
    <Card>
      <PageHeader title="基础配置" />

      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabItems}
        tabBarExtraContent={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建{getTabTitle(activeTab)}
          </Button>
        }
      />

      <Modal
        title={`${editingItem ? '编辑' : '新建'}${getTabTitle(activeTab)}`}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={520}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="code"
            label="分类编号"
            rules={[{ required: true, message: '请输入分类编号' }]}
          >
            <Input placeholder="请输入分类编号" />
          </Form.Item>

          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={3} placeholder="请输入分类描述" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ConfigManage;
