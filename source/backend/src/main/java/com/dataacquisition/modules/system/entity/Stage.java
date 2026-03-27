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
 * 项目阶段实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_stage")
public class Stage extends BaseEntity {

    /**
     * 主键
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 阶段唯一标识
     */
    @TableField("`key`")
    private String key;

    /**
     * 阶段名称
     */
    private String name;

    /**
     * 阶段描述
     */
    private String description;

    /**
     * 图标
     */
    private String icon;

    /**
     * 显示颜色
     */
    private String color;

    /**
     * 推进方式：by_task-按任务, by_device-按设备
     */
    @TableField("progress_mode")
    private String progressMode;

    /**
     * 是否系统预置
     */
    @TableField("is_system")
    private Integer isSystem;

    /**
     * 默认权重
     */
    @TableField("default_weight")
    private Integer defaultWeight;

    /**
     * 任务模板（JSON字段）
     */
    @TableField(value = "task_templates", typeHandler = com.dataacquisition.common.handler.JsonTypeHandler.class)
    private java.util.List<StageTaskTemplate> taskTemplates;

    /**
     * 排序序号
     */
    @TableField("sort_order")
    private Integer sortOrder;

    /**
     * 状态
     */
    private Integer status;
}
