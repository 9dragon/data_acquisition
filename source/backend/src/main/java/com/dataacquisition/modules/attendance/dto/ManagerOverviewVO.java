package com.dataacquisition.modules.attendance.dto;

import lombok.Data;

import java.time.LocalTime;
import java.util.List;

/**
 * 项目经理看板 - 总览VO
 */
@Data
public class ManagerOverviewVO {

    /**
     * 当前用户是否是任意项目的项目经理
     */
    private Boolean isManager;

    /**
     * 名下项目概览列表
     */
    private List<ProjectOverview> projects;

    /**
     * 聚合所有项目的最新签到流水（取前 10 条）
     */
    private List<RecentCheckIn> recentCheckIns;

    /**
     * 聚合统计
     */
    private AggregateStats aggregate;

    /**
     * 当前班次信息
     */
    private ShiftInfoVO currentShift;

    /**
     * 项目概览
     */
    @Data
    public static class ProjectOverview {
        private Long projectId;
        private String projectName;
        private String projectCode;
        private Integer totalMembers;
        private Integer checkedInMembers;
        private Integer pendingMembers;
        private Integer lateMembers;
        /**
         * 已签到比例（0-100）
         */
        private Integer checkInRate;
    }

    /**
     * 最新签到流水条目
     */
    @Data
    public static class RecentCheckIn {
        private Long recordId;
        private Long projectId;
        private String projectName;
        private Long userId;
        private String userName;
        private String checkInTime;
        private String shiftName;
        private String status;
        private String location;
        private String photoUrl;
    }

    /**
     * 聚合统计
     */
    @Data
    public static class AggregateStats {
        private Integer totalProjects;
        private Integer totalMembers;
        private Integer checkedInMembers;
        private Integer pendingMembers;
        private Integer lateMembers;
    }

    /**
     * 时段信息（用于当前班次）
     */
    @Data
    public static class ShiftInfoVO {
        private Integer index;
        private String name;
        private LocalTime startTime;
        private LocalTime endTime;
        private LocalTime lateTime;
        private Boolean isCurrent;
    }
}
