package com.dataacquisition.modules.device.dto;

import lombok.Data;

/**
 * 控制器信息请求DTO
 */
@Data
public class ControllerInfoRequest {

    /**
     * 接口被占用
     */
    private Boolean isInterfaceOccupied;

    /**
     * 控制器接口类型
     */
    private String interfaceType;

    /**
     * 连接触摸屏
     */
    private Boolean hasTouchScreen;

    /**
     * 触摸屏品牌
     */
    private String touchScreenBrand;

    /**
     * 控制器品牌
     */
    private String controllerBrand;

    /**
     * 控制器型号
     */
    private String controllerModel;

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
}
