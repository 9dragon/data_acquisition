import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select, Checkbox, Space, message, Row, Col, Card, Tag } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { ProjectPlan, ProjectPlanStage, ProjectStage } from '../../types/project';
import { mockUsers, mockStageDefinitions } from '../../services/mockData';
import { useStageStore } from '../../stores/stageStore';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface PlanFormModalProps {
  visible: boolean;
  plan: ProjectPlan | null;
  projectId: string;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const PlanFormModal: React.FC<PlanFormModalProps> = ({
  visible,
  plan,
  projectId,
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedStages, setSelectedStages] = useState<ProjectStage[]>([]);
  const [planDateRange, setPlanDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const { stageDefinitions, setStageDefinitions, getStageByKey } = useStageStore();

  // 初始化阶段定义数据
  useEffect(() => {
    if (visible && stageDefinitions.length === 0) {
      setStageDefinitions(mockStageDefinitions);
    }
  }, [visible, stageDefinitions, setStageDefinitions]);

  // 重置表单
  useEffect(() => {
    if (visible) {
      if (plan) {
        // 编辑模式
        const stageKeys = plan.stages.map(s => s.stage);
        setSelectedStages(stageKeys);
        setPlanDateRange([
          dayjs(plan.startDate),
          dayjs(plan.endDate)
        ]);
        form.setFieldsValue({
          name: plan.name,
          description: plan.description,
          dateRange: [dayjs(plan.startDate), dayjs(plan.endDate)],
          stages: stageKeys,
          // 动态设置阶段配置
          ...plan.stages.reduce((acc, stage) => {
            return {
              ...acc,
              [`stage_${stage.stage}_dateRange`]: [dayjs(stage.startDate), dayjs(stage.endDate)],
              [`stage_${stage.stage}_managerId`]: stage.managerId,
              [`stage_${stage.stage}_participantIds`]: stage.participantIds,
            };
          }, {}),
        });
      } else {
        // 新建模式
        setSelectedStages([]);
        setPlanDateRange(null);
        form.resetFields();
      }
    }
  }, [visible, plan, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 构建阶段数据
      const stages: ProjectPlanStage[] = selectedStages.map(stageKey => ({
        stage: stageKey,
        startDate: values[`stage_${stageKey}_dateRange`][0].format('YYYY-MM-DD'),
        endDate: values[`stage_${stageKey}_dateRange`][1].format('YYYY-MM-DD'),
        managerId: values[`stage_${stageKey}_managerId`],
        participantIds: values[`stage_${stageKey}_participantIds`] || [],
      }));

      // 构建计划数据
      const planData = {
        projectId,
        name: values.name,
        description: values.description,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        stages,
        tasks: plan?.tasks || [],
      };

      // 提交
      onSubmit(planData);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  // 处理阶段选择变化
  const handleStagesChange = (checkedValues: ProjectStage[]) => {
    setSelectedStages(checkedValues);
  };

  // 验证阶段日期是否在计划日期范围内
  const validateStageDateRange = (_: any, value: [dayjs.Dayjs, dayjs.Dayjs]) => {
    if (!value || !planDateRange) {
      return Promise.resolve();
    }
    const [stageStart, stageEnd] = value;
    const [planStart, planEnd] = planDateRange;

    if (stageStart.isBefore(planStart) || stageEnd.isAfter(planEnd)) {
      return Promise.reject(new Error('阶段日期必须在计划日期范围内'));
    }
    return Promise.resolve();
  };

  // 渲染阶段配置表单项
  const renderStageConfig = (stageKey: ProjectStage) => {
    const stageDef = getStageByKey(stageKey);
    if (!stageDef) return null;

    const existingStage = plan?.stages.find(s => s.stage === stageKey);
    const stageLabel = stageDef.name;

    return (
      <Card
        key={stageKey}
        title={
          <Space>
            <span>{stageLabel}</span>
            <Tag color={stageDef.progressMode === 'by_task' ? 'blue' : 'green'}>
              {stageDef.progressMode === 'by_task' ? '按任务' : '按设备'}
            </Tag>
          </Space>
        }
        size="small"
        style={{ marginBottom: 12 }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name={`stage_${stageKey}_dateRange`}
              label={`${stageLabel}日期`}
              rules={[
                { required: true, message: `请选择${stageLabel}日期` },
                { validator: validateStageDateRange }
              ]}
              initialValue={existingStage ? [
                dayjs(existingStage.startDate),
                dayjs(existingStage.endDate)
              ] : undefined}
            >
              <RangePicker
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
                placeholder={[`${stageLabel}开始日期`, `${stageLabel}结束日期`]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={`stage_${stageKey}_managerId`}
              label={`${stageLabel}负责人`}
              rules={[{ required: true, message: `请选择${stageLabel}负责人` }]}
              initialValue={existingStage?.managerId}
            >
              <Select
                placeholder={`请选择${stageLabel}负责人`}
                options={mockUsers.map(user => ({
                  label: user.name,
                  value: user.id,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name={`stage_${stageKey}_participantIds`}
          label={`${stageLabel}参与人`}
          initialValue={existingStage?.participantIds || []}
        >
          <Select
            mode="multiple"
            placeholder={`请选择${stageLabel}参与人`}
            options={mockUsers.map(user => ({
              label: user.name,
              value: user.id,
            }))}
          />
        </Form.Item>
      </Card>
    );
  };

  return (
    <Modal
      title={plan ? '编辑项目计划' : '创建项目计划'}
      open={visible}
      onCancel={onClose}
      width={700}
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
            {plan ? '保存' : '创建'}
          </button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
      >
        {/* 计划名称 */}
        <Form.Item
          label="计划名称"
          name="name"
          rules={[{ required: true, message: '请输入计划名称' }]}
          initialValue={plan?.name}
        >
          <Input placeholder="请输入计划名称" maxLength={50} showCount />
        </Form.Item>

        {/* 计划描述 */}
        <Form.Item
          label="计划描述"
          name="description"
          initialValue={plan?.description}
        >
          <TextArea
            rows={3}
            placeholder="请描述计划的目标、内容等"
            maxLength={200}
            showCount
          />
        </Form.Item>

        {/* 计划日期范围 */}
        <Form.Item
          label="计划日期"
          name="dateRange"
          rules={[{ required: true, message: '请选择计划日期' }]}
        >
          <RangePicker
            style={{ width: '100%' }}
            format="YYYY-MM-DD"
            placeholder={['计划开始日期', '计划结束日期']}
            onChange={(dates) => setPlanDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
          />
        </Form.Item>

        {/* 包含的阶段 */}
        <Form.Item
          label="包含的阶段"
          name="stages"
          rules={[{ required: true, message: '请至少选择一个阶段' }]}
        >
          <Checkbox.Group
            style={{ width: '100%' }}
            value={selectedStages}
            onChange={handleStagesChange}
          >
            <Row>
              {stageDefinitions.map(stageDef => (
                <Col key={stageDef.key} span={12}>
                  <Space>
                    <Checkbox value={stageDef.key}>{stageDef.name}</Checkbox>
                    <Tag color={stageDef.progressMode === 'by_task' ? 'blue' : 'green'} style={{ fontSize: 11 }}>
                      {stageDef.progressMode === 'by_task' ? '按任务' : '按设备'}
                    </Tag>
                  </Space>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </Form.Item>

        {/* 阶段配置 */}
        {selectedStages.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 12, fontWeight: 500 }}>阶段配置</div>
            {selectedStages.map(stageKey => renderStageConfig(stageKey))}
          </div>
        )}
      </Form>

      {/* 提示信息 */}
      <div style={{ padding: 12, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4, marginTop: 16 }}>
        <div style={{ fontSize: 12, color: '#52c41a', marginBottom: 4 }}>💡 提示</div>
        <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#666' }}>
          <li>项目计划仅针对实施阶段</li>
          <li>阶段日期必须在计划日期范围内</li>
          <li>每个阶段需要设置负责人和参与人</li>
          <li>按任务阶段：所有任务完成后该阶段即完成</li>
          <li>按设备阶段：填报时按每个设备的每个任务进行填报和统计</li>
        </ul>
      </div>
    </Modal>
  );
};

export default PlanFormModal;
