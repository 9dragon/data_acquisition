package com.dataacquisition.modules.attendance.service.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dataacquisition.modules.attendance.dto.AttendanceQueryDto;
import com.dataacquisition.modules.attendance.dto.CheckInRequestDto;
import com.dataacquisition.modules.attendance.entity.AttendanceRecord;
import com.dataacquisition.modules.attendance.mapper.AttendanceRecordMapper;
import com.dataacquisition.modules.attendance.service.AttendanceService;
import com.dataacquisition.modules.system.entity.User;
import com.dataacquisition.modules.system.service.UserService;
import com.dataacquisition.service.MinioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * 签到服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRecordMapper attendanceRecordMapper;
    private final UserService userService;
    private final MinioService minioService;

    @Override
    @Transactional
    public AttendanceRecord checkIn(CheckInRequestDto request, Long userId) {
        // 获取用户信息
        User user = userService.getById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        // 检查今天是否已经签到
        LocalDateTime todayStart = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime todayEnd = todayStart.plusDays(1);

        Long todayCount = attendanceRecordMapper.selectCount(new LambdaQueryWrapper<AttendanceRecord>()
            .eq(AttendanceRecord::getUserId, userId)
            .between(AttendanceRecord::getCheckInTime, todayStart, todayEnd));

        if (todayCount > 0) {
            throw new RuntimeException("今天已经签到过了");
        }

        // 处理照片上传
        String photoUrl = null;
        if (StrUtil.isNotBlank(request.getPhoto())) {
            // 如果是Base64，上传到MinIO
            if (request.getPhoto().startsWith("data:image")) {
                photoUrl = minioService.uploadBase64Image(request.getPhoto(), "attendance");
            } else {
                photoUrl = request.getPhoto();
            }
        }

        // 判断签到状态
        String status = "NORMAL";
        LocalDateTime now = LocalDateTime.now();
        int hour = now.getHour();
        if (hour >= 9) {
            status = "LATE";
        }

        // 创建签到记录
        AttendanceRecord record = new AttendanceRecord();
        record.setProjectId(request.getProjectId());
        record.setUserId(userId);
        record.setUserName(user.getName());
        record.setCheckInTime(now);
        record.setPhotoUrl(photoUrl);
        record.setLocation(request.getLocation());
        record.setLatitude(request.getLatitude());
        record.setLongitude(request.getLongitude());
        record.setAddress(request.getAddress());
        record.setStatus(status);
        record.setRemark(request.getRemark());

        attendanceRecordMapper.insert(record);

        log.info("用户签到成功: userId={}, userName={}, status={}", userId, user.getName(), status);
        return record;
    }

    @Override
    public Page<AttendanceRecord> getMyRecords(Long userId, AttendanceQueryDto query) {
        Page<AttendanceRecord> page = new Page<>(query.getPageNum(), query.getPageSize());

        LambdaQueryWrapper<AttendanceRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AttendanceRecord::getUserId, userId);

        // 日期范围筛选
        if (query.getStartDate() != null) {
            wrapper.ge(AttendanceRecord::getCheckInTime, query.getStartDate().atStartOfDay());
        }
        if (query.getEndDate() != null) {
            wrapper.le(AttendanceRecord::getCheckInTime, query.getEndDate().plusDays(1).atStartOfDay());
        }

        wrapper.orderByDesc(AttendanceRecord::getCheckInTime);

        return attendanceRecordMapper.selectPage(page, wrapper);
    }

    @Override
    public Page<AttendanceRecord> getList(AttendanceQueryDto query) {
        Page<AttendanceRecord> page = new Page<>(query.getPageNum(), query.getPageSize());

        LambdaQueryWrapper<AttendanceRecord> wrapper = new LambdaQueryWrapper<>();

        // 项目筛选
        if (query.getProjectId() != null) {
            wrapper.eq(AttendanceRecord::getProjectId, query.getProjectId());
        }

        // 用户筛选
        if (query.getUserId() != null) {
            wrapper.eq(AttendanceRecord::getUserId, query.getUserId());
        }

        // 状态筛选
        if (StrUtil.isNotBlank(query.getStatus())) {
            wrapper.eq(AttendanceRecord::getStatus, query.getStatus());
        }

        // 日期范围筛选
        if (query.getStartDate() != null) {
            wrapper.ge(AttendanceRecord::getCheckInTime, query.getStartDate().atStartOfDay());
        }
        if (query.getEndDate() != null) {
            wrapper.le(AttendanceRecord::getCheckInTime, query.getEndDate().plusDays(1).atStartOfDay());
        }

        wrapper.orderByDesc(AttendanceRecord::getCheckInTime);

        return attendanceRecordMapper.selectPage(page, wrapper);
    }

    @Override
    public AttendanceRecord getById(Long id) {
        return attendanceRecordMapper.selectById(id);
    }

    @Override
    public Boolean deleteById(Long id) {
        return attendanceRecordMapper.deleteById(id) > 0;
    }
}
