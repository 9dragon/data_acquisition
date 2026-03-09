import React, { useEffect, useState } from 'react';
import { Form, Switch, Select, Input, Space, Tag } from 'antd';
import type { DeviceResearchCollection } from '../../types/device';

interface CollectionInfoTabProps {
  initialValues?: DeviceResearchCollection;
  onSave?: (data: DeviceResearchCollection) => void;
  loading?: boolean;
  disabled?: boolean;
}

const { Option } = Select;
const { TextArea } = Input;

const CollectionInfoTab: React.FC<CollectionInfoTabProps> = ({
  initialValues,
  onSave,
  loading = false,
  disabled = false,
}) => {
  const [form] = Form.useForm();
  const [selectedDataItems, setSelectedDataItems] = React.useState<string[]>([]);
  const [collectProcessParams, setCollectProcessParams] = useState(false);

  // 常见数据项选项
  const commonDataItems = [
    '设备运行状态',
    '设备故障信息',
    '生产数量',
    '温度数据',
    '压力数据',
    '速度/节拍',
    '能耗数据',
    '维护提醒',
    '其他',
  ];

  useEffect(() => {
    if (initialValues) {
      const processParams = initialValues.collectProcessParams || false;
      form.setFieldsValue({
        collectDeviceStatus: initialValues.collectDeviceStatus || false,
        collectProcessParams: processParams,
        collectProduction: initialValues.collectProduction || false,
        collectEnergy: initialValues.collectEnergy || false,
        dataItems: initialValues.dataItems || [],
        dataItemsDetail: initialValues.dataItemsDetail || '',
      });
      setSelectedDataItems(initialValues.dataItems || []);
      setCollectProcessParams(processParams);
    }
  }, [initialValues, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // 只有当采集工艺参数为"是"时，才保存数据项相关字段
      const shouldSaveDataItems = values.collectProcessParams === true;

      const data: DeviceResearchCollection = {
        collectDeviceStatus: values.collectDeviceStatus || false,
        collectProcessParams: values.collectProcessParams || false,
        collectProduction: values.collectProduction || false,
        collectEnergy: values.collectEnergy || false,
        dataItems: shouldSaveDataItems ? selectedDataItems : undefined,
        dataItemsDetail: shouldSaveDataItems ? values.dataItemsDetail : undefined,
      };
      onSave?.(data);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleDataItemsChange = (values: string[]) => {
    setSelectedDataItems(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      autoComplete="off"
    >
      <Form.Item
        label="采集设备状态"
        name="collectDeviceStatus"
        valuePropName="checked"
      >
        <Switch checkedChildren="是" unCheckedChildren="否" />
      </Form.Item>

      <Form.Item
        label="采集工艺参数"
        name="collectProcessParams"
        valuePropName="checked"
      >
        <Switch
          checkedChildren="是"
          unCheckedChildren="否"
          onChange={(checked) => setCollectProcessParams(checked)}
          disabled={disabled}
        />
      </Form.Item>

      {/* 条件显示：只有当采集工艺参数为"是"时才显示数据项相关字段 */}
      {collectProcessParams && (
        <>
          <Form.Item
            label="需采集数据项"
            name="dataItems"
            rules={[{ required: true, message: '请选择需要采集的数据项' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择需要采集的数据项"
              style={{ width: '100%' }}
              onChange={handleDataItemsChange}
              value={selectedDataItems}
              disabled={disabled}
            >
              {commonDataItems.map(item => (
                <Option key={item} value={item}>{item}</Option>
              ))}
            </Select>
          </Form.Item>

          {selectedDataItems.length > 0 && (
            <Form.Item
              label="已选数据项"
            >
              <Space wrap>
                {selectedDataItems.map(item => (
                  <Tag key={item} color="blue">{item}</Tag>
                ))}
              </Space>
            </Form.Item>
          )}

          <Form.Item
            label="数据项明细说明"
            name="dataItemsDetail"
            rules={[{ required: true, message: '请填写数据项明细说明' }]}
          >
            <TextArea
              rows={6}
              placeholder="请详细说明需要采集的数据项，包括点位地址、数据类型、采集频率等具体要求"
              maxLength={1000}
              showCount
              disabled={disabled}
            />
          </Form.Item>
        </>
      )}

      <Form.Item
        label="采集产量/节拍"
        name="collectProduction"
        valuePropName="checked"
      >
        <Switch checkedChildren="是" unCheckedChildren="否" />
      </Form.Item>

      <Form.Item
        label="采集能耗"
        name="collectEnergy"
        valuePropName="checked"
      >
        <Switch checkedChildren="是" unCheckedChildren="否" disabled={disabled} />
      </Form.Item>

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
            {loading ? '保存中...' : '保存采集信息'}
          </button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default CollectionInfoTab;