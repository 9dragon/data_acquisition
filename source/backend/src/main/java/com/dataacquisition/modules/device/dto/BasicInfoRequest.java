package com.dataacquisition.modules.device.dto;

import lombok.Data;

/**
 * 基础信息请求DTO
 */
@Data
public class BasicInfoRequest {

    /**
     * 项目ID
     */
    private Long projectId;

    /**
     * 项目名称
     */
    private String projectName;

    /**
     * 所属车间
     */
    private String workshop;

    /**
     * 设备类型
     */
    private String deviceType;

    /**
     * 数量
     */
    private Integer quantity;

    /**
     * 设备厂商
     */
    private String deviceManufacturer;

    /**
     * 备注
     */
    private String remarks;
}
