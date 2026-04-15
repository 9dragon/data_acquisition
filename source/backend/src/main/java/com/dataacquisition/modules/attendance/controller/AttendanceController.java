package com.dataacquisition.modules.attendance.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dataacquisition.common.response.Result;
import com.dataacquisition.modules.attendance.dto.AttendanceQueryDto;
import com.dataacquisition.modules.attendance.dto.CheckInRequestDto;
import com.dataacquisition.modules.attendance.dto.TodayCheckInStats;
import com.dataacquisition.modules.attendance.entity.AttendanceRecord;
import com.dataacquisition.modules.attendance.service.AttendanceExportService;
import com.dataacquisition.modules.attendance.service.AttendanceService;
import com.dataacquisition.modules.system.entity.User;
import com.dataacquisition.modules.system.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * 签到控制器
 */
@Tag(name = "签到管理", description = "签到相关接口")
@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final UserService userService;
    private final AttendanceExportService attendanceExportService;

    /**
     * 获取当前登录用户
     */
    private User getCurrentUser(UserDetails userDetails) {
        String username = userDetails.getUsername();
        User user = userService.getByUsername(username);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        return user;
    }

    /**
     * 签到打卡
     */
    @Operation(summary = "签到打卡")
    @PostMapping("/check-in")
    public Result<AttendanceRecord> checkIn(
            @Valid @RequestBody CheckInRequestDto request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        AttendanceRecord record = attendanceService.checkIn(request, user.getId());
        return Result.success(record);
    }

    /**
     * 我的签到记录
     */
    @Operation(summary = "我的签到记录")
    @GetMapping("/my-records")
    public Result<Page<AttendanceRecord>> getMyRecords(
            AttendanceQueryDto query,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        Page<AttendanceRecord> page = attendanceService.getMyRecords(user.getId(), query);
        return Result.success(page);
    }

    /**
     * 签到记录列表（管理员）
     */
    @Operation(summary = "签到记录列表")
    @GetMapping("/list")
    public Result<Page<AttendanceRecord>> getList(AttendanceQueryDto query) {
        Page<AttendanceRecord> page = attendanceService.getList(query);
        return Result.success(page);
    }

    /**
     * 签到详情
     */
    @Operation(summary = "签到详情")
    @GetMapping("/{id}")
    public Result<AttendanceRecord> getById(@PathVariable Long id) {
        AttendanceRecord record = attendanceService.getById(id);
        if (record == null) {
            return Result.error("签到记录不存在");
        }
        return Result.success(record);
    }

    /**
     * 删除签到记录
     */
    @Operation(summary = "删除签到记录")
    @DeleteMapping("/{id}")
    public Result<Void> deleteById(@PathVariable Long id) {
        Boolean success = attendanceService.deleteById(id);
        return success ? Result.success() : Result.error("删除失败");
    }

    /**
     * 获取今日签到统计
     */
    @Operation(summary = "获取今日签到统计")
    @GetMapping("/today-stats")
    public Result<TodayCheckInStats> getTodayStats(
            @AuthenticationPrincipal UserDetails userDetails,
            @Parameter(description = "项目ID") @RequestParam(required = false) Long projectId) {
        User user = getCurrentUser(userDetails);
        TodayCheckInStats stats = attendanceService.getTodayStats(user.getId(), projectId);
        return Result.success(stats);
    }

    /**
     * 获取签到配置
     */
    @Operation(summary = "获取签到配置")
    @GetMapping("/config")
    public Result<Object> getConfig() {
        Object config = attendanceService.getConfig();
        return Result.success(config);
    }

    /**
     * 导出签到记录
     */
    @Operation(summary = "导出签到记录")
    @GetMapping("/export")
    public void exportRecords(AttendanceQueryDto query, HttpServletResponse response) {
        attendanceExportService.exportToExcel(query, response);
    }
}
