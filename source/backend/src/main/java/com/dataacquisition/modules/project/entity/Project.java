package com.dataacquisition.modules.project.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
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
     * 注意：数据库暂无此字段，使用 @TableField(exist = false) 标记
     */
    @TableField(exist = false)
    private String stage;

    /**
     * 项目状态：0=未开始, 1=进行中, 2=暂停, 3=已完成, 4=已取消
     * 注意：数据库状态定义：0=待启动, 1=进行中, 2=已完成, 3=已取消
     */
    private Integer status;

    /**
     * 优先级：0=低, 1=中, 2=高, 3=紧急
     */
    private Integer priority;

    /**
     * 项目负责人姓名（非数据库字段，由 t_project_member(role=MANAGER) 关联 t_user 动态填充）
     */
    @TableField(exist = false)
    private String managerName;

    /**
     * 项目负责人用户ID（非数据库字段，用于表单提交，由后端写入 t_project_member(MANAGER)）
     */
    @TableField(exist = false)
    private Long managerUserId;

    /**
     * 团队成员ID列表（逗号分隔）
     * 注意：数据库暂无此字段，使用 @TableField(exist = false) 标记
     */
    @TableField(exist = false)
    private String teamMembers;

    /**
     * 总体进度 0-100
     * 注意：数据库暂无此字段，使用 @TableField(exist = false) 标记
     */
    @TableField(exist = false)
    private Integer progress;

    /**
     * 阶段配置列表（JSON格式存储）
     * 注意：数据库暂无此字段，使用 @TableField(exist = false) 标记
     */
    @TableField(exist = false)
    private String stageConfigs;

    /**
     * 开始时间
     */
    @TableField("start_date")
    private String startDate;

    /**
     * 结束时间
     */
    @TableField("end_date")
    private String endDate;

    /**
     * 计划结束时间
     * 注意：数据库暂无此字段，使用 @TableField(exist = false) 标记
     */
    @TableField(exist = false)
    private String plannedEndDate;

    /**
     * 设备数量
     * 注意：数据库暂无此字段，使用 @TableField(exist = false) 标记
     */
    @TableField(exist = false)
    private Integer deviceCount;

    /**
     * 已完成设备数量
     * 注意：数据库暂无此字段，使用 @TableField(exist = false) 标记
     */
    @TableField(exist = false)
    private Integer completedDeviceCount;

    /**
     * 问题数量
     * 注意：数据库暂无此字段，使用 @TableField(exist = false) 标记
     */
    @TableField(exist = false)
    private Integer issueCount;

    /**
     * 文档数量
     * 注意：数据库暂无此字段，使用 @TableField(exist = false) 标记
     */
    @TableField(exist = false)
    private Integer documentCount;

    /**
     * 标签列表（逗号分隔）
     * 注意：数据库暂无此字段，使用 @TableField(exist = false) 标记
     */
    @TableField(exist = false)
    private String tags;
}
