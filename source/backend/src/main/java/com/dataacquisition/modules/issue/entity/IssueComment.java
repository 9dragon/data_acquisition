package com.dataacquisition.modules.issue.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.dataacquisition.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 问题评论实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_issue_comment")
public class IssueComment extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long issueId;

    private String content;

    private Long authorId;

    private Boolean isInternal;

    @TableField(exist = false)
    private String authorName;
}
