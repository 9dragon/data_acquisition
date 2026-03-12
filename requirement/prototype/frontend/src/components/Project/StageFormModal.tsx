import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Radio, Select, InputNumber, message, Button, Space, Divider, Collapse, Switch } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, CheckOutlined } from '@ant-design/icons';
import { StageDefinition, StageProgressMode, StageTaskTemplate, MaterialRequirement, MaterialFileType } from '../../types/project';

const { TextArea } = Input;
const { Panel } = Collapse;

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

// 资料类型选项
const MATERIAL_TYPE_OPTIONS = [
  { label: '图片', value: MaterialFileType.IMAGE },
  { label: '视频', value: MaterialFileType.VIDEO },
  { label: '文档', value: MaterialFileType.DOCUMENT },
  { label: '表格', value: MaterialFileType.SPREADSHEET },
  { label: 'CAD图纸', value: MaterialFileType.CAD },
  { label: '其他', value: MaterialFileType.OTHER },
];

// 临时任务模板接口（用于编辑中）
interface TempTaskTemplate {
  id: string;
  key: string;
  name: string;
  description?: string;
  defaultWeight?: number;
  materialRequirements: MaterialRequirement[];
}

const StageFormModal: React.FC<StageFormModalProps> = ({
  visible,
  onCancel,
  onOk,
  editingStage,
}) => {
  const [form] = Form.useForm();
  const [useTaskTemplates, setUseTaskTemplates] = useState(false);
  const [taskTemplates, setTaskTemplates] = useState<TempTaskTemplate[]>([]);
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null);

  useEffect(() => {
    if (visible) {
      if (editingStage) {
        const hasTaskTemplates = Boolean(editingStage.taskTemplates && editingStage.taskTemplates.length > 0);
        setUseTaskTemplates(hasTaskTemplates);
        setTaskTemplates(hasTaskTemplates ? [...(editingStage.taskTemplates || [])] : []);

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
        setUseTaskTemplates(false);
        setTaskTemplates([]);
        form.setFieldsValue({
          color: '#1890ff',
          progressMode: 'by_task',
          icon: 'ProjectOutlined',
          defaultWeight: 0,
        });
      }
    }
  }, [visible, editingStage, form]);

  // 生成唯一ID
  const generateId = () => `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // 添加新任务
  const handleAddTask = () => {
    const newTask: TempTaskTemplate = {
      id: generateId(),
      key: `task_${taskTemplates.length + 1}`,
      name: `新任务 ${taskTemplates.length + 1}`,
      materialRequirements: [],
    };
    setTaskTemplates([...taskTemplates, newTask]);
    setEditingTaskIndex(taskTemplates.length);
  };

  // 删除任务
  const handleDeleteTask = (index: number) => {
    const updated = taskTemplates.filter((_, i) => i !== index);
    setTaskTemplates(updated);
    if (editingTaskIndex === index) {
      setEditingTaskIndex(null);
    } else if (editingTaskIndex !== null && editingTaskIndex > index) {
      setEditingTaskIndex(editingTaskIndex - 1);
    }
  };

  // 更新任务
  const handleUpdateTask = (index: number, field: keyof TempTaskTemplate, value: any) => {
    const updated = [...taskTemplates];
    updated[index] = { ...updated[index], [field]: value };
    setTaskTemplates(updated);
  };

  // 添加资料需求
  const handleAddMaterialRequirement = (taskIndex: number) => {
    const newRequirement: MaterialRequirement = {
      key: `material_${Date.now()}`,
      name: '新资料需求',
      fileType: MaterialFileType.IMAGE,
      required: true,
      minCount: 1,
      maxCount: 5,
    };
    const updated = [...taskTemplates];
    updated[taskIndex].materialRequirements.push(newRequirement);
    setTaskTemplates(updated);
  };

  // 删除资料需求
  const handleDeleteMaterialRequirement = (taskIndex: number, reqIndex: number) => {
    const updated = [...taskTemplates];
    updated[taskIndex].materialRequirements.splice(reqIndex, 1);
    setTaskTemplates(updated);
  };

  // 更新资料需求
  const handleUpdateMaterialRequirement = (
    taskIndex: number,
    reqIndex: number,
    field: keyof MaterialRequirement,
    value: any
  ) => {
    const updated = [...taskTemplates];
    updated[taskIndex].materialRequirements[reqIndex] = {
      ...updated[taskIndex].materialRequirements[reqIndex],
      [field]: value,
    };
    setTaskTemplates(updated);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // 如果选择了任务模板模式，验证任务模板
      if (useTaskTemplates) {
        if (taskTemplates.length === 0) {
          message.warning('请至少添加一个任务');
          return;
        }
        // 验证每个任务都有名称和至少一个资料需求
        for (let i = 0; i < taskTemplates.length; i++) {
          if (!taskTemplates[i].name.trim()) {
            message.warning(`请填写第 ${i + 1} 个任务的名称`);
            return;
          }
        }
      }

      const stageData: Omit<StageDefinition, 'id' | 'createTime' | 'updateTime'> = {
        key: values.key,
        name: values.name,
        description: values.description,
        icon: values.icon,
        color: typeof values.color === 'string' ? values.color : values.color?.toHexString() || '#1890ff',
        progressMode: values.progressMode,
        isSystem: editingStage?.isSystem || false,
        defaultWeight: values.defaultWeight,
        // 根据模式设置不同的字段
        taskTemplates: useTaskTemplates ? taskTemplates as StageTaskTemplate[] : undefined,
        defaultTasks: useTaskTemplates
          ? undefined
          : values.defaultTasks
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
      width={700}
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

        <Divider orientation="left">任务配置</Divider>

        <Form.Item label="任务配置方式">
          <Space>
            <span>简单任务列表</span>
            <Switch
              checked={useTaskTemplates}
              onChange={setUseTaskTemplates}
              checkedChildren="任务模板"
              unCheckedChildren="简单列表"
            />
            <span>任务模板（含资料要求）</span>
          </Space>
        </Form.Item>

        {!useTaskTemplates ? (
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
        ) : (
          <Form.Item label="任务模板">
            <div style={{ border: '1px solid #d9d9d9', borderRadius: 4 }}>
              {/* 任务列表头部 */}
              <div style={{ padding: '8px 12px', background: '#fafafa', borderBottom: '1px solid #d9d9d9' }}>
                <Button
                  type="dashed"
                  onClick={handleAddTask}
                  icon={<PlusOutlined />}
                  size="small"
                  block
                >
                  添加任务
                </Button>
              </div>

              {/* 任务列表 */}
              {taskTemplates.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>
                  暂无任务，请点击上方按钮添加
                </div>
              ) : (
                <Collapse
                  activeKey={editingTaskIndex !== null ? String(editingTaskIndex) : undefined}
                  onChange={(keys) => {
                    if (keys.length === 0) {
                      setEditingTaskIndex(null);
                    } else {
                      setEditingTaskIndex(parseInt(keys[0] as string));
                    }
                  }}
                  expandIconPosition="end"
                  ghost
                >
                  {taskTemplates.map((task, taskIndex) => {
                    const materialCount = task.materialRequirements.length;
                    const completedMaterials = task.materialRequirements.filter(m => m.required).length;

                    return (
                      <Panel
                        key={taskIndex}
                        header={
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                            <span style={{ fontWeight: 500 }}>{task.name || '未命名任务'}</span>
                            {materialCount > 0 && (
                              <span style={{ fontSize: 12, color: '#666' }}>
                                ({materialCount}项资料)
                              </span>
                            )}
                          </div>
                        }
                        extra={
                          <Space size="small">
                            <Button
                              type="text"
                              size="small"
                              icon={<DeleteOutlined />}
                              danger
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(taskIndex);
                              }}
                            />
                          </Space>
                        }
                      >
                        {/* 任务基本信息 */}
                        <div style={{ marginBottom: 16 }}>
                          <Form.Item label="任务名称" style={{ marginBottom: 8 }}>
                            <Input
                              value={task.name}
                              onChange={(e) => handleUpdateTask(taskIndex, 'name', e.target.value)}
                              placeholder="请输入任务名称"
                            />
                          </Form.Item>
                          <Form.Item label="任务标识" style={{ marginBottom: 8 }}>
                            <Input
                              value={task.key}
                              onChange={(e) => handleUpdateTask(taskIndex, 'key', e.target.value)}
                              placeholder="请输入任务标识（英文），如：install"
                            />
                          </Form.Item>
                          <Form.Item label="任务描述（可选）" style={{ marginBottom: 8 }}>
                            <TextArea
                              rows={2}
                              value={task.description || ''}
                              onChange={(e) => handleUpdateTask(taskIndex, 'description', e.target.value)}
                              placeholder="请输入任务描述"
                            />
                          </Form.Item>
                        </div>

                        {/* 资料需求列表 */}
                        <Divider orientation="left" style={{ margin: '12px 0', fontSize: 12 }}>
                          资料需求
                        </Divider>
                        <Button
                          type="dashed"
                          onClick={() => handleAddMaterialRequirement(taskIndex)}
                          icon={<PlusOutlined />}
                          size="small"
                          style={{ marginBottom: 12 }}
                        >
                          添加资料需求
                        </Button>

                        {task.materialRequirements.length === 0 ? (
                          <div style={{ padding: 12, textAlign: 'center', color: '#999', fontSize: 12 }}>
                            暂无资料需求
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {task.materialRequirements.map((req, reqIndex) => (
                              <div
                                key={reqIndex}
                                style={{
                                  padding: 12,
                                  background: '#fafafa',
                                  borderRadius: 4,
                                  border: '1px solid #f0f0f0',
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                  <span style={{ fontSize: 12, fontWeight: 500 }}>
                                    资料需求 {reqIndex + 1}
                                  </span>
                                  <Button
                                    type="text"
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleDeleteMaterialRequirement(taskIndex, reqIndex)}
                                  />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                  <div>
                                    <label style={{ fontSize: 12, color: '#666' }}>资料名称 *</label>
                                    <Input
                                      value={req.name}
                                      onChange={(e) => handleUpdateMaterialRequirement(taskIndex, reqIndex, 'name', e.target.value)}
                                      placeholder="如：安装前照片"
                                      size="small"
                                    />
                                  </div>
                                  <div>
                                    <label style={{ fontSize: 12, color: '#666' }}>资料类型</label>
                                    <Select
                                      value={req.fileType}
                                      onChange={(value) => handleUpdateMaterialRequirement(taskIndex, reqIndex, 'fileType', value)}
                                      size="small"
                                      style={{ width: '100%' }}
                                    >
                                      {MATERIAL_TYPE_OPTIONS.map(opt => (
                                        <Select.Option key={opt.value} value={opt.value}>
                                          {opt.label}
                                        </Select.Option>
                                      ))}
                                    </Select>
                                  </div>
                                  <div>
                                    <label style={{ fontSize: 12, color: '#666' }}>是否必填</label>
                                    <Switch
                                      checked={req.required}
                                      onChange={(checked) => handleUpdateMaterialRequirement(taskIndex, reqIndex, 'required', checked)}
                                      size="small"
                                    />
                                  </div>
                                  <div>
                                    <label style={{ fontSize: 12, color: '#666' }}>数量范围</label>
                                    <InputNumber
                                      value={req.minCount}
                                      onChange={(value) => handleUpdateMaterialRequirement(taskIndex, reqIndex, 'minCount', value || 1)}
                                      min={1}
                                      max={99}
                                      size="small"
                                      style={{ width: 60 }}
                                    />
                                    <span style={{ margin: '0 4px' }}>-</span>
                                    <InputNumber
                                      value={req.maxCount}
                                      onChange={(value) => handleUpdateMaterialRequirement(taskIndex, reqIndex, 'maxCount', value || 10)}
                                      min={1}
                                      max={99}
                                      size="small"
                                      style={{ width: 60 }}
                                    />
                                  </div>
                                </div>
                                {req.description && (
                                  <div style={{ marginTop: 8 }}>
                                    <label style={{ fontSize: 12, color: '#666' }}>说明</label>
                                    <Input.TextArea
                                      value={req.description}
                                      onChange={(e) => handleUpdateMaterialRequirement(taskIndex, reqIndex, 'description', e.target.value)}
                                      placeholder="资料说明（可选）"
                                      rows={1}
                                      size="small"
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </Panel>
                    );
                  })}
                </Collapse>
              )}
            </div>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default StageFormModal;
