package com.dataacquisition.modules.device.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 设备任务更新DTO
 */
@Data
public class DeviceTaskUpdateDTO {

    /**
     * 是否完成
     */
    private Boolean completed;

    /**
     * 计划开始日期
     */
    private LocalDate startDate;

    /**
     * 实际开始日期
     */
    private LocalDate actualStartDate;

    /**
     * 实际完成日期
     */
    private LocalDate actualEndDate;

    /**
     * 备注
     */
    private String remark;

    /**
     * 任务资料列表
     */
    private List<TaskMaterial> materials;
}
