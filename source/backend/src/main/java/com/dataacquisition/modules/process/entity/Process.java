package com.dataacquisition.modules.process.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.dataacquisition.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 工序实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_process")
public class Process extends BaseEntity {

    /**
     * 主键
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 工序名称
     */
    private String name;

    /**
     * 所属项目ID
     */
    @TableField("project_id")
    private Long projectId;

    /**
     * 所属项目名称（非数据库字段，用于展示）
     */
    @TableField(exist = false)
    private String projectName;

    /**
     * 所属车间ID
     */
    @TableField("workshop_id")
    private Long workshopId;

    /**
     * 工序编号
     */
    private String code;

    /**
     * 工序描述
     */
    private String description;

    /**
     * 排序序号
     */
    @TableField("sequence_no")
    private Integer sortOrder;
}
