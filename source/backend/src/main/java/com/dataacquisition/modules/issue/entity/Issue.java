package com.dataacquisition.modules.issue.entity;

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
 * 问题实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_issue")
public class Issue extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String code;

    private String title;

    private String type;

    private String priority;

    private String status;

    private String description;

    private Long projectId;

    private Long deviceId;

    private Long reporterId;

    private Long assigneeId;

    private String ccUsers;

    private LocalDate dueDate;

    private LocalDateTime resolvedAt;

    private LocalDateTime closedAt;

    private String closedReason;

    @TableField(exist = false)
    private String projectName;

    @TableField(exist = false)
    private String deviceName;

    @TableField(exist = false)
    private String reporterName;

    @TableField(exist = false)
    private String assigneeName;
}
