package com.dataacquisition.modules.attendance.service.impl;

import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dataacquisition.modules.attendance.dto.AttendanceQueryDto;
import com.dataacquisition.modules.attendance.dto.CheckInRequestDto;
import com.dataacquisition.modules.attendance.dto.TodayCheckInStats;
import com.dataacquisition.modules.attendance.entity.AttendanceRecord;
import com.dataacquisition.common.exception.BusinessException;
import com.dataacquisition.modules.attendance.mapper.AttendanceRecordMapper;
import com.dataacquisition.modules.attendance.service.AttendanceService;
import com.dataacquisition.modules.project.entity.Project;
import com.dataacquisition.modules.project.service.ProjectService;
import com.dataacquisition.modules.system.entity.User;
import com.dataacquisition.modules.system.service.SystemConfigService;
import com.dataacquisition.modules.system.service.UserService;
import com.dataacquisition.service.MinioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

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
    private final SystemConfigService systemConfigService;
    private final ProjectService projectService;

    @Override
    @Transactional
    public AttendanceRecord checkIn(CheckInRequestDto request, Long userId) {
        // 获取用户信息
        User user = userService.getById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        // 获取签到配置
        cn.hutool.json.JSONObject config = systemConfigService.getConfigJson("attendance.check_times");
        if (config == null) {
            throw new BusinessException("签到配置未设置");
        }

        // 获取时段配置
        cn.hutool.json.JSONArray shiftsArray = config.getJSONArray("shifts");
        if (shiftsArray == null || shiftsArray.isEmpty()) {
            throw new BusinessException("签到时段配置未设置");
        }

        // 获取前端传递的时段索引
        Integer shiftIndex = request.getShiftIndex();
        if (shiftIndex == null || shiftIndex < 0 || shiftIndex > shiftsArray.size()) {
            throw new BusinessException("时段索引无效");
        }

        // 获取对应的时段配置
        cn.hutool.json.JSONObject shiftConfig;
        if (shiftIndex == 0) {
            // 非时段打卡
            shiftConfig = new cn.hutool.json.JSONObject();
            shiftConfig.set("name", "非时段打卡");
            shiftConfig.set("lateTime", null);
        } else {
            shiftConfig = shiftsArray.getJSONObject(shiftIndex - 1);
        }

        LocalDateTime now = LocalDateTime.now();
        LocalTime currentTime = now.toLocalTime();
        LocalDate today = now.toLocalDate();

        // 检查该时段今日是否已打卡
        LocalDateTime todayStart = today.atStartOfDay();
        LocalDateTime todayEnd = todayStart.plusDays(1);

        Long shiftCount = attendanceRecordMapper.selectCount(new LambdaQueryWrapper<AttendanceRecord>()
            .eq(AttendanceRecord::getUserId, userId)
            .eq(AttendanceRecord::getShiftIndex, shiftIndex)
            .between(AttendanceRecord::getCheckInTime, todayStart, todayEnd));

        if (shiftCount > 0) {
            throw new BusinessException(shiftConfig.getStr("name") + "已打卡");
        }

        // 处理照片上传（前端已添加水印，直接保存）
        String photoUrl = null;
        String photoPath = null;
        if (StrUtil.isNotBlank(request.getPhoto())) {
            // 如果是Base64，上传照片到MinIO
            if (request.getPhoto().startsWith("data:image")) {
                java.util.Map<String, String> uploadResult = minioService.uploadBase64ImageAndReturnPath(request.getPhoto(), "attendance");
                photoUrl = uploadResult.get("url");
                photoPath = uploadResult.get("path");
            } else {
                photoUrl = request.getPhoto();
            }
        }

        // 判断是否迟到（根据配置的lateTime判断，非时段打卡不算迟到）
        boolean isLate = false;
        String lateTimeStr = shiftConfig.getStr("lateTime");
        if (shiftIndex > 0 && lateTimeStr != null) {
            LocalTime lateTime = LocalTime.parse(lateTimeStr);
            isLate = currentTime.isAfter(lateTime);
        }

        // 创建签到记录
        AttendanceRecord record = new AttendanceRecord();
        record.setProjectId(request.getProjectId());
        record.setUserId(userId);
        record.setUserName(user.getName());
        record.setCheckInTime(now);
        record.setPhotoUrl(photoUrl);
        record.setPhotoPath(photoPath);
        record.setLocation(request.getLocation());
        record.setLatitude(request.getLatitude());
        record.setLongitude(request.getLongitude());
        record.setAddress(request.getAddress());
        record.setStatus(isLate ? "LATE" : "NORMAL");
        record.setIsLate(isLate ? 1 : 0);
        record.setShiftIndex(shiftIndex);
        record.setShiftName(shiftConfig.getStr("name"));
        record.setRemark(request.getRemark());

        attendanceRecordMapper.insert(record);

        log.info("用户签到成功: userId={}, userName={}, shift={}, isLate={}", userId, user.getName(), shiftConfig.getStr("name"), isLate);
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

        Page<AttendanceRecord> result = attendanceRecordMapper.selectPage(page, wrapper);
        refreshPhotoUrls(result);
        return result;
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

        Page<AttendanceRecord> result = attendanceRecordMapper.selectPage(page, wrapper);

        // 填充项目名称
        for (AttendanceRecord record : result.getRecords()) {
            if (record.getProjectId() != null) {
                Project project = projectService.getById(record.getProjectId());
                if (project != null) {
                    record.setProjectName(project.getName());
                }
            }
        }

        refreshPhotoUrls(result);
        return result;
    }

    @Override
    public AttendanceRecord getById(Long id) {
        AttendanceRecord record = attendanceRecordMapper.selectById(id);
        refreshPhotoUrl(record);
        return record;
    }

    @Override
    public Boolean deleteById(Long id) {
        return attendanceRecordMapper.deleteById(id) > 0;
    }

    @Override
    public TodayCheckInStats getTodayStats(Long userId, Long projectId) {
        // 获取签到配置
        cn.hutool.json.JSONObject config = systemConfigService.getConfigJson("attendance.check_times");
        if (config == null) {
            throw new BusinessException("签到配置未设置");
        }

        // 获取时段配置
        cn.hutool.json.JSONArray shiftsArray = config.getJSONArray("shifts");
        if (shiftsArray == null || shiftsArray.isEmpty()) {
            throw new BusinessException("签到时段配置未设置");
        }

        // 获取今天的签到记录
        LocalDate today = LocalDate.now();
        LocalDateTime todayStart = today.atStartOfDay();
        LocalDateTime todayEnd = todayStart.plusDays(1);

        LambdaQueryWrapper<AttendanceRecord> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(AttendanceRecord::getUserId, userId);
        queryWrapper.between(AttendanceRecord::getCheckInTime, todayStart, todayEnd);
        if (projectId != null) {
            queryWrapper.eq(AttendanceRecord::getProjectId, projectId);
        }
        queryWrapper.orderByAsc(AttendanceRecord::getCheckInTime);
        List<AttendanceRecord> todayRecords = attendanceRecordMapper.selectList(queryWrapper);

        // 构建统计结果
        TodayCheckInStats stats = new TodayCheckInStats();
        stats.setTotalShifts(shiftsArray.size());
        stats.setCheckedShifts(todayRecords.size());
        stats.setRemainingShifts(shiftsArray.size() - todayRecords.size());
        stats.setRecords(todayRecords);

        // 构建待打卡时段
        List<TodayCheckInStats.ShiftInfo> pendingShifts = new ArrayList<>();
        TodayCheckInStats.ShiftInfo currentShift = null;

        LocalTime now = LocalTime.now();
        for (int i = 0; i < shiftsArray.size(); i++) {
            cn.hutool.json.JSONObject shift = shiftsArray.getJSONObject(i);
            TodayCheckInStats.ShiftInfo shiftInfo = new TodayCheckInStats.ShiftInfo();
            shiftInfo.setIndex(i + 1);
            String startTimeStr = shift.getStr("startTime");
            String endTimeStr = shift.getStr("endTime");
            String lateTimeStr = shift.getStr("lateTime");
            if (startTimeStr == null || endTimeStr == null) {
                continue;
            }
            shiftInfo.setName(shift.getStr("name"));
            shiftInfo.setStartTime(LocalTime.parse(startTimeStr));
            shiftInfo.setEndTime(LocalTime.parse(endTimeStr));
            shiftInfo.setLateTime(lateTimeStr != null ? LocalTime.parse(lateTimeStr) : null);

            // 检查是否已打卡
            final int shiftIndex = i + 1;
            boolean checked = todayRecords.stream().anyMatch(r -> r.getShiftIndex() == shiftIndex);
            shiftInfo.setChecked(checked);

            // 检查是否当前时段
            boolean isCurrent = !now.isBefore(shiftInfo.getStartTime()) && !now.isAfter(shiftInfo.getEndTime());
            shiftInfo.setIsCurrent(isCurrent);

            if (isCurrent) {
                currentShift = shiftInfo;
            }

            // 如果已打卡，添加打卡时间
            if (checked) {
                AttendanceRecord record = todayRecords.stream()
                    .filter(r -> r.getShiftIndex() == shiftIndex)
                    .findFirst()
                    .orElse(null);
                if (record != null) {
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
                    shiftInfo.setCheckInTime(record.getCheckInTime().format(formatter));
                }
            }

            pendingShifts.add(shiftInfo);
        }

        stats.setPendingShifts(pendingShifts);
        stats.setCurrentShift(currentShift);

        return stats;
    }

    @Override
    public Object getConfig() {
        JSONObject config = systemConfigService.getConfigJson("attendance.check_times");
        if (config == null) {
            throw new BusinessException("签到配置未设置");
        }
        return config;
    }

    @Override
    public int getAttendanceDayCount(Long userId) {
        return attendanceRecordMapper.countDistinctDaysByUserId(userId);
    }

    @Override
    public int getAttendanceDayCount(Long userId, Long projectId) {
        if (projectId == null) {
            return attendanceRecordMapper.countDistinctDaysByUserId(userId);
        }
        return attendanceRecordMapper.countDistinctDaysByUserIdAndProject(userId, projectId);
    }

    @Override
    @Transactional
    public AttendanceRecord create(AttendanceRecord record) {
        if (record.getUserId() != null) {
            User user = userService.getById(record.getUserId());
            if (user != null) {
                record.setUserName(user.getName());
            }
        }
        if (record.getProjectId() != null) {
            Project project = projectService.getById(record.getProjectId());
            if (project != null) {
                record.setProjectName(project.getName());
            }
        }
        if (record.getCheckInTime() == null) {
            record.setCheckInTime(LocalDateTime.now());
        }
        attendanceRecordMapper.insert(record);
        log.info("管理员创建签到记录: id={}, userId={}, userName={}", record.getId(), record.getUserId(), record.getUserName());
        return record;
    }

    /**
     * 刷新签到记录的照片预签名URL
     */
    private void refreshPhotoUrl(AttendanceRecord record) {
        if (record != null && StrUtil.isNotBlank(record.getPhotoPath())) {
            try {
                record.setPhotoUrl(minioService.getFileUrl(record.getPhotoPath()));
            } catch (Exception e) {
                log.warn("刷新照片URL失败: {}", record.getPhotoPath(), e);
            }
        }
    }

    /**
     * 批量刷新签到记录的照片预签名URL
     */
    private void refreshPhotoUrls(Page<AttendanceRecord> page) {
        if (page != null && page.getRecords() != null) {
            for (AttendanceRecord record : page.getRecords()) {
                refreshPhotoUrl(record);
            }
        }
    }
}
