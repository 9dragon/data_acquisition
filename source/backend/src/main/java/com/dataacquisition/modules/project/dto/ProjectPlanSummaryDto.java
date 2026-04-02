package com.dataacquisition.modules.project.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 项目计划摘要DTO
 * 用于列表页显示，包含任务数和进度信息
 */
@Data
@Schema(description = "项目计划摘要")
public class ProjectPlanSummaryDto {
    @Schema(description = "计划ID")
    private Long id;

    @Schema(description = "项目ID")
    private Long projectId;

    @Schema(description = "项目名称")
    private String projectName;

    @Schema(description = "项目编码")
    private String projectCode;

    @Schema(description = "计划名称")
    private String name;

    @Schema(description = "计划描述")
    private String description;

    @Schema(description = "开始日期")
    private String startDate;

    @Schema(description = "结束日期")
    private String endDate;

    @Schema(description = "阶段配置JSON")
    private String stagesJson;

    @Schema(description = "任务总数")
    private Integer totalTasks;

    @Schema(description = "整体进度百分比")
    private Integer overallProgress;

    @Schema(description = "创建时间")
    private String createdAt;

    @Schema(description = "更新时间")
    private String updatedAt;
}
