package com.dataacquisition.modules.system.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.dataacquisition.common.response.Result;
import com.dataacquisition.modules.attendance.service.AttendanceService;
import com.dataacquisition.modules.issue.entity.Issue;
import com.dataacquisition.modules.issue.mapper.IssueMapper;
import com.dataacquisition.modules.project.entity.ProjectTask;
import com.dataacquisition.modules.project.mapper.ProjectTaskMapper;
import com.dataacquisition.modules.system.entity.User;
import com.dataacquisition.modules.system.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 移动端统计Controller
 */
@Tag(name = "移动端统计", description = "移动端个人统计数据接口")
@RestController
@RequestMapping("/mobile/stats")
@RequiredArgsConstructor
public class MobileStatsController {

    private final AttendanceService attendanceService;
    private final ProjectTaskMapper projectTaskMapper;
    private final IssueMapper issueMapper;
    private final UserService userService;

    private User getCurrentUser(UserDetails userDetails) {
        User user = userService.getByUsername(userDetails.getUsername());
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        return user;
    }

    @Operation(summary = "获取我的统计数据")
    @GetMapping("/my")
    public Result<Map<String, Object>> getMyStats(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);

        // 签到天数
        int attendanceDays = attendanceService.getAttendanceDayCount(user.getId());

        // 我的任务数（作为负责人的任务）
        Long taskCount = projectTaskMapper.selectCount(new LambdaQueryWrapper<ProjectTask>()
                .eq(ProjectTask::getManagerId, user.getId()));

        // 我的问题数（分配给我的问题）
        Long issueCount = issueMapper.selectCount(new LambdaQueryWrapper<Issue>()
                .eq(Issue::getAssigneeId, user.getId()));

        Map<String, Object> stats = new HashMap<>();
        stats.put("attendanceDays", attendanceDays);
        stats.put("taskCount", taskCount);
        stats.put("issueCount", issueCount);
        return Result.success(stats);
    }
}
