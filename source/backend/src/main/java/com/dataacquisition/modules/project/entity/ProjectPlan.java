package com.dataacquisition.modules.project.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.dataacquisition.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * 项目计划实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_project_plan")
public class ProjectPlan extends BaseEntity {

    /**
     * 主键
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 项目ID
     */
    @TableField("project_id")
    private Long projectId;

    /**
     * 计划名称
     */
    private String name;

    /**
     * 计划描述
     */
    private String description;

    /**
     * 计划开始日期
     */
    @TableField("start_date")
    private LocalDate startDate;

    /**
     * 计划结束日期
     */
    @TableField("end_date")
    private LocalDate endDate;

    /**
     * 阶段配置JSON
     */
    @TableField("stages_json")
    private String stagesJson;

    /**
     * 项目名称（用于前端展示，数据库不存储）
     */
    @TableField(exist = false)
    private String projectName;

    /**
     * 项目编码（用于前端展示，数据库不存储）
     */
    @TableField(exist = false)
    private String projectCode;
}
