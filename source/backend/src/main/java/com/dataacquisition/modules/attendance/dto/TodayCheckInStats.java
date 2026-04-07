package com.dataacquisition.modules.attendance.dto;

import com.dataacquisition.modules.attendance.entity.AttendanceRecord;
import lombok.Data;

import java.time.LocalTime;
import java.util.List;

/**
 * 今日签到统计
 */
@Data
public class TodayCheckInStats {
    /**
     * 总时段数
     */
    private Integer totalShifts;

    /**
     * 已打卡时段数
     */
    private Integer checkedShifts;

    /**
     * 剩余时段数
     */
    private Integer remainingShifts;

    /**
     * 已打卡记录
     */
    private List<AttendanceRecord> records;

    /**
     * 待打卡时段
     */
    private List<ShiftInfo> pendingShifts;

    /**
     * 当前时段
     */
    private ShiftInfo currentShift;

    /**
     * 时段信息
     */
    @lombok.Data
    public static class ShiftInfo {
        /**
         * 时段索引
         */
        private Integer index;

        /**
         * 时段名称
         */
        private String name;

        /**
         * 开始时间
         */
        private LocalTime startTime;

        /**
         * 结束时间
         */
        private LocalTime endTime;

        /**
         * 迟到时间点
         */
        private LocalTime lateTime;

        /**
         * 是否已打卡
         */
        private Boolean checked;

        /**
         * 打卡时间
         */
        private String checkInTime;

        /**
         * 是否当前时段
         */
        private Boolean isCurrent;
    }
}
