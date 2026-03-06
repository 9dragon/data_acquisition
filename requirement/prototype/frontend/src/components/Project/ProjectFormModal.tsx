import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Space, Divider, InputNumber, message, DatePicker } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useStageStore } from '../../stores/stageStore';
import { Project, ProjectStageConfig } from '../../types/project';
import dayjs from 'dayjs';

interface ProjectFormModalProps {
  visible: boolean;
  project?: Project | null;
  mode: 'create' | 'edit';
  onCancel: () => void;
  onOk: (values: any) => void;
}

const ProjectFormModal: React.FC<ProjectFormModalProps> = ({ visible, project, mode = 'create', onCancel, onOk }) => {
  const [form] = Form.useForm();
  const { stageDefinitions, getStageByKey } = useStageStore();
  const [stageConfigs, setStageConfigs] = useState<ProjectStageConfig[]>([]);

  // 当project变化时，回填表单
  useEffect(() => {
    if (mode === 'edit' && project) {
      form.setFieldsValue({
        code: project.code,
        name: project.name,
        description: project.description,
        priority: project.priority,
        managerId: project.managerId,
        startDate: project.startDate ? dayjs(project.startDate) : undefined,
        plannedEndDate: project.plannedEndDate ? dayjs(project.plannedEndDate) : undefined,
      });
      // 回填阶段配置
      if (project.stageConfigs && project.stageConfigs.length > 0) {
        setStageConfigs(project.stageConfigs);
      }
    } else if (visible) {
      // 新建模式：初始化默认阶段配置
      const systemStages = stageDefinitions.filter(s => s.isSystem);
      const configs: ProjectStageConfig[] = systemStages.map(stage => ({
        stageKey: stage.key,
        weight: stage.defaultWeight || 0,
        status: 'not_started' as const,
      }));
      setStageConfigs(configs);
      form.resetFields();
    }
  }, [project, mode, visible, stageDefinitions, form]);

  // 计算权重总和
  const totalWeight = stageConfigs.reduce((sum, config) => sum + (config.weight || 0), 0);
  const isValidWeight = Math.abs(totalWeight - 100) < 0.01;

  // 添加阶段
  const handleAddStage = (stageKey: string) => {
    const exists = stageConfigs.some(c => c.stageKey === stageKey);
    if (exists) {
      message.warning('该阶段已添加');
      return;
    }
    const stage = stageDefinitions.find(s => s.key === stageKey);
    const newConfig: ProjectStageConfig = {
      stageKey,
      weight: stage?.defaultWeight || 0,
      status: 'not_started',
    };
    setStageConfigs([...stageConfigs, newConfig]);
  };

  // 删除阶段
  const handleRemoveStage = (stageKey: string) => {
    setStageConfigs(stageConfigs.filter(c => c.stageKey !== stageKey));
  };

  // 更新阶段权重
  const handleUpdateWeight = (stageKey: string, weight: number | null) => {
    setStageConfigs(stageConfigs.map(c =>
      c.stageKey === stageKey ? { ...c, weight: weight || 0 } : c
    ));
  };

  // 更新阶段负责人
  const handleUpdateManager = (stageKey: string, managerId: string) => {
    setStageConfigs(stageConfigs.map(c =>
      c.stageKey === stageKey ? { ...c, managerId } : c
    ));
  };

  // 平均分配权重
  const handleDistributeEvenly = () => {
    if (stageConfigs.length === 0) return;
    const weight = Math.round(100 / stageConfigs.length);
    setStageConfigs(stageConfigs.map(c => ({ ...c, weight })));
  };

  // 重置为默认权重
  const handleResetToDefault = () => {
    setStageConfigs(stageConfigs.map(c => {
      const stage = stageDefinitions.find(s => s.key === c.stageKey);
      return { ...c, weight: stage?.defaultWeight || 0 };
    }));
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (!isValidWeight) {
        message.error(`阶段权重总和必须为100%，当前为${totalWeight}%`);
        return;
      }

      if (stageConfigs.length === 0) {
        message.error('请至少添加一个阶段');
        return;
      }

      // 格式化日期
      const formattedValues = {
        ...values,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : undefined,
        plannedEndDate: values.plannedEndDate ? values.plannedEndDate.format('YYYY-MM-DD') : undefined,
      };

      onOk({
        ...formattedValues,
        stageConfigs,
      });
      if (mode === 'create') {
        form.resetFields();
      }
    } catch (error) {
      message.error('请检查表单填写是否正确');
    }
  };

  const availableStages = stageDefinitions.filter(
    s => !stageConfigs.some(c => c.stageKey === s.key)
  );

  const title = mode === 'edit' ? '编辑项目' : '新建项目';

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      width={800}
      destroyOnClose
    >
      <Form form={form} layout="vertical" preserve={false}>
        {/* 基本信息 */}
        <Divider orientation="left">基本信息</Divider>

        <Form.Item
          label="项目名称"
          name="name"
          rules={[{ required: true, message: '请输入项目名称' }]}
        >
          <Input placeholder="请输入项目名称" />
        </Form.Item>

        <Form.Item
          label="项目编号"
          name="code"
          rules={[{ required: true, message: '请输入项目编号' }]}
        >
          <Input placeholder="请输入项目编号，如：PRJ-2024-001" />
        </Form.Item>

        <Form.Item
          label="项目描述"
          name="description"
        >
          <Input.TextArea rows={3} placeholder="请输入项目描述" />
        </Form.Item>

        <Form.Item
          label="项目负责人"
          name="managerId"
          rules={[{ required: true, message: '请选择项目负责人' }]}
        >
          <Select placeholder="请选择负责人">
            <Select.Option value="1">张经理</Select.Option>
            <Select.Option value="2">李工程师</Select.Option>
            <Select.Option value="3">王工程师</Select.Option>
            <Select.Option value="4">赵工程师</Select.Option>
            <Select.Option value="5">刘工程师</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="优先级"
          name="priority"
          rules={[{ required: true, message: '请选择优先级' }]}
        >
          <Select placeholder="请选择优先级">
            <Select.Option value="low">低</Select.Option>
            <Select.Option value="medium">中</Select.Option>
            <Select.Option value="high">高</Select.Option>
            <Select.Option value="urgent">紧急</Select.Option>
          </Select>
        </Form.Item>

        <Space size="large" style={{ width: '100%' }}>
          <Form.Item
            label="开始日期"
            name="startDate"
            style={{ flex: 1 }}
          >
            <DatePicker style={{ width: '100%' }} placeholder="请选择开始日期" />
          </Form.Item>

          <Form.Item
            label="计划结束日期"
            name="plannedEndDate"
            style={{ flex: 1 }}
          >
            <DatePicker style={{ width: '100%' }} placeholder="请选择计划结束日期" />
          </Form.Item>
        </Space>

        {/* 阶段配置 */}
        <Divider orientation="left">
          <Space>
            阶段配置
            <Button
              type="link"
              size="small"
              onClick={handleDistributeEvenly}
              disabled={stageConfigs.length === 0}
            >
              平均分配
            </Button>
            <Button
              type="link"
              size="small"
              onClick={handleResetToDefault}
              disabled={stageConfigs.length === 0}
            >
              重置默认
            </Button>
          </Space>
        </Divider>

        {stageConfigs.map((config) => {
          const stage = stageDefinitions.find(s => s.key === config.stageKey);
          return (
            <div
              key={config.stageKey}
              style={{
                border: '1px solid #d9d9d9',
                borderRadius: 6,
                padding: 16,
                marginBottom: 12,
                position: 'relative',
              }}
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => handleRemoveStage(config.stageKey)}
                style={{ position: 'absolute', right: 8, top: 8 }}
              >
                删除
              </Button>

              <div style={{ marginBottom: 12, fontWeight: 600, color: stage?.color }}>
                {stage?.name}
              </div>

              <Space size="large">
                <div>
                  <div style={{ marginBottom: 4, fontSize: 12, color: '#666' }}>权重</div>
                  <InputNumber
                    min={0}
                    max={100}
                    value={config.weight}
                    onChange={(value) => handleUpdateWeight(config.stageKey, value)}
                    addonAfter="%"
                    style={{ width: 120 }}
                  />
                </div>

                <div>
                  <div style={{ marginBottom: 4, fontSize: 12, color: '#666' }}>阶段负责人</div>
                  <Select
                    placeholder="选择负责人"
                    value={config.managerId}
                    onChange={(value) => handleUpdateManager(config.stageKey, value)}
                    style={{ width: 150 }}
                    allowClear
                  >
                    <Select.Option value="1">张经理</Select.Option>
                    <Select.Option value="2">李工程师</Select.Option>
                    <Select.Option value="3">王工程师</Select.Option>
                    <Select.Option value="4">赵工程师</Select.Option>
                    <Select.Option value="5">刘工程师</Select.Option>
                  </Select>
                </div>
              </Space>
            </div>
          );
        })}

        {availableStages.length > 0 && (
          <Form.Item label="添加阶段">
            <Select
              placeholder="选择要添加的阶段"
              onChange={handleAddStage}
              value={null}
            >
              {availableStages.map(stage => (
                <Select.Option key={stage.key} value={stage.key}>
                  {stage.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {/* 权重总和提示 */}
        <div style={{
          padding: 12,
          backgroundColor: isValidWeight ? '#f6ffed' : '#fff2f0',
          border: `1px solid ${isValidWeight ? '#b7eb8f' : '#ffccc7'}`,
          borderRadius: 4,
          textAlign: 'center',
          fontSize: 14,
          fontWeight: 600,
          color: isValidWeight ? '#52c41a' : '#ff4d4f',
        }}>
          权重总计：{totalWeight}% {isValidWeight ? '✓' : `✗ 需要调整至100%`}
        </div>
      </Form>
    </Modal>
  );
};

export default ProjectFormModal;
