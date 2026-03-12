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
  workshop?: string;      // 所属车间
  workshopId?: string;    // 车间ID（可选，用于关联主数据）
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
  projectId: string;           // 所属项目ID
  projectName?: string;        // 所属项目名称
  processId?: string;          // 所属工序ID
  processName?: string;        // 所属工序名称
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

// 设备调研相关类型定义
export type ResearchSection = 'basic' | 'controller' | 'collection';

// 调研基础信息
export interface DeviceResearchBasic {
  // 新增字段
  deviceCode?: string;          // 设备编号
  deviceName?: string;          // 设备名称
  deviceType?: string;          // 设备类型
  projectName?: string;         // 项目名称
  workshop?: string;            // 所属车间
  processId?: string;           // 工序ID
  processName?: string;         // 工序名称
  quantity?: number;            // 数量
  deviceManufacturer?: string;  // 设备厂商（区别于控制器厂商）

  // 原有字段
  manufacturer?: string;        // 设备生产厂商（兼容旧字段）
  productionDate?: string;      // 出厂日期
  remarks?: string;             // 备注
}

// 多媒体附件信息
export interface MediaAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video';
  size?: number;
  uploadTime?: string;
}

// 调研控制器信息
export interface DeviceResearchController {
  isInterfaceOccupied?: boolean;              // 接口是否被占用
  interfaceType?: 'serial' | 'network';       // 控制器接口类型
  hasTouchScreen?: boolean;                   // 是否连接触摸屏
  controllerBrand?: string;                   // 控制器品牌
  controllerModel?: string;                   // 控制器型号
  touchScreenBrand?: string;                  // 触摸屏品牌
  hasPointTable?: boolean;                    // 是否提供点位表
  hasPlcSource?: boolean;                     // 是否提供PLC源程序
  hasTouchScreenSource?: boolean;             // 是否提供触摸屏源程序

  // 新增多媒体附件
  controllerPhotos?: MediaAttachment[];      // 控制器照片
  controllerVideos?: MediaAttachment[];      // 控制器视频
  touchscreenPhotos?: MediaAttachment[];     // 触摸屏照片
  touchscreenVideos?: MediaAttachment[];     // 触摸屏视频
  cabinetPhotos?: MediaAttachment[];         // 控制柜照片
  cabinetVideos?: MediaAttachment[];         // 控制柜视频
}

// 调研采集信息
export interface DeviceResearchCollection {
  collectDeviceStatus?: boolean;      // 采集设备状态
  collectProcessParams?: boolean;     // 采集工艺参数
  dataItems?: string[];               // 需采集数据项
  dataItemsDetail?: string;           // 需采集数据项明细
  collectProduction?: boolean;        // 采集产量/节拍
  collectEnergy?: boolean;            // 采集能耗
}

// 设备调研完整记录
export interface DeviceResearch extends BaseEntity {
  deviceId?: string;                  // 关联设备ID（可选，用于后续关联）
  deviceName?: string;                // 设备名称
  projectId?: string;                 // 所属项目ID（可选）
  projectName?: string;               // 项目名称

  // 设备基本信息（从零创建时必填）
  deviceCode?: string;                // 设备编号
  deviceType?: string;                // 设备类型
  workshop?: string;                  // 所属车间

  // 新增字段
  processId?: string;                 // 工序ID
  processName?: string;               // 工序名称
  quantity?: number;                  // 数量
  deviceManufacturer?: string;        // 设备厂商（区别于控制器厂商）

  // 三大类调研信息
  basic?: DeviceResearchBasic;
  controller?: DeviceResearchController;
  collection?: DeviceResearchCollection;

  // 调研状态
  basicCompleted?: boolean;           // 基础信息是否完成
  controllerCompleted?: boolean;      // 控制器信息是否完成
  collectionCompleted?: boolean;      // 采集信息是否完成
  researchProgress?: number;          // 调研进度（0-100）

  // 调研人员信息
  researcherId?: string;              // 调研人员ID
  researcherName?: string;            // 调研人员姓名
  researchDate?: string;              // 调研日期
}
