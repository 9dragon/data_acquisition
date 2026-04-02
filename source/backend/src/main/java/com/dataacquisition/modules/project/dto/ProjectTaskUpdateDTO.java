package com.dataacquisition.modules.project.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDate;

/**
 * 项目任务更新DTO
 * 用于任务进度填报
 */
@Data
@Schema(description = "项目任务更新DTO")
public class ProjectTaskUpdateDTO {

    @Schema(description = "任务状态")
    private String status;

    @Schema(description = "完成进度0-100")
    private Integer progress;

    @Schema(description = "实际开始日期")
    private LocalDate actualStartDate;

    @Schema(description = "实际完成日期")
    private LocalDate actualEndDate;

    @Schema(description = "备注")
    private String remark;
}
