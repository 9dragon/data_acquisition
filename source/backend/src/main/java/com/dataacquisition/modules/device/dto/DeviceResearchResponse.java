package com.dataacquisition.modules.device.dto;

import lombok.Data;

/**
 * 设备调研响应DTO
 */
@Data
public class DeviceResearchResponse {

    /**
     * 调研ID
     */
    private Long id;

    /**
     * 项目ID
     */
    private Long projectId;

    /**
     * 项目名称
     */
    private String projectName;

    /**
     * 设备ID
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
     * 设备类型
     */
    private String deviceType;

    /**
     * 所属车间
     */
    private String workshop;

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
     * 调研进度
     */
    private Integer researchProgress;
}
