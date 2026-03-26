package com.dataacquisition.modules.project.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.dataacquisition.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 项目实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_project")
public class Project extends BaseEntity {

    /**
     * 主键
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 项目编号
     */
    private String code;

    /**
     * 项目名称
     */
    private String name;

    /**
     * 项目描述
     */
    private String description;

    /**
     * 项目阶段：presale=售前调研, planning=准备阶段, construction=施工阶段, configuration=配置阶段, verification=核对阶段, acceptance=验收阶段
     */
    private String stage;

    /**
     * 项目状态：0=未开始, 1=进行中, 2=暂停, 3=已完成, 4=已取消
     */
    private Integer status;

    /**
     * 优先级：0=低, 1=中, 2=高, 3=紧急
     */
    private Integer priority;

    /**
     * 项目负责人ID
     */
    private Long managerId;

    /**
     * 项目负责人姓名
     */
    private String managerName;

    /**
     * 团队成员ID列表（逗号分隔）
     */
    private String teamMembers;

    /**
     * 总体进度 0-100
     */
    private Integer progress;

    /**
     * 阶段配置列表（JSON格式存储）
     */
    private String stageConfigs;

    /**
     * 开始时间
     */
    private String startDate;

    /**
     * 结束时间
     */
    private String endDate;

    /**
     * 计划结束时间
     */
    private String plannedEndDate;

    /**
     * 设备数量
     */
    private Integer deviceCount;

    /**
     * 已完成设备数量
     */
    private Integer completedDeviceCount;

    /**
     * 问题数量
     */
    private Integer issueCount;

    /**
     * 文档数量
     */
    private Integer documentCount;

    /**
     * 标签列表（逗号分隔）
     */
    private String tags;
}
