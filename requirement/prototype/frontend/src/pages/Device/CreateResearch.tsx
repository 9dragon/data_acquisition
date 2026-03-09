import React, { useState } from 'react';
import { Card, Form, Input, Button, Steps, message, Space, Select } from 'antd';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/Common/PageHeader';
import { useDeviceStore } from '../../stores/deviceStore';
import { useProjectStore } from '../../stores/projectStore';
import BasicInfoTab from '../../components/Device/BasicInfoTab';
import ControllerInfoTab from '../../components/Device/ControllerInfoTab';
import CollectionInfoTab from '../../components/Device/CollectionInfoTab';

const { Step } = Steps;

interface DeviceFormData {
  deviceCode: string;
  deviceName: string;
  workshop?: string;
  projectName?: string;
}

const CreateResearch: React.FC = () => {
  const navigate = useNavigate();
  const { createResearchFromScratch, currentResearch, updateResearchBasic,
          updateResearchController, updateResearchCollection,
          updateResearchSectionStatus } = useDeviceStore();
  const { projects } = useProjectStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [researchId, setResearchId] = useState<string>();
  const [deviceFormData, setDeviceFormData] = useState<DeviceFormData>();

  // 处理设备信息表单提交
  const handleDeviceFormSubmit = (values: DeviceFormData) => {
    const research = createResearchFromScratch({
      ...values,
      deviceType: '', // 初始为空，在基础信息中填写
    });
    setResearchId(research.id);
    setDeviceFormData(values);
    setCurrentStep(1);
    message.success('调研记录创建成功，请继续填写调研信息');
  };

  // 处理基础信息保存
  const handleBasicSave = (data: any) => {
    if (researchId) {
      updateResearchBasic(researchId, data);
      updateResearchSectionStatus(researchId, 'basic', true);
      message.success('基础信息已保存');
    }
  };

  // 处理控制器信息保存
  const handleControllerSave = (data: any) => {
    if (researchId) {
      updateResearchController(researchId, data);
      updateResearchSectionStatus(researchId, 'controller', true);
      message.success('控制器信息已保存');
    }
  };

  // 处理采集信息保存
  const handleCollectionSave = (data: any) => {
    if (researchId) {
      updateResearchCollection(researchId, data);
      updateResearchSectionStatus(researchId, 'collection', true);
      message.success('采集信息已保存');
    }
  };

  const steps = [
    {
      title: '设备信息',
      content: (
        <Card>
          <div style={{ marginBottom: 16 }}>
            <h3>填写设备基本信息</h3>
            <p style={{ color: '#666' }}>请填写设备的基本信息，这些信息将用于创建调研记录</p>
          </div>
          <Form
            layout="vertical"
            onFinish={handleDeviceFormSubmit}
          >
            <Form.Item
              label="设备编号"
              name="deviceCode"
              rules={[{ required: true, message: '请输入设备编号' }]}
            >
              <Input placeholder="请输入设备编号" />
            </Form.Item>

            <Form.Item
              label="设备名称"
              name="deviceName"
              rules={[{ required: true, message: '请输入设备名称' }]}
            >
              <Input placeholder="请输入设备名称" />
            </Form.Item>

            <Form.Item
              label="所属车间"
              name="workshop"
            >
              <Input placeholder="请输入所属车间（可选）" />
            </Form.Item>

            <Form.Item
              label="项目名称"
              name="projectName"
            >
              <Select
                placeholder="请选择项目名称（可选）"
                allowClear
                showSearch
                optionFilterProp="label"
              >
                {projects.map(project => (
                  <Select.Option key={project.id} value={project.name} label={project.name}>
                    {project.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                下一步：填写调研信息
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      title: '基础信息',
      content: (
        <Card>
          <BasicInfoTab
            initialValues={currentResearch?.basic}
            onSave={handleBasicSave}
          />
        </Card>
      ),
    },
    {
      title: '控制器信息',
      content: (
        <Card>
          <ControllerInfoTab
            initialValues={currentResearch?.controller}
            onSave={handleControllerSave}
          />
        </Card>
      ),
    },
    {
      title: '采集信息',
      content: (
        <Card>
          <CollectionInfoTab
            initialValues={currentResearch?.collection}
            onSave={handleCollectionSave}
          />
        </Card>
      ),
    },
  ];

  return (
    <Card>
      <PageHeader
        title="从零创建调研"
        extra={
          <Space>
            <Button onClick={() => navigate('/device/research-list')}>
              返回列表
            </Button>
          </Space>
        }
      />

      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        {steps.map((step, index) => (
          <Step key={index} title={step.title} />
        ))}
      </Steps>

      <div>{steps[currentStep].content}</div>

      {currentStep > 0 && (
        <div style={{ marginTop: 16 }}>
          <Button onClick={() => setCurrentStep(currentStep - 1)}>
            上一步
          </Button>
          {currentStep < steps.length - 1 && (
            <Button
              type="primary"
              onClick={() => setCurrentStep(currentStep + 1)}
              style={{ marginLeft: 8 }}
            >
              下一步
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button
              type="primary"
              onClick={() => navigate('/device/research-list')}
              style={{ marginLeft: 8 }}
            >
              完成
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

export default CreateResearch;
