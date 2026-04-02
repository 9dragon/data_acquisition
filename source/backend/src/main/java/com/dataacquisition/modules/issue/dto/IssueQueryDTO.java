package com.dataacquisition.modules.issue.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class IssueQueryDTO {
    private Integer pageNum = 1;
    private Integer pageSize = 10;
    private String keyword;
    private Long projectId;
    private Long deviceId;
    private String type;
    private String priority;
    private String status;
    private Long reporterId;
    private Long assigneeId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String sortField = "create_time";
    private String sortOrder = "desc";
}
