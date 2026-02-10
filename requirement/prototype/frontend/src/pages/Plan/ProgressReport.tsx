import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Input, InputNumber, Button, Progress, Space, message, Descriptions, Radio, Divider, Tag } from 'antd';
import { SaveOutlined, ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import PageHeader from '../../components/Common/PageHeader';
import { getDeviceById, mockProjects } from '../../services/mockData';

const { TextArea } = Input;

// 实施阶段定义（根据需求文档）
const IMPLEMENTATION_STAGES = [
  { key: 'preparation', label: '准备阶段', description: '人员配置、设备采购、工具准备、技术方案确认' },
  { key: 'construction', label: '施工阶段', description: '设备安装、网络布线、硬件调试、现场测试' },
  { key: 'configuration', label: '配置阶段', description: '点位配置、协议配置、状态逻辑配置、采集测试' },
  { key: 'verification', label: '核对阶段', description: '数据核对、准确性验证、完整性检查、问题修复' },
];

const ProgressReport: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string>('preparation');

  const device = getDeviceById(deviceId || '');
  const project = device ? mockProjects.find(p => p.id === device.projectId) : null;

  // 模拟设备各阶段进度数据
  const getStageProgress = (stageKey: string) => {
    // 这里应该从设备数据中获取，暂时返回模拟数据
    const progressData: Record<string, number> = {
      preparation: 100,
      construction: 60,
      configuration: 0,
      verification: 0,
    };
    return progressData[stageKey] || 0;
  };

  useEffect(() => {
    if (device) {
      // 初始化表单数据
      const initialValues: any = {};
      IMPLEMENTATION_STAGES.forEach(stage => {
        initialValues[stage.key] = {
          progress: getStageProgress(stage.key),
          remark: '',
        };
      });
      form.setFieldsValue(initialValues);
    }
  }, [device, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    // 模拟提交
    setTimeout(() => {
      setLoading(false);
      message.success('进度填报成功！已直接生效，无需审核。');
      // 可以在这里更新 store 中的设备进度
      navigate(-1);
    }, 1000);
  };

  if (!device || !project) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <h2>设备不存在</h2>
          <p style={{ color: '#666' }}>请检查设备ID是否正确</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <PageHeader
        title="进度填报"
        breadcrumbs={[
          { label: '计划管理', path: '/plan' },
          { label: project.name, path: `/plan/${project.id}` },
          { label: '进度填报' },
        ]}
        showBack
      />

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <Card title="设备信息" style={{ marginBottom: 16 }}>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="设备名称">
              {device.name}
            </Descriptions.Item>
            <Descriptions.Item label="设备编号">
              {device.code}
            </Descriptions.Item>
            <Descriptions.Item label="所属项目">
              {project.name}
            </Descriptions.Item>
            <Descriptions.Item label="当前位置">
              {device.location || '未设置'}
            </Descriptions.Item>
            <Descriptions.Item label="采集协议">
              {device.collectionMethod || '未设置'}
            </Descriptions.Item>
            <Descriptions.Item label="负责人">
              {device.responsiblePerson || '未分配'}
            </Descriptions.Item>
            <Descriptions.Item label="点位进度" span={2}>
              <Progress
                percent={device.pointCount > 0 ? Math.round((device.collectedPointCount / device.pointCount) * 100) : 0}
                format={(percent) => `${device.collectedPointCount}/${device.pointCount} (${percent}%)`}
              />
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card
          title={
            <Space>
              <EditOutlined key="icon" />
              <span key="text">实施阶段进度填报</span>
            </Space>
          }
          extra={
            <div style={{ color: '#666', fontSize: 14 }}>
              填报后直接生效，无需审核
            </div>
          }
        >
          <div style={{ marginBottom: 16, padding: 12, background: '#f0f2f5', borderRadius: 4 }}>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>填报说明：</div>
            <ul style={{ margin: 0, paddingLeft: 20, color: '#666', fontSize: 13 }}>
              <li>填报粒度：按设备在各实施阶段（准备/施工/配置/核对）的进度</li>
              <li>进度范围：0-100%，填写各阶段的完成百分比</li>
              <li>生效机制：填报后立即更新进度，无需审核</li>
              <li>建议：每次只填报当前正在进行的阶段进度</li>
            </ul>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            {IMPLEMENTATION_STAGES.map((stage, index) => {
              const stageProgress = getStageProgress(stage.key);
              return (
                <Card
                  key={stage.key}
                  type="inner"
                  title={
                    <Space>
                      <span key="label">{stage.label}</span>
                      {stageProgress > 0 && (
                        <Tag key="tag" color={stageProgress === 100 ? 'success' : 'processing'}>
                          {stageProgress}%
                        </Tag>
                      )}
                    </Space>
                  }
                  style={{ marginBottom: 16 }}
                  headStyle={{ background: stageProgress === 100 ? '#f6ffed' : '#fafafa' }}
                >
                  <div style={{ marginBottom: 12, color: '#666', fontSize: 13 }}>
                    阶段内容：{stage.description}
                  </div>

                  <Form.Item
                    name={[stage.key, 'progress']}
                    label={`${stage.label}完成进度`}
                    rules={[{ required: true, message: `请输入${stage.label}的完成进度` }]}
                  >
                    <Space.Compact style={{ width: '100%' }}>
                      <InputNumber
                        min={0}
                        max={100}
                        style={{ width: 120 }}
                        placeholder="0-100"
                        suffix="%"
                      />
                      <Progress
                        percent={form.getFieldValue([stage.key, 'progress']) || 0}
                        style={{ flex: 1, marginRight: 120 }}
                        showInfo={false}
                      />
                      <span style={{ position: 'absolute', right: 0, top: 5, color: '#666' }}>
                        {form.getFieldValue([stage.key, 'progress']) || 0}%
                      </span>
                    </Space.Compact>
                  </Form.Item>

                  <Form.Item
                    name={[stage.key, 'remark']}
                    label={`${stage.label}完成情况说明`}
                    style={{ marginBottom: 0 }}
                  >
                    <TextArea
                      rows={2}
                      placeholder={`请输入${stage.label}的完成情况、存在的问题、需要协调的资源等`}
                    />
                  </Form.Item>
                </Card>
              );
            })}

            <Divider />

            <Form.Item
              name="overallRemark"
              label="总体说明"
              style={{ marginBottom: 16 }}
            >
              <TextArea
                rows={4}
                placeholder="请输入总体进度说明、项目整体情况、存在的风险和问题、需要协调的资源等"
              />
            </Form.Item>

            <Form.Item
              name="nextPlan"
              label="下阶段计划"
              style={{ marginBottom: 24 }}
            >
              <TextArea
                rows={3}
                placeholder="请输入下阶段的工作计划、时间节点、资源需求等"
              />
            </Form.Item>

            <Form.Item>
              <Space size="large">
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading} size="large">
                  提交进度
                </Button>
                <Button onClick={() => navigate(-1)} size="large">
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </Card>
  );
};

export default ProgressReport;
