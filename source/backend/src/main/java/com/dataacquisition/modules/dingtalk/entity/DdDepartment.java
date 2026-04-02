package com.dataacquisition.modules.dingtalk.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

/**
 * 钉钉部门实体
 */
@Data
@TableName("t_dd_department")
public class DdDepartment {

    /**
     * 主键ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 钉钉部门ID
     */
    private Long deptId;

    /**
     * 部门名称
     */
    private String name;

    /**
     * 父部门ID
     */
    private Long parentId;

    /**
     * 是否自动创建部门群
     */
    private Boolean createDeptGroup;

    /**
     * 是否自动添加成员
     */
    private Boolean autoAddUser;

    /**
     * 创建时间
     */
    private String createTime;

    /**
     * 更新时间
     */
    private String updateTime;
}
