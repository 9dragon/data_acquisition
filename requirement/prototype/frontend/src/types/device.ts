import { BaseEntity, StatusType } from './common';

// 设备状态
export type DeviceStatus = 'not_started' | 'in_progress' | 'completed' | 'abnormal';

// 设备分类
export type DeviceCategory = 'PLC' | 'CNC' | 'Robot' | 'Sensor' | 'Instrument' | 'Other';

// 采集方式
export type CollectionMethod = 'OPC_UA' | 'Modbus_TCP' | 'Modbus_RTU' | 'MQTT' | 'HTTP' | 'Other';

export interface Device extends BaseEntity {
  name: string;
  code: string;
  projectId: string;
  projectName?: string;
  typeId: string;
  typeName?: string;
  category: DeviceCategory;
  status: DeviceStatus;
  ip?: string;
  port?: number;
  location?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  collectionMethod: CollectionMethod;
  connectionConfig?: Record<string, any>;
  pointCount: number; // 采集点数
  collectedPointCount: number; // 已采集点数
  progress: number; // 0-100
  responsiblePersonId: string;
  responsiblePerson?: string;
  startDate?: string;
  completedDate?: string;
  tags?: string[];
  issues?: number; // 关联问题数
  documents?: number; // 关联文档数
}

export interface DeviceType extends BaseEntity {
  name: string;
  code: string;
  category: DeviceCategory;
  description?: string;
  defaultCollectionMethod: CollectionMethod;
  templateConfig?: Record<string, any>;
  pointTemplate?: DataPointTemplate[];
}

export interface DataPointTemplate {
  name: string;
  code: string;
  dataType: 'bool' | 'int8' | 'int16' | 'int32' | 'float' | 'double' | 'string';
  address?: string;
  description?: string;
  unit?: string;
}

export interface DeviceProgress {
  deviceId: string;
  projectName: string;
  deviceName: string;
  stage: string;
  progress: number;
  collectedPoints: number;
  totalPoints: number;
  issues: number;
  lastUpdateTime: string;
}
