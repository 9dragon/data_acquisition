package com.dataacquisition.modules.attendance.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.dataacquisition.modules.attendance.entity.AttendanceRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

/**
 * 签到记录Mapper
 */
@Mapper
public interface AttendanceRecordMapper extends BaseMapper<AttendanceRecord> {

    /**
     * 统计用户签到天数（按日期去重）
     */
    @Select("SELECT COUNT(DISTINCT DATE(check_in_time)) FROM t_attendance_record WHERE user_id = #{userId}")
    int countDistinctDaysByUserId(Long userId);
}
