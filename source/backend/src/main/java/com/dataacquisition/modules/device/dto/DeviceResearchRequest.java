package com.dataacquisition.modules.device.dto;

import lombok.Data;

/**
 * 设备调研创建请求DTO
 */
@Data
public class DeviceResearchRequest {

    /**
     * 项目ID
     */
    private Long projectId;

    /**
     * 设备ID（可选）
     */
    private Long deviceId;

    /**
     * 基础信息
     */
    private BasicInfoRequest basic;
}
