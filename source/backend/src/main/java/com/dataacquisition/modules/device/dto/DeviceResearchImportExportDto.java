package com.dataacquisition.modules.device.dto;

import com.alibaba.excel.annotation.ExcelProperty;
import com.alibaba.excel.annotation.write.style.ColumnWidth;
import com.alibaba.excel.annotation.write.style.ContentRowHeight;
import com.alibaba.excel.annotation.write.style.HeadRowHeight;
import lombok.Data;

/**
 * 设备调研导入导出DTO
 * <p>
 * 设计原则：导出的数据可以直接再次导入，无需手动修改
 * - 关联字段使用名称而非ID（项目名称、设备类型名称、车间名称）
 * - 布尔值使用"是/否"格式
 * - JSON数组使用逗号分隔格式
 */
@Data
@HeadRowHeight(30)      // 表头行高30磅
@ContentRowHeight(50)   // 内容行行高50磅
public class DeviceResearchImportExportDto {

    // ========== 基础信息区域 ==========

    /**
     * 项目名称
     * 导入时：根据名称查找项目ID
     * 导出时：从关联查询获取项目名称
     */
    @ExcelProperty("项目名称")
    @ColumnWidth(25)
    private String projectName;

    /**
     * 设备类型名称
     * 导入时：根据名称查找设备类型ID
     * 导出时：从关联查询获取设备类型名称
     */
    @ExcelProperty("设备类型名称")
    @ColumnWidth(20)
    private String deviceTypeName;

    /**
     * 车间名称
     * 导入时：根据名称查找车间ID
     * 导出时：从关联查询获取车间名称
     */
    @ExcelProperty("车间名称")
    @ColumnWidth(20)
    private String workshopName;

    /**
     * 数量
     */
    @ExcelProperty("数量")
    @ColumnWidth(10)
    private Integer quantity;

    /**
     * 设备厂商
     */
    @ExcelProperty("设备厂商")
    @ColumnWidth(20)
    private String deviceManufacturer;

    /**
     * 备注
     */
    @ExcelProperty("备注")
    @ColumnWidth(30)
    private String remarks;

    // ========== 控制器信息区域 ==========

    /**
     * 接口被占用
     * 格式：是/否
     */
    @ExcelProperty("接口被占用")
    @ColumnWidth(12)
    private String isInterfaceOccupied;

    /**
     * 接口类型
     * 示例：RJ45、RS232、RS485
     */
    @ExcelProperty("接口类型")
    @ColumnWidth(15)
    private String interfaceType;

    /**
     * 连接触摸屏
     * 格式：是/否
     */
    @ExcelProperty("连接触摸屏")
    @ColumnWidth(12)
    private String hasTouchScreen;

    /**
     * 控制器品牌
     * 示例：西门子、三菱、欧姆龙
     */
    @ExcelProperty("控制器品牌")
    @ColumnWidth(15)
    private String controllerBrand;

    /**
     * 控制器型号
     * 示例：S7-1200、FX3U
     */
    @ExcelProperty("控制器型号")
    @ColumnWidth(20)
    private String controllerModel;

    /**
     * 触摸屏品牌
     * 示例：威纶通、昆仑通态
     */
    @ExcelProperty("触摸屏品牌")
    @ColumnWidth(15)
    private String touchScreenBrand;

    /**
     * 提供点位表
     * 格式：是/否
     */
    @ExcelProperty("提供点位表")
    @ColumnWidth(12)
    private String hasPointTable;

    /**
     * 提供PLC源程序
     * 格式：是/否
     */
    @ExcelProperty("提供PLC源程序")
    @ColumnWidth(15)
    private String hasPlcSource;

    /**
     * 提供触摸屏源程序
     * 格式：是/否
     */
    @ExcelProperty("提供触摸屏源程序")
    @ColumnWidth(18)
    private String hasTouchScreenSource;

    // ========== 采集信息区域 ==========

    /**
     * 采集设备状态
     * 格式：是/否
     */
    @ExcelProperty("采集设备状态")
    @ColumnWidth(15)
    private String collectDeviceStatus;

    /**
     * 采集工艺参数
     * 格式：是/否
     */
    @ExcelProperty("采集工艺参数")
    @ColumnWidth(15)
    private String collectProcessParams;

    /**
     * 需采集数据项
     * 格式：多个数据项用逗号分隔
     * 示例：温度,压力,流量
     */
    @ExcelProperty("需采集数据项")
    @ColumnWidth(30)
    private String dataItems;

    /**
     * 数据项明细说明
     */
    @ExcelProperty("数据项明细说明")
    @ColumnWidth(40)
    private String dataItemsDetail;

    /**
     * 采集产量/节拍
     * 格式：是/否
     */
    @ExcelProperty("采集产量/节拍")
    @ColumnWidth(15)
    private String collectProduction;

    /**
     * 采集能耗
     * 格式：是/否
     */
    @ExcelProperty("采集能耗")
    @ColumnWidth(12)
    private String collectEnergy;
}
