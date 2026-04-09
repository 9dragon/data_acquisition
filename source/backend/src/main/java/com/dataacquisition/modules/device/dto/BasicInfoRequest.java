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
     * 设备类型ID
     */
    private String deviceTypeId;

    /**
     * 车间ID
     */
    private String workshopId;

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
