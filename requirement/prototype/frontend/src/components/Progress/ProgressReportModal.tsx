import React, { useState, useEffect } from 'react';
import { Modal, Space, Typography, Progress, Input, message, Spin, Empty, Divider, Alert } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { Project, ProjectStageConfig, StageDefinition } from '../../types/project';
import { useProjectStore, ProgressReportData } from '../../stores/projectStore';
import { useStageStore } from '../../stores/stageStore';
import { calculateOverallProgress } from '../../utils/progressCalculators';
import StageProgressCard from './StageProgressCard';

const { TextArea } = Input;
const { Text, Title } = Typography;

interface ProgressReportModalProps {
  visible: boolean;
  project: Project | null;
  onClose: () => void;
  onSubmit?: (data: ProgressReportData) => void;
}

const ProgressReportModal: React.FC<ProgressReportModalProps> = ({
  visible,
  project,
  onClose,
  onSubmit,
}) => {
  const { updateProjectProgress } = useProjectStore();
  const { stageDefinitions } = useStageStore();
  const [loading, setLoading] = useState(false);
  const [stageConfigs, setStageConfigs] = useState<ProjectStageConfig[]>([]);
  const [overallRemark, setOverallRemark] = useState('');

  // 初始化阶段配置数据
  useEffect(() => {
    if (visible && project) {
      // 深拷贝项目的阶段配置，避免直接修改原数据
      const initialStageConfigs = project.stageConfigs.map(config => ({
        ...config,
        taskProgress: config.taskProgress ? [...config.taskProgress] : [],
        deviceProgress: config.deviceProgress ? [...config.deviceProgress] : [],
      }));
      setStageConfigs(initialStageConfigs);
      setOverallRemark('');
    }
  }, [visible, project]);

  if (!project) {
    return null;
  }

  // 计算总体进度
  const overallProgress = calculateOverallProgress(stageConfigs);

  // 获取阶段定义
  const getStageDefinition = (stageKey: string): StageDefinition | undefined => {
    return stageDefinitions.find(def => def.key === stageKey);
  };

  // 处理阶段配置更新
  const handleStageConfigChange = (index: number, updatedConfig: ProjectStageConfig) => {
    const newStageConfigs = [...stageConfigs];
    newStageConfigs[index] = updatedConfig;
    setStageConfigs(newStageConfigs);
  };

  // 处理提交
  const handleSubmit = () => {
    // 验证：至少有一个阶段有进度数据
    const hasProgressData = stageConfigs.some(config =>
      (config.taskProgress && config.taskProgress.length > 0) ||
      (config.deviceProgress && config.deviceProgress.length > 0)
    );

    if (!hasProgressData) {
      message.warning('请至少填报一个阶段的进度');
      return;
    }

    setLoading(true);

    // 准备提交数据
    const submitData: ProgressReportData = {
      stageConfigs: stageConfigs.map(config => ({
        ...config,
        actualProgress: config.actualProgress || 0,
      })),
      overallRemark: overallRemark.trim(),
    };

    // 调用 store 更新进度
    updateProjectProgress(project.id, submitData);

    // 如果有外部回调，也调用它
    if (onSubmit) {
      onSubmit(submitData);
    }

    // 模拟提交延迟
    setTimeout(() => {
      setLoading(false);
      message.success('进度填报成功！总体进度已自动更新。');
      onClose();
    }, 500);
  };

  // 获取按状态分组的阶段
  const getGroupedStages = () => {
    return {
      inProgress: stageConfigs.filter(config => config.status === 'in_progress'),
      completed: stageConfigs.filter(config => config.status === 'completed'),
      notStarted: stageConfigs.filter(config => config.status === 'not_started'),
    };
  };

  const groupedStages = getGroupedStages();

  return (
    <Modal
      title={<Title level={4} style={{ margin: 0 }}>填报项目进度 - {project.name}</Title>}
      open={visible}
      onCancel={onClose}
      width={900}
      styles={{ body: { padding: '24px' } }}
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
            type="button"
            className="ant-btn ant-btn-primary"
            onClick={handleSubmit}
            style={{ padding: '6.4px 20px', fontSize: 14 }}
          >
            提交
          </button>
        </Space>
      }
    >
      {stageConfigs.length === 0 ? (
        <Empty description="该项目未配置阶段" />
      ) : (
        <div>
          {/* 项目总体进度（只读，自动计算） */}
          <Alert
            message={
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text strong>项目总体进度（自动计算）</Text>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: overallProgress === 100 ? '#52c41a' : '#1890ff' }}>
                    {overallProgress}%
                  </Text>
                </div>
                <Progress
                  percent={overallProgress}
                  status={overallProgress === 100 ? 'success' : undefined}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
              </div>
            }
            type="info"
            showIcon={false}
            style={{ marginBottom: 16 }}
          />

          <Divider style={{ margin: '16px 0' }}>阶段进度填报</Divider>

          {/* 进行中的阶段 */}
          {groupedStages.inProgress.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 12 }}>
                <Text strong style={{ color: '#1890ff' }}>
                  进行中的阶段 ({groupedStages.inProgress.length})
                </Text>
              </div>
              {groupedStages.inProgress.map((config, index) => {
                const stageDef = getStageDefinition(config.stageKey);
                if (!stageDef) return null;

                // 找到原始索引
                const originalIndex = stageConfigs.findIndex(c => c.stageKey === config.stageKey);

                return (
                  <StageProgressCard
                    key={config.stageKey}
                    stageConfig={config}
                    stageDefinition={stageDef}
                    projectDeviceCount={project.deviceCount}
                    onChange={(updatedConfig) => handleStageConfigChange(originalIndex, updatedConfig)}
                  />
                );
              })}
            </div>
          )}

          {/* 未开始的阶段 */}
          {groupedStages.notStarted.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 12 }}>
                <Text strong style={{ color: '#999' }}>
                  未开始的阶段 ({groupedStages.notStarted.length})
                </Text>
              </div>
              {groupedStages.notStarted.map((config, index) => {
                const stageDef = getStageDefinition(config.stageKey);
                if (!stageDef) return null;

                const originalIndex = stageConfigs.findIndex(c => c.stageKey === config.stageKey);

                return (
                  <StageProgressCard
                    key={config.stageKey}
                    stageConfig={config}
                    stageDefinition={stageDef}
                    projectDeviceCount={project.deviceCount}
                    onChange={(updatedConfig) => handleStageConfigChange(originalIndex, updatedConfig)}
                  />
                );
              })}
            </div>
          )}

          {/* 已完成的阶段 */}
          {groupedStages.completed.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 12 }}>
                <Text strong style={{ color: '#52c41a' }}>
                  已完成的阶段 ({groupedStages.completed.length})
                </Text>
              </div>
              {groupedStages.completed.map((config, index) => {
                const stageDef = getStageDefinition(config.stageKey);
                if (!stageDef) return null;

                const originalIndex = stageConfigs.findIndex(c => c.stageKey === config.stageKey);

                return (
                  <StageProgressCard
                    key={config.stageKey}
                    stageConfig={config}
                    stageDefinition={stageDef}
                    projectDeviceCount={project.deviceCount}
                    onChange={(updatedConfig) => handleStageConfigChange(originalIndex, updatedConfig)}
                  />
                );
              })}
            </div>
          )}

          <Divider style={{ margin: '16px 0' }} />

          {/* 总体说明 */}
          <div>
            <div style={{ marginBottom: 8 }}>
              <Text strong>总体说明</Text>
              <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                （选填）
              </Text>
            </div>
            <TextArea
              placeholder="请填写总体进度说明、项目推进情况、存在问题、下阶段计划等"
              value={overallRemark}
              onChange={(e) => setOverallRemark(e.target.value)}
              rows={3}
              maxLength={500}
              showCount
            />
          </div>

          {/* 填报说明 */}
          <Alert
            message={
              <div style={{ fontSize: 12 }}>
                <div style={{ marginBottom: 4, fontWeight: 'bold', color: '#52c41a' }}>💡 填报说明</div>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  <li>总体进度将根据各阶段完成情况和权重自动计算，无需手动填写</li>
                  <li>各阶段可并行推进，支持同时填报多个阶段的进度</li>
                  <li>按任务推进的阶段：勾选任务完成情况，系统自动计算阶段进度</li>
                  <li>按设备推进的阶段：标记设备完成状态，系统自动计算阶段进度</li>
                  <li>填报后直接生效，无需审核</li>
                </ul>
              </div>
            }
            type="success"
            showIcon={false}
            style={{ marginTop: 16, background: '#f6ffed', borderColor: '#b7eb8f' }}
          />
        </div>
      )}
    </Modal>
  );
};

export default ProgressReportModal;
