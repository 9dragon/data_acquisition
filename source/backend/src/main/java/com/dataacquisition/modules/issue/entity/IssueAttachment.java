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
 * 问题附件实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_issue_attachment")
public class IssueAttachment extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long issueId;

    private String name;

    private String url;

    private Long size;

    private String fileType;

    private Long uploaderId;

    private LocalDateTime uploadTime;

    @TableField(exist = false)
    private String uploaderName;
}
