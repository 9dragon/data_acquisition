import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Space, Select } from 'antd';
import type { DeviceResearchBasic } from '../../types/device';
import type { Project } from '../../types/project';

interface BasicInfoTabProps {
  initialValues?: DeviceResearchBasic;
  onSave?: (data: DeviceResearchBasic) => void;
  loading?: boolean;
  disabled?: boolean;
  processOptions?: Array<{ label: string; value: string }>;
  workshopOptions?: Array<{ label: string; value: string }>;
  deviceTypeOptions?: Array<{ label: string; value: string }>;
  projects?: Project[];
  projectId?: string; // 新增：项目ID
  onProjectChange?: (projectId: string) => void;
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  initialValues,
  onSave,
  loading = false,
  disabled = false,
  processOptions = [],
  workshopOptions = [],
  deviceTypeOptions = [],
  projects = [],
  projectId,
  onProjectChange,
}) => {
  const [form] = Form.useForm();

  // 当 initialValues 存在时，设置所有表单字段
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        projectName: projectId || undefined,
        deviceType: initialValues.deviceType,
        workshop: initialValues.workshop,
        processId: initialValues.processId,
        quantity: initialValues.quantity,
        deviceManufacturer: initialValues.deviceManufacturer || initialValues.manufacturer,
        remarks: initialValues.remarks,
      });
    }
  }, [initialValues, projectId, form]);

  // 单独处理 projectId 变化时更新 projectName 字段（用于新建页面）
  useEffect(() => {
    if (projectId && !initialValues) {
      form.setFieldsValue({
        projectName: projectId,
      });
    }
  }, [projectId, initialValues, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // 获取工序名称
      const selectedProcess = processOptions.find(p => p.value === values.processId);

      // 获取项目名称
      const selectedProject = projects.find(p => p.id === values.projectName);

      const data: DeviceResearchBasic = {
        projectName: typeof values.projectName === 'string' ? values.projectName : selectedProject?.name,
        deviceType: values.deviceType,
        workshop: values.workshop,
        processId: values.processId,
        processName: selectedProcess?.label,
        quantity: values.quantity,
        deviceManufacturer: values.deviceManufacturer,
        manufacturer: values.deviceManufacturer, // 兼容旧字段
        remarks: values.remarks,
      };
      onSave?.(data);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      autoComplete="off"
    >
      <Form.Item
        label="项目名称"
        name="projectName"
        rules={[{ required: !disabled, message: '请选择项目名称' }]}
      >
        <Select
          placeholder="请选择项目名称"
          disabled={disabled}
          allowClear
          showSearch
          optionFilterProp="label"
          onChange={onProjectChange}
        >
          {projects.map((project: Project) => (
            <Select.Option key={project.id} value={project.id} label={project.name}>
              {project.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="所属车间"
        name="workshop"
      >
        <Select
          placeholder="请选择所属车间"
          disabled={disabled}
          allowClear
          showSearch
          optionFilterProp="label"
        >
          {workshopOptions.map((option) => (
            <Select.Option key={option.value} value={option.value} label={option.label}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="工序"
        name="processId"
      >
        <Select
          placeholder="请选择工序"
          disabled={disabled}
          allowClear
          showSearch
          optionFilterProp="label"
        >
          {processOptions.map((option) => (
            <Select.Option key={option.value} value={option.value} label={option.label}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="设备类型"
        name="deviceType"
        rules={[
          { required: !disabled, message: '请选择设备类型' },
          { max: 100, message: '设备类型不能超过100个字符' }
        ]}
      >
        <Select
          placeholder="请选择设备类型"
          disabled={disabled}
          allowClear
          showSearch
          optionFilterProp="label"
        >
          {deviceTypeOptions.map((option) => (
            <Select.Option key={option.value} value={option.value} label={option.label}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="数量"
        name="quantity"
        rules={[{ required: !disabled, message: '请输入数量' }]}
        initialValue={1}
      >
        <InputNumber
          placeholder="请输入数量"
          disabled={disabled}
          min={1}
          max={9999}
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item
        label="设备厂商"
        name="deviceManufacturer"
        rules={[{ required: !disabled, message: '请输入设备厂商' }]}
      >
        <Input placeholder="请输入设备厂商" disabled={disabled} />
      </Form.Item>

      <Form.Item
        label="备注"
        name="remarks"
      >
        <Input.TextArea
          rows={4}
          placeholder="请输入备注信息"
          maxLength={500}
          showCount
          disabled={disabled}
        />
      </Form.Item>

      {!disabled && (
        <Form.Item>
          <Space>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              style={{
                padding: '6px 16px',
                background: loading ? '#d9d9d9' : '#1890ff',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? '保存中...' : '保存基础信息'}
            </button>
          </Space>
        </Form.Item>
      )}
    </Form>
  );
};

export default BasicInfoTab;
