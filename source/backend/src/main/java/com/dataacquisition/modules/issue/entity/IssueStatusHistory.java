package com.dataacquisition.modules.issue.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.dataacquisition.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 问题状态变更历史实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_issue_status_history")
public class IssueStatusHistory extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long issueId;

    private String fromStatus;

    private String toStatus;

    private Long operatorId;

    private String remark;

    @TableField(exist = false)
    private String operatorName;
}
