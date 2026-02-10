import { create } from 'zustand';
import { Device, DeviceType, DeviceProgress } from '../types/device';

interface DeviceState {
  devices: Device[];
  deviceTypes: DeviceType[];
  currentDevice: Device | null;
  deviceProgress: DeviceProgress[];
  loading: boolean;

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
}

export const useDeviceStore = create<DeviceState>((set) => ({
  devices: [],
  deviceTypes: [],
  currentDevice: null,
  deviceProgress: [],
  loading: false,

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
}));
