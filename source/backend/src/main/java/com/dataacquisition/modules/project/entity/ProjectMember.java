package com.dataacquisition.modules.project.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.dataacquisition.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 项目-成员关系实体（多对多）
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_project_member")
public class ProjectMember extends BaseEntity {

    /**
     * 主键
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 项目ID
     */
    private Long projectId;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 角色：MANAGER=项目经理, MEMBER=普通成员
     */
    private String role;

    /**
     * 是否有效：0=已退出, 1=有效
     */
    private Integer isActive;

    /**
     * 加入时间
     */
    private LocalDateTime joinedAt;

    /**
     * 备注
     */
    private String remark;

    /**
     * 用户姓名（非数据库字段，用于展示）
     */
    @TableField(exist = false)
    private String userName;

    /**
     * 用户手机号（非数据库字段，用于展示）
     */
    @TableField(exist = false)
    private String userPhone;

    /**
     * 项目名称（非数据库字段，用于展示）
     */
    @TableField(exist = false)
    private String projectName;

    /**
     * 项目编号（非数据库字段，用于展示）
     */
    @TableField(exist = false)
    private String projectCode;
}
