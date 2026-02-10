import React, { useState } from 'react';
import { Card, Space, Button, Tag, Modal, Form, Input, ColorPicker, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '../../components/Common/PageHeader';
import DataTable from '../../components/Common/DataTable';
import { mockDocumentTags } from '../../services/mockData';
import type { ColumnsType } from 'antd/es/table';
import type { DocumentTag } from '../../types/document';

const TagManage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<DocumentTag | null>(null);
  const [form] = Form.useForm();

  const columns: ColumnsType<DocumentTag> = [
    {
      title: '标签名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (name: string, record) => (
        <Tag color={record.color}>{name}</Tag>
      ),
    },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      width: 100,
      render: (color: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 24,
              height: 24,
              backgroundColor: color,
              border: '1px solid #d9d9d9',
              borderRadius: 4,
            }}
          />
          <span>{color}</span>
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: '类型',
      dataIndex: 'isSystem',
      key: 'isSystem',
      width: 100,
      render: (isSystem: boolean) => (
        <Tag color={isSystem ? 'blue' : 'green'}>
          {isSystem ? '系统标签' : '自定义'}
        </Tag>
      ),
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      key: 'usageCount',
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 100,
      render: (time: string) => time?.split(' ')[0],
    },
  ];

  const actions = [
    {
      label: '编辑',
      onClick: (record: DocumentTag) => {
        setEditingTag(record);
        form.setFieldsValue(record);
        setModalVisible(true);
      },
      disabled: (record: DocumentTag) => record.isSystem,
    },
    {
      label: '删除',
      onClick: (record: DocumentTag) => {
        Modal.confirm({
          title: '确认删除',
          content: `确定要删除标签"${record.name}"吗？`,
          onOk: () => {
            message.success('删除成功');
          },
        });
      },
      danger: true,
      disabled: (record: DocumentTag) => record.isSystem,
    },
  ];

  const handleAdd = () => {
    setEditingTag(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log('提交标签:', values);
      message.success(editingTag ? '更新成功' : '创建成功');
      setModalVisible(false);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  return (
    <Card>
      <PageHeader
        title="标签管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建标签
          </Button>
        }
      />

      <DataTable
        columns={columns}
        dataSource={mockDocumentTags}
        actions={actions}
        loading={loading}
        rowKey="id"
      />

      <Modal
        title={editingTag ? '编辑标签' : '新建标签'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={520}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="标签名称"
            rules={[{ required: true, message: '请输入标签名称' }]}
          >
            <Input placeholder="请输入标签名称" />
          </Form.Item>

          <Form.Item
            name="color"
            label="标签颜色"
            rules={[{ required: true, message: '请选择标签颜色' }]}
            initialValue="#1890ff"
          >
            <ColorPicker showText />
          </Form.Item>

          <Form.Item
            name="category"
            label="标签分类"
            rules={[{ required: true, message: '请输入标签分类' }]}
          >
            <Input placeholder="请输入标签分类，如：文档类型、优先级等" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={3} placeholder="请输入标签描述" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default TagManage;
