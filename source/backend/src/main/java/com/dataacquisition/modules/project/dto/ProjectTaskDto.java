package com.dataacquisition.modules.project.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 项目任务DTO
 */
@Data
@Schema(description = "项目任务")
public class ProjectTaskDto {

    @Schema(description = "任务ID")
    private Long id;

    @Schema(description = "项目ID")
    private Long projectId;

    @Schema(description = "阶段标识")
    private String stageKey;

    @Schema(description = "阶段名称")
    private String stageName;

    @Schema(description = "任务标识")
    private String taskKey;

    @Schema(description = "任务名称")
    private String name;

    @Schema(description = "任务描述")
    private String description;

    @Schema(description = "任务状态: pending-未开始, in_progress-进行中, completed-已完成, cancelled-已取消")
    private String status;

    @Schema(description = "开始日期")
    private String startDate;

    @Schema(description = "结束日期")
    private String endDate;

    @Schema(description = "进度百分比")
    private Integer progress;

    @Schema(description = "实际开始日期")
    private String actualStartDate;

    @Schema(description = "实际完成日期")
    private String actualEndDate;

    @Schema(description = "创建时间")
    private String createdAt;

    @Schema(description = "更新时间")
    private String updatedAt;
}
