package com.dataacquisition.modules.system.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.util.List;

/**
 * 阶段任务模板
 */
@Data
@TableName("stage_task_template")
public class StageTaskTemplate {

    /**
     * 任务ID
     */
    private String id;

    /**
     * 任务唯一标识
     */
    private String key;

    /**
     * 任务名称
     */
    private String name;

    /**
     * 任务描述
     */
    private String description;

    /**
     * 默认权重
     */
    private Integer defaultWeight;

    /**
     * 资料需求列表
     */
    @TableField(typeHandler = com.dataacquisition.common.handler.JsonTypeHandler.class)
    private java.util.List<MaterialRequirement> materialRequirements;
}
