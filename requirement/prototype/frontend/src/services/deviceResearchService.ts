import * as XLSX from 'xlsx';
import { message } from 'antd';
import type { DeviceResearch } from '../types/device';

/**
 * 设备调研服务 - 处理模板和批量导入导出
 */

// 模板工作表配置
const TEMPLATE_CONFIG = {
  // 基础信息表头
  basicHeaders: [
    { field: '设备编号', key: 'deviceCode', required: true },
    { field: '设备名称', key: 'deviceName', required: true },
    { field: '生产厂商', key: 'manufacturer', required: false },
    { field: '出厂日期', key: 'productionDate', required: false },
    { field: '备注', key: 'remarks', required: false },
  ],
  // 控制器信息表头
  controllerHeaders: [
    { field: '设备编号', key: 'deviceCode', required: true },
    { field: '接口是否被占用', key: 'isInterfaceOccupied', required: true, options: ['是', '否'] },
    { field: '控制器接口类型', key: 'interfaceType', required: true, options: ['串口', '网口'] },
    { field: '是否连接触摸屏', key: 'hasTouchScreen', required: true, options: ['是', '否'] },
    { field: '控制器品牌', key: 'controllerBrand', required: true },
    { field: '控制器型号', key: 'controllerModel', required: false },
    { field: '是否提供点位表', key: 'hasPointTable', required: true, options: ['是', '否'] },
    { field: '是否提供PLC源程序', key: 'hasPlcSource', required: true, options: ['是', '否'] },
    { field: '是否提供触摸屏源程序', key: 'hasTouchScreenSource', required: true, options: ['是', '否'] },
  ],
  // 采集信息表头
  collectionHeaders: [
    { field: '设备编号', key: 'deviceCode', required: true },
    { field: '采集设备状态', key: 'collectDeviceStatus', required: true, options: ['是', '否'] },
    { field: '采集工艺参数', key: 'collectProcessParams', required: true, options: ['是', '否'] },
    { field: '采集产量/节拍', key: 'collectProduction', required: true, options: ['是', '否'] },
    { field: '采集能耗', key: 'collectEnergy', required: true, options: ['是', '否'] },
    { field: '需采集数据项', key: 'dataItems', required: false },
    { field: '数据项明细说明', key: 'dataItemsDetail', required: false },
  ],
};

/**
 * 下载调研模板
 */
export const downloadResearchTemplate = async () => {
  try {
    // 创建工作簿
    const workbook = XLSX.utils.book_new();

    // 创建基础信息工作表
    const basicSheetData = [
      TEMPLATE_CONFIG.basicHeaders.map(h => h.field),
      ['DEV-001', '数控车床', '西门子', '2023-01-15', '主力生产设备'],
      ['', '', '', '', ''],
      ['说明：', '', '', '', ''],
      ['1. 设备编号和设备名称为必填项', '', '', '', ''],
      ['2. 出厂日期格式：YYYY-MM-DD', '', '', '', ''],
      ['3. 多个设备请复制第二行填写', '', '', '', ''],
    ];
    const basicSheet = XLSX.utils.aoa_to_sheet(basicSheetData);
    XLSX.utils.book_append_sheet(workbook, basicSheet, '基础信息');

    // 创建控制器信息工作表
    const controllerSheetData = [
      TEMPLATE_CONFIG.controllerHeaders.map(h => h.field),
      ['DEV-001', '是', '网口', '是', '西门子', 'S7-1200', '是', '否', '否'],
      ['', '', '', '', '', '', '', '', ''],
      ['说明：', '', '', '', '', '', '', '', ''],
      ['1. 接口类型选择：串口/网口', '', '', '', '', '', '', '', ''],
      ['2. 是否类字段只能填写：是/否', '', '', '', '', '', '', '', ''],
      ['3. 设备编号必须与基础信息一致', '', '', '', '', '', '', '', ''],
    ];
    const controllerSheet = XLSX.utils.aoa_to_sheet(controllerSheetData);
    XLSX.utils.book_append_sheet(workbook, controllerSheet, '控制器信息');

    // 创建采集信息工作表
    const collectionSheetData = [
      TEMPLATE_CONFIG.collectionHeaders.map(h => h.field),
      ['DEV-001', '是', '是', '是', '否', '设备运行状态,设备故障信息,温度数据', '需要实时采集设备运行状态和报警信息'],
      ['', '', '', '', '', '', ''],
      ['说明：', '', '', '', '', '', ''],
      ['1. 是否类字段只能填写：是/否', '', '', '', '', '', ''],
      ['2. 多个数据项用逗号分隔', '', '', '', '', '', ''],
      ['3. 数据项明细说明可换行填写', '', '', '', '', '', ''],
    ];
    const collectionSheet = XLSX.utils.aoa_to_sheet(collectionSheetData);
    XLSX.utils.book_append_sheet(workbook, collectionSheet, '采集信息');

    // 生成文件并下载
    XLSX.writeFile(workbook, `设备调研模板_${new Date().toISOString().split('T')[0]}.xlsx`);
    message.success('模板下载成功！');
    return true;
  } catch (error) {
    console.error('下载模板失败:', error);
    message.error('模板下载失败，请重试');
    return false;
  }
};

/**
 * 导出调研数据
 */
export const exportResearchData = async (
  researches: DeviceResearch[],
  deviceMap: Map<string, any>
) => {
  try {
    if (researches.length === 0) {
      message.warning('请选择要导出的设备');
      return false;
    }

    // 创建工作簿
    const workbook = XLSX.utils.book_new();

    // 基础信息数据
    const basicData = researches.map(r => {
      const device = r.deviceId ? deviceMap.get(r.deviceId) : undefined;
      return {
        '设备编号': device?.code || '',
        '设备名称': device?.name || '',
        '生产厂商': r.basic?.manufacturer || '',
        '出厂日期': r.basic?.productionDate || '',
        '备注': r.basic?.remarks || '',
      };
    });
    const basicSheet = XLSX.utils.json_to_sheet(basicData);
    XLSX.utils.book_append_sheet(workbook, basicSheet, '基础信息');

    // 控制器信息数据
    const controllerData = researches.map(r => {
      const device = r.deviceId ? deviceMap.get(r.deviceId) : undefined;
      return {
        '设备编号': device?.code || '',
        '接口是否被占用': r.controller?.isInterfaceOccupied ? '是' : '否',
        '控制器接口类型': r.controller?.interfaceType === 'serial' ? '串口' : '网口',
        '是否连接触摸屏': r.controller?.hasTouchScreen ? '是' : '否',
        '控制器品牌': r.controller?.controllerBrand || '',
        '控制器型号': r.controller?.controllerModel || '',
        '是否提供点位表': r.controller?.hasPointTable ? '是' : '否',
        '是否提供PLC源程序': r.controller?.hasPlcSource ? '是' : '否',
        '是否提供触摸屏源程序': r.controller?.hasTouchScreenSource ? '是' : '否',
      };
    });
    const controllerSheet = XLSX.utils.json_to_sheet(controllerData);
    XLSX.utils.book_append_sheet(workbook, controllerSheet, '控制器信息');

    // 采集信息数据
    const collectionData = researches.map(r => {
      const device = r.deviceId ? deviceMap.get(r.deviceId) : undefined;
      return {
        '设备编号': device?.code || '',
        '采集设备状态': r.collection?.collectDeviceStatus ? '是' : '否',
        '采集工艺参数': r.collection?.collectProcessParams ? '是' : '否',
        '采集产量/节拍': r.collection?.collectProduction ? '是' : '否',
        '采集能耗': r.collection?.collectEnergy ? '是' : '否',
        '需采集数据项': r.collection?.dataItems?.join(',') || '',
        '数据项明细说明': r.collection?.dataItemsDetail || '',
      };
    });
    const collectionSheet = XLSX.utils.json_to_sheet(collectionData);
    XLSX.utils.book_append_sheet(workbook, collectionSheet, '采集信息');

    // 生成文件并下载
    XLSX.writeFile(workbook, `设备调研数据_${new Date().toISOString().split('T')[0]}.xlsx`);
    message.success(`成功导出 ${researches.length} 条调研数据！`);
    return true;
  } catch (error) {
    console.error('导出数据失败:', error);
    message.error('导出数据失败，请重试');
    return false;
  }
};

/**
 * 解析导入的调研数据
 */
interface ImportResult {
  success: boolean;
  total: number;
  successCount: number;
  failCount: number;
  errors: string[];
  data?: any[];
}

export const importResearchData = async (file: File): Promise<ImportResult> => {
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });

    const errors: string[] = [];
    const result: any = {
      basic: [],
      controller: [],
      collection: [],
    };

    // 解析基础信息
    if (workbook.Sheets['基础信息']) {
      const basicData = XLSX.utils.sheet_to_json(workbook.Sheets['基础信息']) as any[];
      result.basic = basicData.map((row, index) => {
        if (!row['设备编号']) {
          errors.push(`基础信息第${index + 2}行：设备编号不能为空`);
        }
        return {
          deviceCode: row['设备编号'],
          deviceName: row['设备名称'],
          manufacturer: row['生产厂商'],
          productionDate: row['出厂日期'],
          remarks: row['备注'],
        };
      });
    }

    // 解析控制器信息
    if (workbook.Sheets['控制器信息']) {
      const controllerData = XLSX.utils.sheet_to_json(workbook.Sheets['控制器信息']) as any[];
      result.controller = controllerData.map((row, index) => {
        if (!row['设备编号']) {
          errors.push(`控制器信息第${index + 2}行：设备编号不能为空`);
        }
        const isInterfaceOccupied = row['接口是否被占用'];
        if (isInterfaceOccupied && isInterfaceOccupied !== '是' && isInterfaceOccupied !== '否') {
          errors.push(`控制器信息第${index + 2}行：接口是否被占用只能填写"是"或"否"`);
        }
        return {
          deviceCode: row['设备编号'],
          isInterfaceOccupied: isInterfaceOccupied === '是',
          interfaceType: row['控制器接口类型'] === '串口' ? 'serial' : 'network',
          hasTouchScreen: row['是否连接触摸屏'] === '是',
          controllerBrand: row['控制器品牌'],
          controllerModel: row['控制器型号'],
          hasPointTable: row['是否提供点位表'] === '是',
          hasPlcSource: row['是否提供PLC源程序'] === '是',
          hasTouchScreenSource: row['是否提供触摸屏源程序'] === '是',
        };
      });
    }

    // 解析采集信息
    if (workbook.Sheets['采集信息']) {
      const collectionData = XLSX.utils.sheet_to_json(workbook.Sheets['采集信息']) as any[];
      result.collection = collectionData.map((row, index) => {
        if (!row['设备编号']) {
          errors.push(`采集信息第${index + 2}行：设备编号不能为空`);
        }
        const dataItems = row['需采集数据项'];
        const dataItemsArray = typeof dataItems === 'string'
          ? dataItems.split(/[,，]/).map(item => item.trim()).filter(item => item)
          : [];

        return {
          deviceCode: row['设备编号'],
          collectDeviceStatus: row['采集设备状态'] === '是',
          collectProcessParams: row['采集工艺参数'] === '是',
          collectProduction: row['采集产量/节拍'] === '是',
          collectEnergy: row['采集能耗'] === '是',
          dataItems: dataItemsArray,
          dataItemsDetail: row['数据项明细说明'],
        };
      });
    }

    const totalCount = result.basic.length;
    const failCount = errors.length;
    const successCount = totalCount - failCount;

    return {
      success: failCount === 0,
      total: totalCount,
      successCount,
      failCount,
      errors,
      data: result,
    };
  } catch (error) {
    console.error('解析导入数据失败:', error);
    return {
      success: false,
      total: 0,
      successCount: 0,
      failCount: 0,
      errors: ['文件解析失败，请检查文件格式是否正确'],
    };
  }
};

/**
 * 验证导入数据的设备编号是否存在
 */
export const validateImportDeviceCodes = (
  importData: any,
  existingDeviceCodes: Set<string>
): string[] => {
  const errors: string[] = [];
  const allCodes = new Set<string>();

  // 收集所有导入的设备编号
  if (importData.basic) {
    importData.basic.forEach((row: any, index: number) => {
      if (!row.deviceCode) {
        errors.push(`基础信息第${index + 2}行：设备编号不能为空`);
        return;
      }
      if (allCodes.has(row.deviceCode)) {
        errors.push(`基础信息第${index + 2}行：设备编号"${row.deviceCode}"重复`);
      }
      allCodes.add(row.deviceCode);
      if (!existingDeviceCodes.has(row.deviceCode)) {
        errors.push(`基础信息第${index + 2}行：设备编号"${row.deviceCode}"不存在`);
      }
    });
  }

  // 验证控制器和采集信息的设备编号是否与基础信息一致
  if (importData.controller) {
    importData.controller.forEach((row: any, index: number) => {
      if (row.deviceCode && !allCodes.has(row.deviceCode)) {
        errors.push(`控制器信息第${index + 2}行：设备编号"${row.deviceCode}"在基础信息中不存在`);
      }
    });
  }

  if (importData.collection) {
    importData.collection.forEach((row: any, index: number) => {
      if (row.deviceCode && !allCodes.has(row.deviceCode)) {
        errors.push(`采集信息第${index + 2}行：设备编号"${row.deviceCode}"在基础信息中不存在`);
      }
    });
  }

  return errors;
};
