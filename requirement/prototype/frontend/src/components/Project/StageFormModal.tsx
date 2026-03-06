import React, { useEffect } from 'react';
import { Modal, Form, Input, Radio, ColorPicker, Select, InputNumber, message } from 'antd';
import { StageDefinition, StageProgressMode } from '../../types/project';

const { TextArea } = Input;

interface StageFormModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (values: Omit<StageDefinition, 'id' | 'createTime' | 'updateTime'>) => void;
  editingStage?: StageDefinition;
}

// 预设颜色列表
const PRESET_COLORS = [
  '#1890ff', '#52c41a', '#faad14', '#722ed1',
  '#f5222d', '#fa8c16', '#13c2c2', '#eb2f96',
  '#2f54eb', '#a0d911', '#fa541c', '#9254de',
];

// 预设图标列表
const ICON_OPTIONS = [
  { label: '项目', value: 'ProjectOutlined' },
  { label: '同步', value: 'SyncOutlined' },
  { label: '时钟', value: 'ClockCircleOutlined' },
  { label: '检查', value: 'CheckCircleOutlined' },
  { label: '设置', value: 'SettingOutlined' },
  { label: '工具', value: 'ToolOutlined' },
  { label: '火箭', value: 'RocketOutlined' },
  { label: '闪电', value: 'ThunderboltOutlined' },
  { label: '实验', value: 'ExperimentOutlined' },
  { label: '数据库', value: 'DatabaseOutlined' },
];

const StageFormModal: React.FC<StageFormModalProps> = ({
  visible,
  onCancel,
  onOk,
  editingStage,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (editingStage) {
        form.setFieldsValue({
          key: editingStage.key,
          name: editingStage.name,
          description: editingStage.description,
          icon: editingStage.icon,
          color: editingStage.color,
          progressMode: editingStage.progressMode,
          defaultWeight: editingStage.defaultWeight,
          defaultTasks: editingStage.defaultTasks?.join('\n') || '',
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          color: '#1890ff',
          progressMode: 'by_task',
          icon: 'ProjectOutlined',
          defaultWeight: 0,
        });
      }
    }
  }, [visible, editingStage, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const stageData: Omit<StageDefinition, 'id' | 'createTime' | 'updateTime'> = {
        key: values.key,
        name: values.name,
        description: values.description,
        icon: values.icon,
        color: typeof values.color === 'string' ? values.color : values.color?.toHexString() || '#1890ff',
        progressMode: values.progressMode,
        isSystem: editingStage?.isSystem || false,
        defaultWeight: values.defaultWeight,
        defaultTasks: values.defaultTasks
          ? values.defaultTasks.split('\n').map((t: string) => t.trim()).filter((t: string) => t)
          : undefined,
      };
      onOk(stageData);
    } catch (error) {
      message.error('请检查表单填写是否正确');
    }
  };

  return (
    <Modal
      title={editingStage ? '编辑阶段' : '创建阶段'}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
      >
        <Form.Item
          label="阶段标识"
          name="key"
          rules={[{ required: true, message: '请输入阶段标识' }]}
          tooltip="阶段的唯一标识，使用英文，如：planning"
        >
          <Input placeholder="请输入阶段标识，如：planning" disabled={editingStage?.isSystem} />
        </Form.Item>

        <Form.Item
          label="阶段名称"
          name="name"
          rules={[{ required: true, message: '请输入阶段名称' }]}
        >
          <Input placeholder="请输入阶段名称" />
        </Form.Item>

        <Form.Item
          label="阶段描述"
          name="description"
          rules={[{ required: true, message: '请输入阶段描述' }]}
        >
          <TextArea rows={3} placeholder="请输入阶段描述" />
        </Form.Item>

        <Form.Item
          label="推进方式"
          name="progressMode"
          rules={[{ required: true, message: '请选择推进方式' }]}
          tooltip="按任务：阶段包含多个子任务，所有任务完成后该阶段即完成；按设备：阶段包含多个任务，填报时按每个设备的每个任务进行填报和统计"
        >
          <Radio.Group>
            <Radio value="by_task">按任务</Radio>
            <Radio value="by_device">按设备</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="默认权重"
          name="defaultWeight"
          tooltip="该阶段在项目中的默认权重占比（0-100%），用于创建项目时自动填充"
          rules={[
            { type: 'number', min: 0, max: 100, message: '权重必须在0-100之间' }
          ]}
        >
          <InputNumber
            min={0}
            max={100}
            precision={0}
            placeholder="请输入默认权重"
            style={{ width: '100%' }}
            addonAfter="%"
          />
        </Form.Item>

        <Form.Item
          label="显示颜色"
          name="color"
          rules={[{ required: true, message: '请选择颜色' }]}
        >
          <Select>
            {PRESET_COLORS.map(color => (
              <Select.Option key={color} value={color}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      backgroundColor: color,
                      borderRadius: 4,
                      border: '1px solid #d9d9d9',
                    }}
                  />
                  <span>{color}</span>
                </div>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="图标"
          name="icon"
          tooltip="可选"
        >
          <Select placeholder="选择图标" allowClear>
            {ICON_OPTIONS.map(icon => (
              <Select.Option key={icon.value} value={icon.value}>
                {icon.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="默认任务列表"
          name="defaultTasks"
          tooltip="可选，每行一个任务"
        >
          <TextArea
            rows={4}
            placeholder="请输入默认任务列表，每行一个任务&#10;例如：&#10;人员配置&#10;设备采购&#10;工具准备"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StageFormModal;
