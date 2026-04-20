package com.dataacquisition.modules.attendance.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dataacquisition.modules.attendance.dto.AttendanceQueryDto;
import com.dataacquisition.modules.attendance.dto.CheckInRequestDto;
import com.dataacquisition.modules.attendance.dto.TodayCheckInStats;
import com.dataacquisition.modules.attendance.entity.AttendanceRecord;

/**
 * 签到服务接口
 */
public interface AttendanceService {

    /**
     * 签到打卡
     *
     * @param request 签到请求
     * @param userId  用户ID
     * @return 签到记录
     */
    AttendanceRecord checkIn(CheckInRequestDto request, Long userId);

    /**
     * 获取我的签到记录
     *
     * @param userId 用户ID
     * @param query  查询条件
     * @return 签到记录分页
     */
    Page<AttendanceRecord> getMyRecords(Long userId, AttendanceQueryDto query);

    /**
     * 获取签到记录列表（管理员）
     *
     * @param query 查询条件
     * @return 签到记录分页
     */
    Page<AttendanceRecord> getList(AttendanceQueryDto query);

    /**
     * 获取签到详情
     *
     * @param id 签到记录ID
     * @return 签到记录
     */
    AttendanceRecord getById(Long id);

    /**
     * 删除签到记录
     *
     * @param id 签到记录ID
     * @return 是否成功
     */
    Boolean deleteById(Long id);

    /**
     * 获取今日签到统计
     *
     * @param userId 用户ID
     * @param projectId 项目ID（可选）
     * @return 今日统计
     */
    TodayCheckInStats getTodayStats(Long userId, Long projectId);

    /**
     * 获取签到配置
     *
     * @return 配置信息
     */
    Object getConfig();

    /**
     * 统计用户签到天数（按日期去重）
     *
     * @param userId 用户ID
     * @return 签到天数
     */
    int getAttendanceDayCount(Long userId);

    /**
     * 统计用户签到天数（按项目筛选，按日期去重）
     *
     * @param userId    用户ID
     * @param projectId 项目ID（null表示不限）
     * @return 签到天数
     */
    int getAttendanceDayCount(Long userId, Long projectId);
}
