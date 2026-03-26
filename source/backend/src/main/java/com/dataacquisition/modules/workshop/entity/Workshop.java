package com.dataacquisition.modules.workshop.entity;

import com.baomidou.mybatisplus.annotation.IdType;
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
     * 所属项目ID
     */
    private Long projectId;

    /**
     * 所属项目名称
     */
    private String projectName;

    /**
     * 车间编号
     */
    private String code;

    /**
     * 车间描述
     */
    private String description;

    /**
     * 排序序号
     */
    private Integer sortOrder;
}
