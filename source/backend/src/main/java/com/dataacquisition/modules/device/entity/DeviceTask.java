package com.dataacquisition.modules.device.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.dataacquisition.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 设备任务实体
 * 用于存储按设备推进的任务进度
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_device_task")
public class DeviceTask extends BaseEntity {

    /**
     * 主键
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 设备ID
     */
    @TableField("device_id")
    private Long deviceId;

    /**
     * 设备名称（不存储，通过JOIN查询）
     */
    @TableField(exist = false)
    private String deviceName;

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
     * 阶段标识：preparation=准备, construction=施工, configuration=配置, verification=核对
     */
    @TableField("stage_key")
    private String stageKey;

    /**
     * 阶段名称（用于前端展示，数据库不存储，通过JOIN t_stage查询）
     */
    @TableField(exist = false)
    private String stageName;

    /**
     * 任务唯一标识
     */
    @TableField("task_key")
    private String taskKey;

    /**
     * 任务名称
     */
    @TableField("task_name")
    private String taskName;

    /**
     * 是否完成
     */
    private Boolean completed;

    /**
     * 计划开始日期
     */
    @TableField("start_date")
    private LocalDateTime startDate;

    /**
     * 计划完成日期
     */
    @TableField("end_date")
    private LocalDateTime endDate;


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
     * 备注
     */
    private String remark;

    /**
     * 任务资料（JSON格式存储）
     */
    private String materials;

    /**
     * 项目名称（不存储，通过JOIN查询）
     */
    @TableField(exist = false)
    private String projectName;

    /**
     * 负责人名称（不存储，通过JOIN查询）
     */
    @TableField(exist = false)
    private String managerName;

    /**
     * 参与人名称列表（不存储，通过JOIN查询）
     */
    @TableField(exist = false)
    private String participantNames;
}
