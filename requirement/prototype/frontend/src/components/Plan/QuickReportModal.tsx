import React, { useState, useEffect } from 'react';
import { Modal, Radio, InputNumber, Input, message, Space, Progress, Tag } from 'antd';
import { CheckOutlined } from '@ant-design/icons';

const { TextArea } = Input;

// 实施阶段定义
const IMPLEMENTATION_STAGES = [
  { key: 'planning', label: '准备阶段', description: '人员配置、设备采购、工具准备、技术方案确认' },
  { key: 'construction', label: '施工阶段', description: '设备安装、网络布线、硬件调试、现场测试' },
  { key: 'configuration', label: '配置阶段', description: '点位配置、协议配置、状态逻辑配置、采集测试' },
  { key: 'verification', label: '核对阶段', description: '数据核对、准确性验证、完整性检查、问题修复' },
];

interface QuickReportModalProps {
  visible: boolean;
  device: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const QuickReportModal: React.FC<QuickReportModalProps> = ({
  visible,
  device,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState({
    stage: 'planning',
    progress: 0,
    stageRemark: '',
    overallRemark: '',
  });
  const [loading, setLoading] = useState(false);

  // 重置表单
  useEffect(() => {
    if (visible && device) {
      setForm({
        stage: 'planning',
        progress: 0,
        stageRemark: '',
        overallRemark: '',
      });
    }
  }, [visible, device]);

  const handleSubmit = () => {
    // 验证
    if (!form.stageRemark.trim()) {
      message.warning('请填写阶段说明');
      return;
    }
    if (!form.overallRemark.trim()) {
      message.warning('请填写总体说明');
      return;
    }

    setLoading(true);

    // 模拟提交
    setTimeout(() => {
      setLoading(false);
      message.success('进度填报成功！已直接生效。');
      onSubmit({
        deviceId: device.id,
        ...form,
      });
      onClose();
    }, 500);
  };

  const currentStage = IMPLEMENTATION_STAGES.find(s => s.key === form.stage);

  return (
    <Modal
      title={`快速填报 - ${device?.name || ''}`}
      open={visible}
      onCancel={onClose}
      width={600}
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
            提交
          </button>
        </Space>
      }
    >
      {!device ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>设备信息加载中...</div>
      ) : (
        <div>
          {/* 设备信息 */}
          <div style={{ marginBottom: 16, padding: 12, background: '#f0f2f5', borderRadius: 4 }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>设备信息</div>
            <div style={{ fontWeight: 500 }}>{device.name}</div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              {device.code} · {device.location || '未设置位置'}
            </div>
          </div>

          {/* 选择填报阶段 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>
              选择填报阶段<span style={{ color: 'red' }}>*</span>
            </div>
            <Radio.Group
              value={form.stage}
              onChange={(e) => setForm({ ...form, stage: e.target.value })}
              style={{ width: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {IMPLEMENTATION_STAGES.map((stage) => {
                  // 模拟获取该阶段的当前进度
                  const mockProgress: Record<string, number> = {
                    preparation: 100,
                    construction: 60,
                    configuration: 0,
                    verification: 0,
                  };
                  const currentProgress = mockProgress[stage.key] || 0;

                  return (
                    <Radio
                      key={stage.key}
                      value={stage.key}
                      style={{ display: 'flex', alignItems: 'flex-start', padding: '8px', margin: 0 }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontWeight: 500 }}>{stage.label}</span>
                          <Tag color={currentProgress === 100 ? 'success' : 'processing'} size="small">
                            {currentProgress}%
                          </Tag>
                        </div>
                        <div style={{ fontSize: 12, color: '#999' }}>{stage.description}</div>
                      </div>
                    </Radio>
                  );
                })}
              </Space>
            </Radio.Group>
          </div>

          {/* 新进度 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>
              新进度<span style={{ color: 'red' }}>*</span>
            </div>
            <Space.Compact style={{ width: '100%' }}>
              <InputNumber
                key="input"
                min={0}
                max={100}
                value={form.progress}
                onChange={(value) => setForm({ ...form, progress: value || 0 })}
                placeholder="0-100"
                style={{ width: 120 }}
                suffix="%"
              />
              <Progress
                key="progress"
                percent={form.progress}
                style={{ flex: 1 }}
                showInfo={false}
                status={form.progress === 100 ? 'success' : undefined}
              />
              <span key="percent" style={{ width: 50, textAlign: 'right', color: '#666' }}>
                {form.progress}%
              </span>
            </Space.Compact>
          </div>

          {/* 阶段说明 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>
              {currentStage?.label}说明<span style={{ color: 'red' }}>*</span>
            </div>
            <TextArea
              rows={3}
              placeholder={`请描述${currentStage?.label}的完成情况、存在问题、需要协调的资源等`}
              value={form.stageRemark}
              onChange={(e) => setForm({ ...form, stageRemark: e.target.value })}
              maxLength={200}
              showCount
            />
          </div>

          {/* 总体说明 */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>
              总体说明<span style={{ color: 'red' }}>*</span>
            </div>
            <TextArea
              rows={3}
              placeholder="请填写总体进度说明、设备运行情况、下阶段计划等"
              value={form.overallRemark}
              onChange={(e) => setForm({ ...form, overallRemark: e.target.value })}
              maxLength={200}
              showCount
            />
          </div>

          {/* 填报说明 */}
          <div style={{ padding: 12, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
            <div style={{ fontSize: 12, color: '#52c41a', marginBottom: 4 }}>💡 填报说明</div>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#666' }}>
              <li>填报后直接生效，无需审核</li>
              <li>建议每次只填报当前正在进行的阶段</li>
              <li>进度数据将实时更新到项目计划中</li>
            </ul>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default QuickReportModal;
