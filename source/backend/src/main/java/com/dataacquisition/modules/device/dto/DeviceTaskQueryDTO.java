package com.dataacquisition.modules.device.dto;

import lombok.Data;

/**
 * 设备任务查询DTO
 */
@Data
public class DeviceTaskQueryDTO {

    /**
     * 关键字搜索（设备名称、任务名称）
     */
    private String keyword;

    /**
     * 项目ID
     */
    private Long projectId;

    /**
     * 阶段标识
     */
    private String stageKey;

    /**
     * 是否完成
     */
    private Boolean completed;

    /**
     * 设备ID
     */
    private Long deviceId;

    /**
     * 页码
     */
    private Integer pageNum = 1;

    /**
     * 页大小
     */
    private Integer pageSize = 10;
}
