import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Space, message, Checkbox, Row, Col } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { ProjectTask, ProjectStage } from '../../types/project';
import { mockUsers } from '../../services/mockData';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

// 实施阶段定义（仅实施阶段）
const IMPLEMENTATION_STAGES = [
  { key: 'planning', label: '准备阶段' },
  { key: 'construction', label: '施工阶段' },
  { key: 'configuration', label: '配置阶段' },
  { key: 'verification', label: '核对阶段' },
];

// 任务状态
const TASK_STATUS = [
  { key: 'pending', label: '未开始' },
  { key: 'in_progress', label: '进行中' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
];

interface TaskFormModalProps {
  visible: boolean;
  task: ProjectTask | null;
  projectId: string;
  allTasks?: ProjectTask[];
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({
  visible,
  task,
  projectId,
  allTasks = [],
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 重置表单
  useEffect(() => {
    if (visible) {
      if (task) {
        // 编辑模式
        form.setFieldsValue({
          name: task.name,
          description: task.description,
          stage: task.stage,
          status: task.status,
          dateRange: [dayjs(task.startDate), dayjs(task.endDate)],
          assignees: task.assignees,
          progress: task.progress,
          dependencies: task.dependencies || [],
        });
      } else {
        // 新建模式
        form.resetFields();
      }
    }
  }, [visible, task, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 构建任务数据
      const taskData = {
        name: values.name,
        description: values.description,
        stage: values.stage,
        status: values.status,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        assignees: values.assignees,
        progress: values.progress || 0,
        dependencies: values.dependencies || [],
      };

      // 提交
      onSubmit(taskData);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  // 获取可选的依赖任务（排除当前任务）
  const getDependencyOptions = () => {
    return allTasks
      .filter(t => t.id !== task?.id)
      .map(t => ({
        label: `${t.name} (${t.stage})`,
        value: t.id,
      }));
  };

  return (
    <Modal
      title={task ? '编辑任务' : '创建任务'}
      open={visible}
      onCancel={onClose}
      width={600}
      footer={
        <Space>
          <button
            className="ant-btn"
            onClick={onClose}
            style={{ padding: '6.4px 20px', fontSize: 14 }}
          >
            取消
          </button>
          <button
            type="primary"
            className="ant-btn ant-btn-primary"
            icon={<CheckOutlined />}
            loading={loading}
            onClick={handleSubmit}
            style={{ padding: '6.4px 20px', fontSize: 14 }}
          >
            {task ? '保存' : '创建'}
          </button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: 'pending',
          progress: 0,
          assignees: [],
          dependencies: [],
        }}
      >
        {/* 任务名称 */}
        <Form.Item
          label="任务名称"
          name="name"
          rules={[{ required: true, message: '请输入任务名称' }]}
        >
          <Input placeholder="请输入任务名称" maxLength={50} showCount />
        </Form.Item>

        {/* 任务描述 */}
        <Form.Item
          label="任务描述"
          name="description"
        >
          <TextArea
            rows={3}
            placeholder="请描述任务的具体内容、目标和交付物"
            maxLength={200}
            showCount
          />
        </Form.Item>

        <Row gutter={16}>
          {/* 所属阶段 */}
          <Col span={12}>
            <Form.Item
              label="所属阶段"
              name="stage"
              rules={[{ required: true, message: '请选择所属阶段' }]}
            >
              <Select placeholder="请选择阶段">
                {IMPLEMENTATION_STAGES.map(stage => (
                  <Select.Option key={stage.key} value={stage.key}>
                    {stage.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* 任务状态 */}
          <Col span={12}>
            <Form.Item
              label="任务状态"
              name="status"
              rules={[{ required: true, message: '请选择任务状态' }]}
            >
              <Select placeholder="请选择状态">
                {TASK_STATUS.map(status => (
                  <Select.Option key={status.key} value={status.key}>
                    {status.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* 时间范围 */}
        <Form.Item
          label="计划时间"
          name="dateRange"
          rules={[{ required: true, message: '请选择计划时间' }]}
        >
          <RangePicker
            style={{ width: '100%' }}
            format="YYYY-MM-DD"
            placeholder={['开始日期', '结束日期']}
          />
        </Form.Item>

        {/* 负责人 */}
        <Form.Item
          label="负责人"
          name="assignees"
          rules={[{ required: true, message: '请选择负责人' }]}
        >
          <Select
            mode="multiple"
            placeholder="请选择负责人"
            options={mockUsers.map(user => ({
              label: user.name,
              value: user.id,
            }))}
          />
        </Form.Item>

        {/* 进度 */}
        <Form.Item
          label="完成进度"
          name="progress"
        >
          <Input type="number" min={0} max={100} placeholder="0-100" suffix="%" />
        </Form.Item>

        {/* 任务依赖 */}
        {allTasks.length > 0 && (
          <Form.Item
            label="依赖任务"
            name="dependencies"
            tooltip="此任务开始前需要完成的任务"
          >
            <Checkbox.Group
              style={{ width: '100%' }}
              options={getDependencyOptions()}
            />
          </Form.Item>
        )}
      </Form>

      {/* 提示信息 */}
      <div style={{ padding: 12, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
        <div style={{ fontSize: 12, color: '#52c41a', marginBottom: 4 }}>💡 提示</div>
        <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#666' }}>
          <li>任务创建后会添加到对应的项目计划中</li>
          <li>阶段进度会根据该阶段所有任务自动计算</li>
          <li>设置依赖关系可以确保任务按顺序执行</li>
        </ul>
      </div>
    </Modal>
  );
};

export default TaskFormModal;
