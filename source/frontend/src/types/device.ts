import type { BaseEntity } from './common';
import type { StatusType } from './common';

// 设备状态
export type DeviceStatus = 'not_started' | 'in_progress' | 'completed' | 'abnormal';

// 设备分类
export type DeviceCategory = 'PLC' | 'CNC' | 'Robot' | 'Sensor' | 'Instrument' | 'Other';

// 采集方式
export type CollectionMethod = 'OPC_UA' | 'Modbus_TCP' | 'Modbus_RTU' | 'MQTT' | 'HTTP' | 'Other';

export interface Device extends BaseEntity {
  name: string;
  code: string;
  projectId: number;
  projectName?: string;
  typeId: number;
  typeName?: string;
  category: DeviceCategory;
  ip?: string;
  port?: number;
  location?: string;
  workshop?: string;      // 所属车间
  workshopId?: string;    // 车间ID（可选，用于关联主数据）
  workshopName?: string;  // 车间名称
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  collectionMethod: CollectionMethod;
  connectionConfig?: Record<string, any>;
  pointCount: number; // 采集点数
  collectedPointCount: number; // 已采集点数
  startDate?: string;
  completedDate?: string;
  tags?: string[];
  issues?: number; // 关联问题数
  documents?: number; // 关联文档数
}

export interface DeviceType extends BaseEntity {
  projectId: number;           // 所属项目ID
  projectName?: string;        // 所属项目名称
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
  deviceId: number;
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
  projectId?: number;           // 项目ID
  projectName?: string;         // 项目名称（后端关联查询返回）
  deviceTypeId?: string;        // 设备类型ID
  deviceTypeName?: string;      // 设备类型名称（后端关联查询返回）
  workshopId?: string;          // 车间ID
  workshopName?: string;        // 车间名称（后端关联查询返回）
  quantity?: number;            // 数量
  deviceManufacturer?: string;  // 设备厂商
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
  interfaceType?: 'RJ45' | 'RJ232';           // 控制器接口类型
  hasTouchScreen?: boolean;                   // 是否连接触摸屏
  controllerBrand?: string;                   // 控制器品牌
  controllerModel?: string;                   // 控制器型号
  touchScreenBrand?: string;                  // 触摸屏品牌
  hasPointTable?: boolean;                    // 是否提供点位表
  hasPlcSource?: boolean;                     // 是否提供PLC源程序
  hasTouchScreenSource?: boolean;             // 是否提供触摸屏源程序

  // 新增多媒体附件（JSON字符串）
  controllerPhotos?: string;                  // 控制器照片（JSON字符串）
  controllerVideos?: string;                  // 控制器视频（JSON字符串）
  touchscreenPhotos?: string;                 // 触摸屏照片（JSON字符串）
  touchscreenVideos?: string;                 // 触摸屏视频（JSON字符串）
  cabinetPhotos?: string;                     // 控制柜照片（JSON字符串）
  cabinetVideos?: string;                     // 控制柜视频（JSON字符串）
}

// 调研采集信息
export interface DeviceResearchCollection {
  collectDeviceStatus?: boolean;      // 采集设备状态
  collectProcessParams?: boolean;     // 采集工艺参数
  dataItems?: string;                 // 需采集数据项（JSON字符串）
  dataItemsDetail?: string;           // 需采集数据项明细
  collectProduction?: boolean;        // 采集产量/节拍
  collectEnergy?: boolean;            // 采集能耗
}

// 设备调研完整记录
export interface DeviceResearch extends BaseEntity {
  id?: number;                          // 调研ID
  projectId?: number;                   // 项目ID
  projectName?: string;                 // 项目名称（后端关联查询返回）
  deviceTypeId?: string;                // 设备类型ID
  deviceTypeName?: string;              // 设备类型名称（后端关联查询返回）
  workshopId?: string;                  // 车间ID
  workshopName?: string;                // 车间名称（后端关联查询返回）
  quantity?: number;                    // 数量
  deviceManufacturer?: string;          // 设备厂商

  // 控制器信息
  isInterfaceOccupied?: boolean;         // 接口是否被占用
  interfaceType?: string;               // 接口类型
  hasTouchScreen?: boolean;             // 是否连接触摸屏
  controllerBrand?: string;             // 控制器品牌
  controllerModel?: string;             // 控制器型号
  touchScreenBrand?: string;            // 触摸屏品牌
  hasPointTable?: boolean;              // 是否提供点位表
  hasPlcSource?: boolean;               // 是否提供PLC源程序
  hasTouchScreenSource?: boolean;       // 是否提供触摸屏源程序
  controllerPhotos?: string;            // 控制器照片
  controllerVideos?: string;            // 控制器视频
  touchscreenPhotos?: string;           // 触摸屏照片
  touchscreenVideos?: string;           // 触摸屏视频
  cabinetPhotos?: string;               // 控制柜照片
  cabinetVideos?: string;               // 控制柜视频

  // 采集信息
  collectDeviceStatus?: boolean;        // 采集设备状态
  collectProcessParams?: boolean;       // 采集工艺参数
  dataItems?: string;                   // 需采集数据项
  dataItemsDetail?: string;             // 需采集数据项明细
  collectProduction?: boolean;          // 采集产量/节拍
  collectEnergy?: boolean;              // 采集能耗

  // 调研状态
  basicCompleted?: boolean;             // 基础信息是否完成
  controllerCompleted?: boolean;        // 控制器信息是否完成
  collectionCompleted?: boolean;        // 采集信息是否完成
  researchProgress?: number;            // 调研进度（0-100）

  // 调研人员信息
  researcherId?: number;                // 调研人员ID
  researcherName?: string;              // 调研人员姓名
  researchDate?: string;                // 调研日期

  // 备注
  remarks?: string;                     // 备注

  // 时间戳
  createdAt?: string;                   // 创建时间
  updatedAt?: string;                   // 更新时间
}
