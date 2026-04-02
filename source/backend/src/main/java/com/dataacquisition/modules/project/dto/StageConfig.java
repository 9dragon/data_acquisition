package com.dataacquisition.modules.project.dto;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.util.List;

/**
 * 项目计划阶段配置DTO
 * 用于接收前端提交的阶段配置信息
 */
@Data
public class StageConfig {

    /**
     * 阶段唯一标识
     */
    private String stageKey;

    /**
     * 阶段开始日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private String startDate;

    /**
     * 阶段结束日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private String endDate;

    /**
     * 阶段负责人ID
     */
    private Long managerId;

    /**
     * 参与人员ID列表
     */
    private Long[] participantIds;

    /**
     * 阶段权重
     */
    private Integer weight;

    /**
     * 任务配置列表
     */
    private List<StageTaskConfigDTO> tasks;

    /**
     * 设备ID列表（仅by_device阶段使用）
     */
    private List<Long> deviceIds;
}
