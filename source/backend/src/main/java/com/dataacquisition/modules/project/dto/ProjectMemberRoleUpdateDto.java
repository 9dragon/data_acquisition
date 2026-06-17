package com.dataacquisition.modules.project.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 项目成员角色更新请求
 */
@Data
@Schema(description = "项目成员角色更新请求")
public class ProjectMemberRoleUpdateDto {

    @Schema(description = "角色：MANAGER=项目经理, MEMBER=普通成员")
    private String role;
}
