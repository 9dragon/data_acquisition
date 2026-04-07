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
import com.dataacquisition.modules.attendance.mapper.AttendanceRecordMapper;
import com.dataacquisition.modules.attendance.service.AttendanceService;
import com.dataacquisition.modules.system.entity.User;
import com.dataacquisition.modules.system.service.SystemConfigService;
import com.dataacquisition.modules.system.service.UserService;
import com.dataacquisition.service.MinioService;
import com.dataacquisition.service.WatermarkService;
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
    private final WatermarkService watermarkService;

    @Override
    @Transactional
    public AttendanceRecord checkIn(CheckInRequestDto request, Long userId) {
        // 获取用户信息
        User user = userService.getById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        // 获取签到配置
        cn.hutool.json.JSONObject config = systemConfigService.getConfigJson("attendance.check_times");
        if (config == null) {
            throw new RuntimeException("签到配置未设置");
        }

        // 获取时段配置
        cn.hutool.json.JSONArray shiftsArray = config.getJSONArray("shifts");
        if (shiftsArray == null || shiftsArray.isEmpty()) {
            throw new RuntimeException("签到时段配置未设置");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalTime currentTime = now.toLocalTime();
        LocalDate today = now.toLocalDate();

        // 找到当前时段
        cn.hutool.json.JSONObject currentShiftConfig = null;
        int shiftIndex = 0;
        for (int i = 0; i < shiftsArray.size(); i++) {
            cn.hutool.json.JSONObject shift = shiftsArray.getJSONObject(i);
            LocalTime startTime = LocalTime.parse(shift.getStr("startTime"));
            LocalTime endTime = LocalTime.parse(shift.getStr("endTime"));

            if (!currentTime.isBefore(startTime) && !currentTime.isAfter(endTime)) {
                currentShiftConfig = shift;
                shiftIndex = i + 1;
                break;
            }
        }

        if (currentShiftConfig == null) {
            throw new RuntimeException("当前不在任何打卡时段内");
        }

        // 检查当前时段是否已打卡
        LocalDateTime todayStart = today.atStartOfDay();
        LocalDateTime todayEnd = todayStart.plusDays(1);

        Long shiftCount = attendanceRecordMapper.selectCount(new LambdaQueryWrapper<AttendanceRecord>()
            .eq(AttendanceRecord::getUserId, userId)
            .eq(AttendanceRecord::getShiftIndex, shiftIndex)
            .between(AttendanceRecord::getCheckInTime, todayStart, todayEnd));

        if (shiftCount > 0) {
            throw new RuntimeException(currentShiftConfig.getStr("name") + "已打卡");
        }

        // 处理照片上传
        String originalPhotoUrl = null;
        String watermarkPhotoUrl = null;
        if (StrUtil.isNotBlank(request.getPhoto())) {
            // 如果是Base64，上传原始照片到MinIO
            if (request.getPhoto().startsWith("data:image")) {
                originalPhotoUrl = minioService.uploadBase64Image(request.getPhoto(), "attendance/original");
            } else {
                originalPhotoUrl = request.getPhoto();
            }

            // 添加水印
            watermarkPhotoUrl = addWatermarkToPhoto(originalPhotoUrl, user, request, now);
        }

        // 判断是否迟到
        LocalTime lateTime = LocalTime.parse(currentShiftConfig.getStr("lateTime"));
        boolean isLate = currentTime.isAfter(lateTime);

        // 创建签到记录
        AttendanceRecord record = new AttendanceRecord();
        record.setProjectId(request.getProjectId());
        record.setUserId(userId);
        record.setUserName(user.getName());
        record.setCheckInTime(now);
        record.setPhotoUrl(watermarkPhotoUrl != null ? watermarkPhotoUrl : originalPhotoUrl);
        record.setOriginalPhotoUrl(originalPhotoUrl);
        record.setWatermarkPhotoUrl(watermarkPhotoUrl);
        record.setLocation(request.getLocation());
        record.setLatitude(request.getLatitude());
        record.setLongitude(request.getLongitude());
        record.setAddress(request.getAddress());
        record.setStatus(isLate ? "LATE" : "NORMAL");
        record.setIsLate(isLate ? 1 : 0);
        record.setShiftIndex(shiftIndex);
        record.setShiftName(currentShiftConfig.getStr("name"));
        record.setRemark(request.getRemark());

        attendanceRecordMapper.insert(record);

        log.info("用户签到成功: userId={}, userName={}, shift={}, isLate={}", userId, user.getName(), currentShiftConfig.getStr("name"), isLate);
        return record;
    }

    /**
     * 为照片添加水印
     */
    private String addWatermarkToPhoto(String photoUrl, User user, CheckInRequestDto request, LocalDateTime checkInTime) {
        try {
            // 获取水印配置
            cn.hutool.json.JSONObject watermarkConfig = systemConfigService.getConfigJson("attendance.watermark");
            if (watermarkConfig == null || !watermarkConfig.getBool("enabled", true)) {
                return photoUrl;
            }

            // 构建水印信息
            WatermarkService.WatermarkInfo info = new WatermarkService.WatermarkInfo();
            info.setUserName(user.getName());
            info.setTime(checkInTime);
            info.setLocation(request.getLocation());
            info.setPosition(watermarkConfig.getStr("position"));
            info.setFontSize(watermarkConfig.getInt("fontSize"));
            info.setColor(watermarkConfig.getStr("color"));
            info.setAlpha(watermarkConfig.getDouble("alpha"));
            info.setShowUser(watermarkConfig.getBool("showUser", true));
            info.setShowTime(watermarkConfig.getBool("showTime", true));
            info.setShowLocation(watermarkConfig.getBool("showLocation", true));

            return watermarkService.addWatermark(photoUrl, info);
        } catch (Exception e) {
            log.error("添加水印失败", e);
            return photoUrl;
        }
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

    @Override
    public TodayCheckInStats getTodayStats(Long userId) {
        // 获取签到配置
        cn.hutool.json.JSONObject config = systemConfigService.getConfigJson("attendance.check_times");
        if (config == null) {
            throw new RuntimeException("签到配置未设置");
        }

        // 获取时段配置
        cn.hutool.json.JSONArray shiftsArray = config.getJSONArray("shifts");
        if (shiftsArray == null || shiftsArray.isEmpty()) {
            throw new RuntimeException("签到时段配置未设置");
        }

        // 获取今天的签到记录
        LocalDate today = LocalDate.now();
        LocalDateTime todayStart = today.atStartOfDay();
        LocalDateTime todayEnd = todayStart.plusDays(1);

        List<AttendanceRecord> todayRecords = attendanceRecordMapper.selectList(new LambdaQueryWrapper<AttendanceRecord>()
            .eq(AttendanceRecord::getUserId, userId)
            .between(AttendanceRecord::getCheckInTime, todayStart, todayEnd)
            .orderByAsc(AttendanceRecord::getCheckInTime));

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
            shiftInfo.setName(shift.getStr("name"));
            shiftInfo.setStartTime(LocalTime.parse(shift.getStr("startTime")));
            shiftInfo.setEndTime(LocalTime.parse(shift.getStr("endTime")));
            shiftInfo.setLateTime(LocalTime.parse(shift.getStr("lateTime")));

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
            throw new RuntimeException("签到配置未设置");
        }
        return config;
    }
}
