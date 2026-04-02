package com.dataacquisition.modules.dingtalk.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * 钉钉用户信息DTO
 */
@Data
public class DingTalkUserInfoDto {

    /**
     * 钉钉userId
     */
    @JsonProperty("userid")
    private String userid;

    /**
     * 钉钉unionid
     */
    private String unionid;

    /**
     * 姓名
     */
    private String name;

    /**
     * 头像
     */
    private String avatar;

    /**
     * 手机号
     */
    private String mobile;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 工号
     */
    private String jobNumber;

    /**
     * 职位
     */
    private String title;

    /**
     * 部门ID列表
     */
    @JsonProperty("dept_id_list")
    private Long[] deptIdList;

    /**
     * 部门顺序
     */
    @JsonProperty("dept_order_list")
    private Long[] deptOrderList;

    /**
     * 激活状态
     */
    private Boolean active;

    /**
     * 是否是管理员
     */
    private Boolean admin;
}
