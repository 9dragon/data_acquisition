package com.dataacquisition.modules.issue.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class IssueCreateDTO {
    private String title;
    private String type;
    private String priority;
    private String description;
    private Long projectId;
    private Long deviceId;
    private Long assigneeId;
    private List<Long> ccUserIds;
    private LocalDate dueDate;
    private List<IssueAttachmentDTO> attachments;
}

@Data
class IssueAttachmentDTO {
    private String name;
    private String url;
    private Long size;
    private String fileType;
}
