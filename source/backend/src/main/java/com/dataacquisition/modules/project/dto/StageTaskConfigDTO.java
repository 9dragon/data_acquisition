package com.dataacquisition.modules.project.dto;

import lombok.Data;

/**
 * 阶段任务配置DTO
 * 用于接收前端提交的任务配置信息
 */
@Data
public class StageTaskConfigDTO {

    /**
     * 任务唯一标识
     */
    private String key;

    /**
     * 任务名称
     */
    private String name;

    /**
     * 任务描述
     */
    private String description;

    /**
     * 任务权重
     */
    private Integer weight;

    /**
     * 是否启用
     */
    private Boolean enabled;

    /**
     * 任务开始日期
     */
    private String startDate;

    /**
     * 任务结束日期
     */
    private String endDate;

    /**
     * 任务负责人ID
     */
    private Integer managerId;

    /**
     * 任务参与人ID列表
     */
    private Long[] participantIds;
}
