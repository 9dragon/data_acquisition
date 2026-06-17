package com.dataacquisition.modules.attendance.dto;

import lombok.Data;

import java.util.List;

/**
 * 项目成员今日签到状态VO
 */
@Data
public class MemberStatusVO {

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 用户姓名
     */
    private String userName;

    /**
     * 手机号
     */
    private String phone;

    /**
     * 项目内角色：MANAGER/MEMBER
     */
    private String role;

    /**
     * 是否已签到今日任意时段
     */
    private Boolean checkedIn;

    /**
     * 是否迟到（任意时段迟到即记为 true）
     */
    private Boolean hasLate;

    /**
     * 今日签到时段数（按不同 shiftIndex 去重）
     */
    private Integer checkedShifts;

    /**
     * 状态文本：CHECKED-已签到, PENDING-未签到, LATE-有迟到
     */
    private String status;

    /**
     * 首次签到时间（"HH:mm"）
     */
    private String firstCheckInTime;

    /**
     * 最近一次签到时间（"HH:mm"）
     */
    private String lastCheckInTime;

    /**
     * 今日签到记录列表
     */
    private List<AttendanceRecordVO> records;

    /**
     * 签到记录展示
     */
    @Data
    public static class AttendanceRecordVO {
        private Long id;
        private Integer shiftIndex;
        private String shiftName;
        private String checkInTime;
        private String status;
        private String location;
        private String photoUrl;
    }
}
