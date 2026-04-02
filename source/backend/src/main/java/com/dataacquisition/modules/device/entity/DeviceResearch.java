package com.dataacquisition.modules.device.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.dataacquisition.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * 设备调研实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_device_research")
public class DeviceResearch extends BaseEntity {

    /**
     * 主键
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 关联设备ID（可选）
     */
    private Long deviceId;

    /**
     * 设备编号
     */
    private String deviceCode;

    /**
     * 设备名称
     */
    private String deviceName;

    /**
     * 所属项目ID
     */
    private Long projectId;

    /**
     * 项目名称
     */
    private String projectName;

    /**
     * 设备类型
     */
    private String deviceType;

    /**
     * 所属车间
     */
    private String workshop;

    /**
     * 数量
     */
    private Integer quantity;

    /**
     * 设备厂商
     */
    private String deviceManufacturer;

    /**
     * 控制器接口是否被占用
     */
    private Boolean isInterfaceOccupied;

    /**
     * 控制器接口类型
     */
    private String interfaceType;

    /**
     * 是否连接触摸屏
     */
    private Boolean hasTouchScreen;

    /**
     * 控制器品牌
     */
    private String controllerBrand;

    /**
     * 控制器型号
     */
    private String controllerModel;

    /**
     * 触摸屏品牌
     */
    private String touchScreenBrand;

    /**
     * 是否提供点位表
     */
    private Boolean hasPointTable;

    /**
     * 是否提供PLC源程序
     */
    private Boolean hasPlcSource;

    /**
     * 是否提供触摸屏源程序
     */
    private Boolean hasTouchScreenSource;

    /**
     * 控制器照片（JSON数组）
     */
    private String controllerPhotos;

    /**
     * 控制器视频（JSON数组）
     */
    private String controllerVideos;

    /**
     * 触摸屏照片（JSON数组）
     */
    private String touchscreenPhotos;

    /**
     * 触摸屏视频（JSON数组）
     */
    private String touchscreenVideos;

    /**
     * 控制柜照片（JSON数组）
     */
    private String cabinetPhotos;

    /**
     * 控制柜视频（JSON数组）
     */
    private String cabinetVideos;

    /**
     * 采集设备状态
     */
    private Boolean collectDeviceStatus;

    /**
     * 采集工艺参数
     */
    private Boolean collectProcessParams;

    /**
     * 需采集数据项（JSON数组）
     */
    private String dataItems;

    /**
     * 需采集数据项明细
     */
    private String dataItemsDetail;

    /**
     * 采集产量/节拍
     */
    private Boolean collectProduction;

    /**
     * 采集能耗
     */
    private Boolean collectEnergy;

    /**
     * 基础信息是否完成
     */
    private Boolean basicCompleted;

    /**
     * 控制器信息是否完成
     */
    private Boolean controllerCompleted;

    /**
     * 采集信息是否完成
     */
    private Boolean collectionCompleted;

    /**
     * 调研进度（0-100）
     */
    private Integer researchProgress;

    /**
     * 调研人员ID
     */
    private Long researcherId;

    /**
     * 调研人员姓名
     */
    private String researcherName;

    /**
     * 调研日期
     */
    private LocalDate researchDate;

    /**
     * 备注
     */
    private String remarks;
}
