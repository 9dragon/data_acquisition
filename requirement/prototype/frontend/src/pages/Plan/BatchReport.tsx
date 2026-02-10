import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Checkbox,
  Button,
  Progress,
  InputNumber,
  Space,
  message,
  Descriptions,
  Divider,
  Alert,
  Tag
} from 'antd';
import {
  SaveOutlined,
  ArrowLeftOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import PageHeader from '../../components/Common/PageHeader';
import { getProjectById, mockDevices } from '../../services/mockData';

// 实施阶段定义
const IMPLEMENTATION_STAGES: Record<string, { label: string; color: string }> = {
  preparation: { label: '准备阶段', color: 'blue' },
  construction: { label: '施工阶段', color: 'processing' },
  configuration: { label: '配置阶段', color: 'orange' },
  verification: { label: '核对阶段', color: 'purple' },
};

const BatchReport: React.FC = () => {
  const { projectId, stage } = useParams<{ projectId: string; stage: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
  const [unifiedProgress, setUnifiedProgress] = useState<number | null>(null);
  const [stageRemark, setStageRemark] = useState('');
  const [overallRemark, setOverallRemark] = useState('');

  // 获取项目信息
  const project = useMemo(() => {
    if (!projectId) return null;
    return getProjectById(projectId);
  }, [projectId]);

  // 获取项目下所有设备
  const devices = useMemo(() => {
    if (!projectId) return [];
    return mockDevices.filter(d => d.projectId === projectId);
  }, [projectId]);

  // 当前填报阶段信息
  const currentStage = stage ? IMPLEMENTATION_STAGES[stage] : null;

  // 获取设备在当前阶段的模拟进度
  const getDeviceStageProgress = (deviceId: string) => {
    // 模拟数据：实际应从设备进度数据中获取
    const mockProgress: Record<string, number> = {
      '1': 45,
      '2': 60,
      '3': 0,
      '4': 80,
      '5': 30,
      '6': 0,
      '7': 0,
      '8': 0,
    };
    return mockProgress[deviceId] || 0;
  };

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDeviceIds(devices.map(d => d.id));
    } else {
      setSelectedDeviceIds([]);
    }
  };

  // 单个设备选择
  const handleSelectDevice = (deviceId: string, checked: boolean) => {
    if (checked) {
      setSelectedDeviceIds([...selectedDeviceIds, deviceId]);
    } else {
      setSelectedDeviceIds(selectedDeviceIds.filter(id => id !== deviceId));
    }
  };

  // 提交批量填报
  const handleSubmit = () => {
    // 验证
    if (selectedDeviceIds.length === 0) {
      message.warning('请至少选择一台设备');
      return;
    }
    if (unifiedProgress === null || unifiedProgress === undefined) {
      message.warning('请设置统一进度');
      return;
    }
    if (!stageRemark.trim()) {
      message.warning('请填写批量填报说明');
      return;
    }
    if (!overallRemark.trim()) {
      message.warning('请填写总体说明');
      return;
    }

    setLoading(true);

    // 模拟提交
    setTimeout(() => {
      setLoading(false);
      message.success(
        `成功填报 ${selectedDeviceIds.length} 台设备的${currentStage?.label}进度！已直接生效。`
      );
      navigate(-1);
    }, 1000);
  };

  if (!project || !currentStage) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <h2>参数错误</h2>
          <p style={{ color: '#666' }}>项目或阶段参数不正确</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <PageHeader
        title={`批量填报 - ${currentStage.label}`}
        breadcrumbs={[
          { label: '计划管理', path: '/plan' },
          { label: project.name, path: `/plan/${project.id}` },
          { label: '批量填报' },
        ]}
        showBack
      />

      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Alert
          message="批量填报说明"
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>批量填报适用于统一更新多台设备在同一阶段的进度</li>
              <li>填报后直接生效，无需审核</li>
              <li>建议在阶段性节点（如"施工阶段全部完成"）时使用</li>
            </ul>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Card title="项目信息" style={{ marginBottom: 16 }}>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="项目名称">
              {project.name}
            </Descriptions.Item>
            <Descriptions.Item label="项目编号">
              {project.code}
            </Descriptions.Item>
            <Descriptions.Item label="填报阶段">
              <Tag color={currentStage.color}>{currentStage.label}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="设备总数">
              {devices.length} 台
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="选择设备" style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 16 }}>
            <Checkbox
              checked={selectedDeviceIds.length === devices.length && devices.length > 0}
              indeterminate={
                selectedDeviceIds.length > 0 && selectedDeviceIds.length < devices.length
              }
              onChange={(e) => handleSelectAll(e.target.checked)}
            >
              <span style={{ fontWeight: 500 }}>
                全选 ({selectedDeviceIds.length}/{devices.length})
              </span>
            </Checkbox>
          </div>

          <div style={{ maxHeight: 400, overflowY: 'auto', border: '1px solid #f0f0f0', borderRadius: 4, padding: 16 }}>
            {devices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                该项目暂无设备
              </div>
            ) : (
              devices.map((device) => {
                const currentProgress = getDeviceStageProgress(device.id);
                const isSelected = selectedDeviceIds.includes(device.id);

                return (
                  <div
                    key={device.id}
                    style={{
                      marginBottom: 12,
                      padding: 12,
                      background: isSelected ? '#e6f7ff' : '#fafafa',
                      borderRadius: 4,
                      border: isSelected ? '1px solid #91d5ff' : '1px solid #f0f0f0',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleSelectDevice(device.id, !isSelected)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectDevice(device.id, e.target.checked);
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontWeight: 500 }}>{device.name}</span>
                          <Tag color={currentProgress === 100 ? 'success' : 'processing'}>
                            {currentProgress}%
                          </Tag>
                        </div>
                        <Progress
                          percent={currentProgress}
                          size="small"
                          showInfo={false}
                        />
                        <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                          {device.code} · {device.location || '未设置位置'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card title="统一设置">
          <div style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>
              所有设备进度统一设置为：
            </div>
            <InputNumber
              min={0}
              max={100}
      value={unifiedProgress}
              onChange={(value) => setUnifiedProgress(value === null ? undefined : value)}
              placeholder="请输入进度百分比"
              style={{ width: 200 }}
              suffix="%"
            />
            {unifiedProgress !== null && unifiedProgress !== undefined && (
              <Progress
                percent={unifiedProgress}
                style={{ width: 300, marginLeft: 16, display: 'inline-block' }}
                status={unifiedProgress === 100 ? 'success' : undefined}
              />
            )}
          </div>

          <Divider />

          <div style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>
              批量填报说明<span style={{ color: 'red' }}>*</span>
            </div>
            <Input.TextArea
              rows={4}
              placeholder={`请说明为什么这批设备统一设置为 ${unifiedProgress || ''}%，例如：施工阶段已全部完成，设备安装调试正常，网络布线完成，可以进入配置阶段`}
              value={stageRemark}
              onChange={(e) => setStageRemark(e.target.value)}
              maxLength={500}
              showCount
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>
              总体说明<span style={{ color: 'red' }}>*</span>
            </div>
            <Input.TextArea
              rows={4}
              placeholder="请填写总体进度说明、项目整体情况、存在的风险和问题、需要协调的资源等"
              value={overallRemark}
              onChange={(e) => setOverallRemark(e.target.value)}
              maxLength={500}
              showCount
            />
          </div>

          <Divider />

          <div style={{ textAlign: 'center' }}>
            <Space size="large">
              <Button size="large" onClick={() => navigate(-1)}>
                取消
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<CheckOutlined />}
                loading={loading}
                onClick={handleSubmit}
              >
                提交批量进度 ({selectedDeviceIds.length}台设备)
              </Button>
            </Space>
          </div>
        </Card>
      </div>
    </Card>
  );
};

export default BatchReport;
