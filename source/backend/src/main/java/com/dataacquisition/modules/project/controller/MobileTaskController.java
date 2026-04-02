package com.dataacquisition.modules.project.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dataacquisition.common.response.Result;
import com.dataacquisition.modules.project.entity.ProjectTask;
import com.dataacquisition.modules.project.service.ProjectTaskService;
import com.dataacquisition.modules.system.entity.User;
import com.dataacquisition.modules.system.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 移动端任务管理Controller
 */
@Tag(name = "移动端任务管理", description = "移动端任务相关接口")
@RestController
@RequestMapping("/mobile/tasks")
@RequiredArgsConstructor
public class MobileTaskController {

    private final ProjectTaskService projectTaskService;
    private final UserService userService;

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
     * 获取我的任务列表（分页）
     */
    @Operation(summary = "获取我的任务列表")
    @GetMapping("/my")
    public Result<Map<String, Object>> getMyTasks(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);

        Page<ProjectTask> page = new Page<>(pageNum, pageSize);
        Page<ProjectTask> result = projectTaskService.pageMyTasks(page, user.getId(), status);

        Map<String, Object> response = new HashMap<>();
        response.put("records", result.getRecords());
        response.put("total", result.getTotal());
        return Result.success(response);
    }

    /**
     * 获取任务详情
     */
    @Operation(summary = "获取任务详情")
    @GetMapping("/{id}")
    public Result<ProjectTask> getById(@PathVariable Long id) {
        ProjectTask task = projectTaskService.getTaskDetail(id);
        if (task == null) {
            return Result.error("任务不存在");
        }
        return Result.success(task);
    }
}
