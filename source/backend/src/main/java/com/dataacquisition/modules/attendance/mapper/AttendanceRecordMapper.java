package com.dataacquisition.modules.attendance.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.dataacquisition.modules.attendance.entity.AttendanceRecord;
import org.apache.ibatis.annotations.Mapper;

/**
 * 签到记录Mapper
 */
@Mapper
public interface AttendanceRecordMapper extends BaseMapper<AttendanceRecord> {
}
