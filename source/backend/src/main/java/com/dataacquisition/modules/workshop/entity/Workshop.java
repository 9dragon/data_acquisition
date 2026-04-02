package com.dataacquisition.modules.workshop.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.dataacquisition.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 车间实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_workshop")
public class Workshop extends BaseEntity {

    /**
     * 主键
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 车间名称
     */
    private String name;

    /**
     * 车间编号
     */
    private String code;

    /**
     * 所属项目ID
     */
    @TableField("project_id")
    private Long projectId;

    /**
     * 所属项目名称
     * 注意：数据库表中无此字段，使用 @TableField(exist = false) 标记
     */
    @TableField(exist = false)
    private String projectName;

    /**
     * 车间描述
     */
    private String description;

    /**
     * 排序序号
     * 注意：数据库表中无此字段，使用 @TableField(exist = false) 标记
     */
    @TableField(exist = false)
    private Integer sortOrder;
}
