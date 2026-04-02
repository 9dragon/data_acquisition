package com.dataacquisition.modules.dingtalk.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * 钉钉部门DTO
 */
@Data
public class DingTalkDeptDto {

    /**
     * 部门ID
     */
    @JsonProperty("dept_id")
    private Long deptId;

    /**
     * 部门名称
     */
    private String name;

    /**
     * 父部门ID
     */
    @JsonProperty("parent_id")
    private Long parentId;

    /**
     * 是否自动创建部门群
     */
    @JsonProperty("create_dept_group")
    private Boolean createDeptGroup;

    /**
     * 是否自动添加成员
     */
    @JsonProperty("auto_add_user")
    private Boolean autoAddUser;

    /**
     * 部门标识
     */
    @JsonProperty("source_identifier")
    private String sourceIdentifier;
}
