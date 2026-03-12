import React, { useState, useEffect } from 'react';
import { Card, Form, Input, InputNumber, Button, message, Space, Select, Tabs } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/Common/PageHeader';
import { useDeviceStore } from '../../stores/deviceStore';
import { useProjectStore } from '../../stores/projectStore';
import { useProcessStore } from '../../stores/processStore';
import { useWorkshopStore } from '../../stores/workshopStore';
import BasicInfoTab from '../../components/Device/BasicInfoTab';
import ControllerInfoTab from '../../components/Device/ControllerInfoTab';
import CollectionInfoTab from '../../components/Device/CollectionInfoTab';
import { mockProcesses, mockWorkshops, mockDeviceTypes, mockProjects } from '../../services/mockData';
import type { DeviceResearchBasic, DeviceResearchController, DeviceResearchCollection } from '../../types/device';

const CreateResearch: React.FC = () => {
  const navigate = useNavigate();
  const { createResearchFromScratch, currentResearch, updateResearchBasic,
          updateResearchController, updateResearchCollection, setDeviceTypes, deviceTypes } = useDeviceStore();
  const { projects, setProjects } = useProjectStore();
  const { getProcessesByProject, setProcesses, processes } = useProcessStore();
  const { workshops, getWorkshopsByProject, setWorkshops } = useWorkshopStore();
  const { getDeviceTypesByProject } = useDeviceStore();

  // 初始化模拟数据
  useEffect(() => {
    if (processes.length === 0) {
      setProcesses(mockProcesses);
    }
    if (workshops.length === 0) {
      setWorkshops(mockWorkshops);
    }
    if (deviceTypes.length === 0) {
      setDeviceTypes(mockDeviceTypes);
    }
    if (projects.length === 0) {
      setProjects(mockProjects);
    }
  }, [processes.length, workshops.length, deviceTypes.length, projects.length,
      setProcesses, setWorkshops, setDeviceTypes, setProjects]);

  const [form] = Form.useForm();
  const [selectedProjectId, setSelectedProjectId] = useState<string>();
  const [currentTab, setCurrentTab] = useState<string>('basic');
  const [processOptions, setProcessOptions] = useState<Array<{label: string, value: string}>>([]);
  const [workshopOptions, setWorkshopOptions] = useState<Array<{label: string, value: string}>>([]);
  const [deviceTypeOptions, setDeviceTypeOptions] = useState<Array<{label: string, value: string}>>([]);

  // 监听项目选择变化，更新工序、车间、设备类型列表
  useEffect(() => {
    if (selectedProjectId) {
      const processes = getProcessesByProject(selectedProjectId);
      setProcessOptions(processes.map(p => ({ label: p.name, value: p.id })));

      const workshops = getWorkshopsByProject(selectedProjectId);
      setWorkshopOptions(workshops.map(w => ({ label: w.name, value: w.name })));

      const deviceTypes = getDeviceTypesByProject(selectedProjectId);
      setDeviceTypeOptions(deviceTypes.map(t => ({ label: t.name, value: t.name })));
    } else {
      setProcessOptions([]);
      setWorkshopOptions([]);
      setDeviceTypeOptions([]);
    }
  }, [selectedProjectId, getProcessesByProject, getWorkshopsByProject, getDeviceTypesByProject]);

  // 处理项目选择变化
  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    form.setFieldsValue({ processId: undefined, workshop: undefined, deviceType: undefined });
  };

  // 处理基础信息保存
  const handleBasicSave = (data: DeviceResearchBasic) => {
    if (!currentResearch) {
      // 首次保存，创建调研记录
      const research = createResearchFromScratch({
        projectId: selectedProjectId,  // 新增：传递项目ID
        deviceCode: data.deviceCode || '',
        deviceName: data.deviceName || '',
        workshop: data.workshop,
        projectName: data.projectName,
        processId: data.processId,
        processName: data.processName,
        quantity: data.quantity,
        deviceManufacturer: data.deviceManufacturer,
      });
      message.success('调研记录创建成功');
    } else {
      // 更新已有调研记录
      const id = currentResearch.id;
      updateResearchBasic(id, data);
      message.success('基础信息已保存');
    }
  };

  // 处理控制器信息保存
  const handleControllerSave = (data: DeviceResearchController) => {
    if (!currentResearch) {
      message.warning('请先保存基础信息');
      return;
    }
    const id = currentResearch.id;
    updateResearchController(id, data);
    message.success('控制器信息已保存');
  };

  // 处理采集信息保存
  const handleCollectionSave = (data: DeviceResearchCollection) => {
    if (!currentResearch) {
      message.warning('请先保存基础信息');
      return;
    }
    const id = currentResearch.id;
    updateResearchCollection(id, data);
    message.success('采集信息已保存');
  };

  // 获取基础信息初始值
  const getBasicInitialValues = () => {
    if (currentResearch?.basic) {
      return {
        ...currentResearch.basic,
        processId: currentResearch.processId || currentResearch.basic?.processId,
        processName: currentResearch.processName || currentResearch.basic?.processName,
        quantity: currentResearch.quantity || currentResearch.basic?.quantity,
        deviceManufacturer: currentResearch.deviceManufacturer || currentResearch.basic?.deviceManufacturer,
      };
    }
    return undefined;
  };

  const tabItems = [
    {
      key: 'basic',
      label: '基础信息',
      children: (
        <BasicInfoTab
          initialValues={getBasicInitialValues()}
          onSave={handleBasicSave}
          processOptions={processOptions}
          workshopOptions={workshopOptions}
          deviceTypeOptions={deviceTypeOptions}
          projects={projects}
          projectId={selectedProjectId}
          onProjectChange={handleProjectChange}
        />
      ),
    },
    {
      key: 'controller',
      label: '控制器信息',
      children: (
        <ControllerInfoTab
          initialValues={currentResearch?.controller}
          onSave={handleControllerSave}
        />
      ),
    },
    {
      key: 'collection',
      label: '采集信息',
      children: (
        <CollectionInfoTab
          initialValues={currentResearch?.collection}
          onSave={handleCollectionSave}
        />
      ),
    },
  ];

  return (
    <Card>
      <PageHeader
        title="新建调研"
        extra={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/device/research-list')}
            >
              返回列表
            </Button>
          </Space>
        }
      />

      <Tabs
        activeKey={currentTab}
        onChange={setCurrentTab}
        items={tabItems}
        size="large"
      />
    </Card>
  );
};

export default CreateResearch;
