import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Drawer, Tabs, Progress, Card, Space, message, Button, Descriptions, Empty } from 'antd';
import { SaveOutlined, CheckCircleOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import { useDeviceStore } from '../../stores/deviceStore';
import { getDeviceById } from '../../services/mockData';
import BasicInfoTab from '../../components/Device/BasicInfoTab';
import ControllerInfoTab from '../../components/Device/ControllerInfoTab';
import CollectionInfoTab from '../../components/Device/CollectionInfoTab';
import type { Device } from '../../types/device';
import type { ResearchSection, DeviceResearchBasic, DeviceResearchController, DeviceResearchCollection } from '../../types/device';

const DeviceResearch: React.FC = () => {
  const { deviceId, researchId } = useParams<{ deviceId?: string; researchId?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'edit'; // 'view' | 'edit'
  const isViewMode = mode === 'view';

  const {
    getResearchByDeviceId,
    getResearchById,
    createResearch,
    updateResearchBasic,
    updateResearchController,
    updateResearchCollection,
    updateResearchSectionStatus,
    calculateResearchProgress,
    currentResearch,
    setCurrentResearch,
  } = useDeviceStore();

  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('basic');
  const [localProgress, setLocalProgress] = useState(0);
  const [isFromScratch, setIsFromScratch] = useState(false);

  useEffect(() => {
    // 支持两种方式访问：通过 deviceId 或 researchId
    if (researchId) {
      // 从零创建的调研记录
      const research = getResearchById(researchId);
      if (research) {
        setCurrentResearch(research);
        setLocalProgress(research.researchProgress || 0);
        setIsFromScratch(true);
      } else {
        message.error('调研记录不存在');
        navigate('/device/research-list');
      }
    } else if (deviceId) {
      // 基于设备的调研记录
      const deviceData = getDeviceById(deviceId);
      if (deviceData) {
        setDevice(deviceData);

        // 查找或创建调研记录
        let research = getResearchByDeviceId(deviceId);
        if (!research) {
          research = createResearch(deviceId, deviceData.projectId);
        }
        setCurrentResearch(research);
        setLocalProgress(research.researchProgress || 0);
        setIsFromScratch(false);
      } else {
        message.error('设备不存在');
        navigate('/device');
      }
    }
  }, [deviceId, researchId]);

  const handleClose = () => {
    navigate(-1);
  };

  const handleSaveSection = async (section: ResearchSection) => {
    if (!currentResearch) return;

    setLoading(true);
    try {
      // 模拟异步保存
      await new Promise(resolve => setTimeout(resolve, 500));

      // 使用 researchId 或 deviceId 更新状态
      const id = researchId || device?.id;
      if (id) {
        updateResearchSectionStatus(id, section, true);

        // 重新计算进度
        const newProgress = calculateResearchProgress(id);
        setLocalProgress(newProgress);
      }

      message.success('保存成功！');
    } catch (error) {
      message.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBasic = (data: DeviceResearchBasic) => {
    const id = researchId || device?.id;
    if (id) {
      updateResearchBasic(id, data);
      handleSaveSection('basic');
    }
  };

  const handleSaveController = (data: DeviceResearchController) => {
    const id = researchId || device?.id;
    if (id) {
      updateResearchController(id, data);
      handleSaveSection('controller');
    }
  };

  const handleSaveCollection = (data: DeviceResearchCollection) => {
    const id = researchId || device?.id;
    if (id) {
      updateResearchCollection(id, data);
      handleSaveSection('collection');
    }
  };

  if (!currentResearch) {
    return <div>加载中...</div>;
  }

  // 对于从零创建的调研，没有 device 对象
  const displayDevice = device;
  const researchTitle = isFromScratch
    ? `设备调研 - ${currentResearch.deviceName || '未命名设备'}`
    : `设备调研 - ${device?.name}`;

  const displayCode = currentResearch.deviceCode || displayDevice?.code || '-';
  const displayName = currentResearch.deviceName || displayDevice?.name || '-';
  const displayProject = currentResearch.projectName || displayDevice?.projectName || '-';
  const displayWorkshop = currentResearch.workshop || displayDevice?.workshop || '-';

  const getSectionStatus = (section: ResearchSection) => {
    switch (section) {
      case 'basic':
        return currentResearch.basicCompleted;
      case 'controller':
        return currentResearch.controllerCompleted;
      case 'collection':
        return currentResearch.collectionCompleted;
      default:
        return false;
    }
  };

  const tabItems = [
    {
      key: 'basic',
      label: (
        <Space>
          基础信息
          {getSectionStatus('basic') && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
        </Space>
      ),
      children: (
        <BasicInfoTab
          initialValues={{
            // 从 basic 中获取调研相关字段
            deviceType: currentResearch.basic?.deviceType,
            manufacturer: currentResearch.basic?.manufacturer,
            productionDate: currentResearch.basic?.productionDate,
            remarks: currentResearch.basic?.remarks,
            // 从顶层获取设备基本信息字段（如果 basic 中没有）
            deviceCode: currentResearch.deviceCode || currentResearch.basic?.deviceCode,
            projectName: currentResearch.projectName || currentResearch.basic?.projectName,
            deviceName: currentResearch.deviceName || currentResearch.basic?.deviceName,
            workshop: currentResearch.workshop || currentResearch.basic?.workshop,
          }}
          onSave={isViewMode ? undefined : handleSaveBasic}
          loading={loading}
          disabled={isViewMode}
        />
      ),
    },
    {
      key: 'controller',
      label: (
        <Space>
          控制器信息
          {getSectionStatus('controller') && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
        </Space>
      ),
      children: (
        <ControllerInfoTab
          initialValues={currentResearch.controller}
          onSave={isViewMode ? undefined : handleSaveController}
          loading={loading}
          disabled={isViewMode}
        />
      ),
    },
    {
      key: 'collection',
      label: (
        <Space>
          采集信息
          {getSectionStatus('collection') && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
        </Space>
      ),
      children: (
        <CollectionInfoTab
          initialValues={currentResearch.collection}
          onSave={isViewMode ? undefined : handleSaveCollection}
          loading={loading}
          disabled={isViewMode}
        />
      ),
    },
  ];

  const getStatusText = () => {
    if (localProgress === 0) return '未开始';
    if (localProgress === 100) return '已完成';
    return '进行中';
  };

  const getStatusColor = () => {
    if (localProgress === 0) return '#d9d9d9';
    if (localProgress === 100) return '#52c41a';
    return '#1890ff';
  };

  return (
    <Drawer
      title={researchTitle}
      placement="right"
      width={800}
      onClose={handleClose}
      open={true}
      extra={
        <Space>
          {!isViewMode && (
            <Button onClick={handleClose}>取消</Button>
          )}
          <Button type="primary" icon={isViewMode ? <EyeOutlined /> : <SaveOutlined />} onClick={handleClose}>
            {isViewMode ? '关闭' : '完成'}
          </Button>
        </Space>
      }
    >
      {/* 设备基本信息 */}
      <Card style={{ marginBottom: 16 }} size="small">
        <Descriptions column={2} size="small">
          <Descriptions.Item label="设备编号">{displayCode}</Descriptions.Item>
          <Descriptions.Item label="设备名称">{displayName}</Descriptions.Item>
          <Descriptions.Item label="所属项目">{displayProject}</Descriptions.Item>
          <Descriptions.Item label="所属车间">{displayWorkshop}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 调研进度 */}
      <Card style={{ marginBottom: 16 }} size="small">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 500 }}>调研进度</span>
            <span style={{ color: getStatusColor(), fontWeight: 600 }}>
              {getStatusText()} ({localProgress}%)
            </span>
          </div>
          <Progress
            percent={localProgress}
            status={localProgress === 100 ? 'success' : 'active'}
            strokeColor={getStatusColor()}
          />
          <div style={{ display: 'flex', gap: 24, fontSize: 12, color: '#666' }}>
            <Space>
              {getSectionStatus('basic') ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <span>○</span>}
              基础信息{getSectionStatus('basic') ? '已完成' : '未完成'}
            </Space>
            <Space>
              {getSectionStatus('controller') ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <span>○</span>}
              控制器信息{getSectionStatus('controller') ? '已完成' : '未完成'}
            </Space>
            <Space>
              {getSectionStatus('collection') ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <span>○</span>}
              采集信息{getSectionStatus('collection') ? '已完成' : '未完成'}
            </Space>
          </div>
        </Space>
      </Card>

      {/* 调研表单 */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
        />
      </Card>
    </Drawer>
  );
};

export default DeviceResearch;