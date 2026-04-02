package com.dataacquisition.modules.project.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

/**
 * 项目计划响应DTO
 */
@Data
@Schema(description = "项目计划响应")
public class ProjectPlanResponseDto {

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

    @Schema(description = "计划开始日期")
    private String startDate;

    @Schema(description = "计划结束日期")
    private String endDate;

    @Schema(description = "阶段列表")
    private List<ProjectPlanStageDto> stages;

    @Schema(description = "任务列表")
    private List<ProjectTaskDto> tasks;

    @Schema(description = "创建时间")
    private String createdAt;

    @Schema(description = "更新时间")
    private String updatedAt;
}
