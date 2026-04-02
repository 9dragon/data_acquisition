package com.dataacquisition.modules.device.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 多媒体附件DTO
 */
@Data
public class MediaAttachment {

    /**
     * 文件唯一标识
     */
    private String id;

    /**
     * 文件名
     */
    private String name;

    /**
     * 文件URL
     */
    private String url;

    /**
     * 文件类型：image=图片, video=视频
     */
    private String type;

    /**
     * 文件大小（字节）
     */
    private Long size;

    /**
     * 上传时间
     */
    private LocalDateTime uploadTime;
}
