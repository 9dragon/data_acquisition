import React, { useEffect } from 'react';
import { Form, Input, DatePicker, Space, AutoComplete, Select } from 'antd';
import type { DeviceResearchBasic } from '../../types/device';
import type { Project } from '../../types/project';
import dayjs from 'dayjs';
import { useDeviceStore } from '../../stores/deviceStore';
import { useProjectStore } from '../../stores/projectStore';

interface BasicInfoTabProps {
  initialValues?: DeviceResearchBasic;
  onSave?: (data: DeviceResearchBasic) => void;
  loading?: boolean;
  disabled?: boolean;
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  initialValues,
  onSave,
  loading = false,
  disabled = false,
}) => {
  const [form] = Form.useForm();
  const { deviceTypes } = useDeviceStore();
  const { projects } = useProjectStore();

  // 提取设备类型名称列表
  const deviceTypeOptions = deviceTypes.map(type => ({
    value: type.name,
    label: type.name,
  }));

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        deviceCode: initialValues.deviceCode,
        projectName: initialValues.projectName,
        deviceName: initialValues.deviceName,
        deviceType: initialValues.deviceType,
        workshop: initialValues.workshop,
        manufacturer: initialValues.manufacturer,
        productionDate: initialValues.productionDate ? dayjs(initialValues.productionDate) : undefined,
        remarks: initialValues.remarks,
      });
    }
  }, [initialValues, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const data: DeviceResearchBasic = {
        deviceCode: values.deviceCode,
        projectName: values.projectName,
        deviceName: values.deviceName,
        deviceType: values.deviceType,
        workshop: values.workshop,
        manufacturer: values.manufacturer,
        productionDate: values.productionDate ? values.productionDate.format('YYYY-MM-DD') : undefined,
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
        label="设备编号"
        name="deviceCode"
        rules={[
          { required: !disabled, message: '请输入设备编号' },
          { max: 50, message: '设备编号不能超过50个字符' }
        ]}
      >
        <Input placeholder="请输入设备编号" disabled={disabled} />
      </Form.Item>

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
        >
          {projects.map((project: Project) => (
            <Select.Option key={project.id} value={project.name} label={project.name}>
              {project.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="设备名称"
        name="deviceName"
        rules={[
          { required: !disabled, message: '请输入设备名称' },
          { max: 100, message: '设备名称不能超过100个字符' }
        ]}
      >
        <Input placeholder="请输入设备名称" disabled={disabled} />
      </Form.Item>

      <Form.Item
        label="设备类型"
        name="deviceType"
        rules={[
          { required: !disabled, message: '请输入设备类型' },
          { max: 100, message: '设备类型不能超过100个字符' }
        ]}
      >
        <AutoComplete
          options={deviceTypeOptions}
          placeholder="请选择或输入设备类型"
          disabled={disabled}
          filterOption={(inputValue, option) =>
            option?.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
          }
        />
      </Form.Item>

      <Form.Item
        label="所属车间"
        name="workshop"
        rules={[{ max: 100, message: '车间名称不能超过100个字符' }]}
      >
        <Input placeholder="请输入所属车间" disabled={disabled} />
      </Form.Item>

      <Form.Item
        label="设备生产厂商"
        name="manufacturer"
        rules={[{ required: !disabled, message: '请输入设备生产厂商' }]}
      >
        <Input placeholder="请输入设备生产厂商" disabled={disabled} />
      </Form.Item>

      <Form.Item
        label="出厂日期"
        name="productionDate"
      >
        <DatePicker
          style={{ width: '100%' }}
          placeholder="请选择出厂日期"
          disabled={disabled}
        />
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