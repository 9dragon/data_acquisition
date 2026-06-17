package com.dataacquisition.modules.project.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

/**
 * 项目成员批量添加请求
 */
@Data
@Schema(description = "项目成员批量添加请求")
public class ProjectMemberAddDto {

    @Schema(description = "用户ID列表")
    private List<Long> userIds;

    @Schema(description = "角色：MANAGER=项目经理, MEMBER=普通成员", example = "MEMBER")
    private String role;
}
