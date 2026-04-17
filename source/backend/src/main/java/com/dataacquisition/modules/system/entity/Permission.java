package com.dataacquisition.modules.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.dataacquisition.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

/**
 * 权限实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_permission")
public class Permission extends BaseEntity {

    /**
     * 主键
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 权限编码
     */
    private String code;

    /**
     * 权限名称
     */
    private String name;

    /**
     * 权限类型：menu-菜单, button-按钮
     */
    private String type;

    /**
     * 父权限ID
     */
    private Long parentId;

    /**
     * 前端路由路径
     */
    private String path;

    /**
     * 权限描述
     */
    private String description;

    /**
     * 排序序号
     */
    private Integer sortOrder;

    /**
     * 状态：1启用 0禁用
     */
    private Integer status;

    /**
     * 子权限列表（树形结构，不映射到数据库）
     */
    @TableField(exist = false)
    private List<Permission> children;
}
