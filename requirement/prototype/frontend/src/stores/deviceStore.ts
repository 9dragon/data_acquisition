import { create } from 'zustand';
import { Device, DeviceType, DeviceProgress, DeviceResearch, ResearchSection, DeviceResearchBasic, DeviceResearchController, DeviceResearchCollection } from '../types/device';

interface DeviceState {
  devices: Device[];
  deviceTypes: DeviceType[];
  currentDevice: Device | null;
  deviceProgress: DeviceProgress[];
  loading: boolean;

  // 调研相关状态
  deviceResearches: DeviceResearch[];
  currentResearch: DeviceResearch | null;

  // Actions
  setDevices: (devices: Device[]) => void;
  setCurrentDevice: (device: Device | null) => void;
  addDevice: (device: Device) => void;
  updateDevice: (id: string, data: Partial<Device>) => void;
  deleteDevice: (id: string) => void;
  setDeviceTypes: (types: DeviceType[]) => void;
  addDeviceType: (type: DeviceType) => void;
  updateDeviceType: (id: string, data: Partial<DeviceType>) => void;
  deleteDeviceType: (id: string) => void;
  setDeviceProgress: (progress: DeviceProgress[]) => void;
  setLoading: (loading: boolean) => void;

  // 调研操作方法
  setDeviceResearches: (researches: DeviceResearch[]) => void;
  setCurrentResearch: (research: DeviceResearch | null) => void;
  getResearchByDeviceId: (deviceId: string) => DeviceResearch | null;
  getResearchById: (researchId: string) => DeviceResearch | null;
  updateResearchBasic: (deviceId: string, data: DeviceResearchBasic) => void;
  updateResearchController: (deviceId: string, data: DeviceResearchController) => void;
  updateResearchCollection: (deviceId: string, data: DeviceResearchCollection) => void;
  updateResearchSectionStatus: (deviceId: string, section: ResearchSection, completed: boolean) => void;
  calculateResearchProgress: (deviceId: string) => number;
  createResearch: (deviceId: string, projectId: string) => DeviceResearch;
  deleteResearch: (deviceId: string) => void;

  // 新增：从零创建调研
  createResearchFromScratch: (data: {
    deviceCode: string;
    deviceName: string;
    workshop?: string;
    projectName?: string;
  }) => DeviceResearch;

  // 新增：关联设备到已有调研
  linkResearchToDevice: (researchId: string, deviceId: string) => void;
}

export const useDeviceStore = create<DeviceState>((set, get) => ({
  devices: [],
  deviceTypes: [],
  currentDevice: null,
  deviceProgress: [],
  loading: false,

  // 调研相关状态
  deviceResearches: [],
  currentResearch: null,

  setDevices: (devices) => set({ devices }),
  setCurrentDevice: (device) => set({ currentDevice: device }),
  addDevice: (device) => set((state) => ({ devices: [...state.devices, device] })),
  updateDevice: (id, data) =>
    set((state) => ({
      devices: state.devices.map((d) => (d.id === id ? { ...d, ...data } : d)),
      currentDevice: state.currentDevice?.id === id ? { ...state.currentDevice, ...data } : state.currentDevice,
    })),
  deleteDevice: (id) =>
    set((state) => ({
      devices: state.devices.filter((d) => d.id !== id),
      currentDevice: state.currentDevice?.id === id ? null : state.currentDevice,
    })),
  setDeviceTypes: (types) => set({ deviceTypes: types }),
  addDeviceType: (type) => set((state) => ({ deviceTypes: [...state.deviceTypes, type] })),
  updateDeviceType: (id, data) =>
    set((state) => ({
      deviceTypes: state.deviceTypes.map((t) => (t.id === id ? { ...t, ...data } : t)),
    })),
  deleteDeviceType: (id) =>
    set((state) => ({
      deviceTypes: state.deviceTypes.filter((t) => t.id !== id),
    })),
  setDeviceProgress: (progress) => set({ deviceProgress: progress }),
  setLoading: (loading) => set({ loading }),

  // 调研操作方法实现
  setDeviceResearches: (researches) => set({ deviceResearches: researches }),
  setCurrentResearch: (research) => set({ currentResearch: research }),

  getResearchByDeviceId: (deviceId: string) => {
    const state = get();
    return state.deviceResearches.find(r => r.deviceId === deviceId) || null;
  },

  getResearchById: (researchId: string) => {
    const state = get();
    return state.deviceResearches.find(r => r.id === researchId) || null;
  },

  updateResearchBasic: (deviceId: string, data: DeviceResearchBasic) => {
    set((state) => {
      // 支持通过 deviceId 或 researchId 查找
      const existingIndex = state.deviceResearches.findIndex(r => r.deviceId === deviceId || r.id === deviceId);
      if (existingIndex >= 0) {
        const updated = [...state.deviceResearches];
        updated[existingIndex] = {
          ...updated[existingIndex],
          basic: { ...updated[existingIndex].basic, ...data },
          updateTime: new Date().toISOString(),
        };
        return {
          deviceResearches: updated,
          currentResearch: state.currentResearch?.id === deviceId || state.currentResearch?.deviceId === deviceId
            ? { ...updated[existingIndex] }
            : state.currentResearch,
        };
      }
      return state;
    });
  },

  updateResearchController: (deviceId: string, data: DeviceResearchController) => {
    set((state) => {
      // 支持通过 deviceId 或 researchId 查找
      const existingIndex = state.deviceResearches.findIndex(r => r.deviceId === deviceId || r.id === deviceId);
      if (existingIndex >= 0) {
        const updated = [...state.deviceResearches];
        updated[existingIndex] = {
          ...updated[existingIndex],
          controller: { ...updated[existingIndex].controller, ...data },
          updateTime: new Date().toISOString(),
        };
        return {
          deviceResearches: updated,
          currentResearch: state.currentResearch?.id === deviceId || state.currentResearch?.deviceId === deviceId
            ? { ...updated[existingIndex] }
            : state.currentResearch,
        };
      }
      return state;
    });
  },

  updateResearchCollection: (deviceId: string, data: DeviceResearchCollection) => {
    set((state) => {
      // 支持通过 deviceId 或 researchId 查找
      const existingIndex = state.deviceResearches.findIndex(r => r.deviceId === deviceId || r.id === deviceId);
      if (existingIndex >= 0) {
        const updated = [...state.deviceResearches];
        updated[existingIndex] = {
          ...updated[existingIndex],
          collection: { ...updated[existingIndex].collection, ...data },
          updateTime: new Date().toISOString(),
        };
        return {
          deviceResearches: updated,
          currentResearch: state.currentResearch?.id === deviceId || state.currentResearch?.deviceId === deviceId
            ? { ...updated[existingIndex] }
            : state.currentResearch,
        };
      }
      return state;
    });
  },

  updateResearchSectionStatus: (deviceId: string, section: ResearchSection, completed: boolean) => {
    set((state) => {
      // 支持通过 deviceId 或 researchId 查找
      const existingIndex = state.deviceResearches.findIndex(r => r.deviceId === deviceId || r.id === deviceId);
      if (existingIndex >= 0) {
        const updated = [...state.deviceResearches];
        const research = { ...updated[existingIndex] };

        switch (section) {
          case 'basic':
            research.basicCompleted = completed;
            break;
          case 'controller':
            research.controllerCompleted = completed;
            break;
          case 'collection':
            research.collectionCompleted = completed;
            break;
        }

        // 自动计算总体进度
        let completedSections = 0;
        if (research.basicCompleted) completedSections++;
        if (research.controllerCompleted) completedSections++;
        if (research.collectionCompleted) completedSections++;
        research.researchProgress = Math.round((completedSections / 3) * 100);

        updated[existingIndex] = {
          ...research,
          updateTime: new Date().toISOString(),
        };

        return {
          deviceResearches: updated,
          currentResearch: state.currentResearch?.id === deviceId || state.currentResearch?.deviceId === deviceId
            ? { ...updated[existingIndex] }
            : state.currentResearch,
        };
      }
      return state;
    });
  },

  calculateResearchProgress: (deviceId: string) => {
    const research = get().getResearchByDeviceId(deviceId);
    if (!research) return 0;

    let completedSections = 0;
    if (research.basicCompleted) completedSections++;
    if (research.controllerCompleted) completedSections++;
    if (research.collectionCompleted) completedSections++;

    return Math.round((completedSections / 3) * 100);
  },

  createResearch: (deviceId: string, projectId: string) => {
    const state = get();
    const device = state.devices.find(d => d.id === deviceId);
    const newResearch: DeviceResearch = {
      id: `research_${Date.now()}`,
      deviceId,
      deviceName: device?.name,
      projectId,
      projectName: device?.projectName,
      basic: {
        // 从设备数据初始化
        deviceCode: device?.code,
        deviceName: device?.name,
        deviceType: device?.typeName,
        workshop: device?.workshop,
      },
      controller: {},
      collection: {},
      basicCompleted: false,
      controllerCompleted: false,
      collectionCompleted: false,
      researchProgress: 0,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
    };

    set((state) => ({
      deviceResearches: [...state.deviceResearches, newResearch],
      currentResearch: newResearch,
    }));

    return newResearch;
  },

  deleteResearch: (deviceId: string) => {
    set((state) => ({
      deviceResearches: state.deviceResearches.filter(r => r.deviceId !== deviceId),
      currentResearch: state.currentResearch?.deviceId === deviceId ? null : state.currentResearch,
    }));
  },

  createResearchFromScratch: (data) => {
    const newResearch: DeviceResearch = {
      id: `research_${Date.now()}`,
      // 不设置 deviceId，保持为 undefined
      deviceName: data.deviceName,
      projectName: data.projectName,
      // 直接设置设备基本信息字段
      deviceCode: data.deviceCode,
      deviceType: '', // 初始为空，在基础信息中填写
      workshop: data.workshop,
      // 初始化调研数据
      basic: {
        deviceCode: data.deviceCode,
        deviceName: data.deviceName,
        deviceType: '', // 在基础信息中填写
        workshop: data.workshop,
        projectName: data.projectName,
      },
      controller: {},
      collection: {},
      basicCompleted: false,
      controllerCompleted: false,
      collectionCompleted: false,
      researchProgress: 0,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
    };

    set((state) => ({
      deviceResearches: [...state.deviceResearches, newResearch],
      currentResearch: newResearch,
    }));

    return newResearch;
  },

  linkResearchToDevice: (researchId: string, deviceId: string) => {
    set((state) => {
      const device = state.devices.find(d => d.id === deviceId);
      const existingIndex = state.deviceResearches.findIndex(r => r.id === researchId);

      if (existingIndex >= 0 && device) {
        const updated = [...state.deviceResearches];
        updated[existingIndex] = {
          ...updated[existingIndex],
          deviceId: deviceId,
          projectId: device.projectId,
          projectName: device.projectName,
          updateTime: new Date().toISOString(),
        };

        return {
          deviceResearches: updated,
          currentResearch: state.currentResearch?.id === researchId
            ? { ...updated[existingIndex] }
            : state.currentResearch,
        };
      }

      return state;
    });
  },
}));
