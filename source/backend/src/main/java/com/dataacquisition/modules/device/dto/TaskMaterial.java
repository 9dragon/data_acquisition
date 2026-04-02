package com.dataacquisition.modules.device.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 任务资料DTO
 * 用于存储任务相关的资料收集信息
 */
@Data
public class TaskMaterial {

    /**
     * 资料需求唯一标识
     */
    private String requirementKey;

    /**
     * 资料名称
     */
    private String requirementName;

    /**
     * 已上传的文件列表
     */
    private List<MediaAttachment> files;

    /**
     * 是否已完成
     */
    private Boolean completed;

    /**
     * 完成日期
     */
    private LocalDateTime completedDate;
}
