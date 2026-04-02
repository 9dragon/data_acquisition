package com.dataacquisition.modules.project.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

/**
 * 项目计划阶段DTO
 */
@Data
@Schema(description = "项目计划阶段")
public class ProjectPlanStageDto {

    @Schema(description = "阶段标识")
    private String stageKey;

    @Schema(description = "阶段名称")
    private String stageName;

    @Schema(description = "阶段描述")
    private String description;

    @Schema(description = "显示颜色")
    private String color;

    @Schema(description = "图标")
    private String icon;

    @Schema(description = "推进方式: by_task-按任务, by_device-按设备")
    private String progressMode;

    @Schema(description = "默认权重")
    private Integer defaultWeight;

    @Schema(description = "任务总数")
    private Integer taskCount;

    @Schema(description = "已完成任务数")
    private Integer completedTaskCount;

    @Schema(description = "进度百分比")
    private Integer progress;

    @Schema(description = "阶段开始日期")
    private String startDate;

    @Schema(description = "阶段结束日期")
    private String endDate;

    @Schema(description = "实际开始日期（从任务计算）")
    private String actualStartDate;

    @Schema(description = "实际结束日期（从任务计算）")
    private String actualEndDate;

    @Schema(description = "任务列表")
    private List<ProjectTaskDto> tasks;
}
