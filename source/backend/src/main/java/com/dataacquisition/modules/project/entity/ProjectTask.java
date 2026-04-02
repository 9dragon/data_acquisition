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
 * 项目任务实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_project_task")
public class ProjectTask extends BaseEntity {

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
     * 负责人ID
     */
    @TableField("manager_id")
    private Long managerId;

    /**
     * 参与人ID列表(逗号分隔)
     */
    @TableField("participant_ids")
    private String participantIds;

    /**
     * 阶段标识：planning=准备阶段, construction=施工阶段, configuration=配置阶段, verification=核对阶段
     */
    @TableField("stage_key")
    private String stageKey;

    /**
     * 任务唯一标识
     */
    @TableField("task_key")
    private String taskKey;

    /**
     * 任务名称
     */
    private String name;

    /**
     * 任务描述
     */
    private String description;

    /**
     * 任务状态：pending=未开始, in_progress=进行中, completed=已完成, cancelled=已取消
     */
    private String status;

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
     * 完成进度0-100
     */
    private Integer progress;

    /**
     * 实际开始日期
     */
    @TableField("actual_start_date")
    private LocalDate actualStartDate;

    /**
     * 实际完成日期
     */
    @TableField("actual_end_date")
    private LocalDate actualEndDate;

    /**
     * 负责人名称（用于前端展示，数据库不存储）
     */
    @TableField(exist = false)
    private String managerName;

    /**
     * 参与人名称列表（用于前端展示，数据库不存储）
     */
    @TableField(exist = false)
    private String participantNames;

    /**
     * 项目名称（用于前端展示，数据库不存储）
     */
    @TableField(exist = false)
    private String projectName;

    /**
     * 阶段名称（用于前端展示，数据库不存储）
     */
    @TableField(exist = false)
    private String stageName;
}
