import React from 'react';
import { Form, Input, Select, Button, Space, DatePicker, Row, Col } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

interface FilterItem {
  name: string;
  label: string;
  type: 'input' | 'select' | 'dateRange';
  placeholder?: string;
  options?: Array<{ label: string; value: string | number }>;
}

interface FilterBarProps {
  initialValues?: Record<string, any>;
  filters: FilterItem[];
  onSearch: (values: any) => void;
  onReset: () => void;
  loading?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onSearch, onReset, loading, initialValues }) => {
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    onSearch(values);
  };

  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  const renderFilter = (filter: FilterItem) => {
    switch (filter.type) {
      case 'input':
        return <Input placeholder={filter.placeholder} allowClear />;
      case 'select':
        return (
          <Select
            placeholder={filter.placeholder}
            allowClear
            options={filter.options}
            style={{ width: '100%' }}
          />
        );
      case 'dateRange':
        return (
          <RangePicker
            style={{ width: '100%' }}
            placeholder={['开始日期', '结束日期']}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Form form={form} onFinish={handleFinish} initialValues={initialValues} style={{ marginBottom: 16 }}>
      <Row gutter={[12, 16]} align="bottom">
        {filters.map((filter) => (
          <Col key={filter.name} flex="auto">
            <Form.Item
              name={filter.name}
              label={filter.label}
              style={{ marginBottom: 0 }}
            >
              {renderFilter(filter)}
            </Form.Item>
          </Col>
        ))}

        <Col flex="0 0 auto" style={{ paddingLeft: 8 }}>
          <Space size="small">
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
              查询
            </Button>
            <Button onClick={handleReset} icon={<ReloadOutlined />}>
              重置
            </Button>
          </Space>
        </Col>
      </Row>
    </Form>
  );
};

export default FilterBar;
