package com.dataacquisition.modules.issue.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dataacquisition.common.response.Result;
import com.dataacquisition.modules.issue.entity.Issue;
import com.dataacquisition.modules.issue.service.IssueService;
import com.dataacquisition.modules.system.entity.User;
import com.dataacquisition.modules.system.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 移动端问题管理Controller
 */
@Tag(name = "移动端问题管理", description = "移动端问题相关接口")
@RestController
@RequestMapping("/mobile/issues")
@RequiredArgsConstructor
public class MobileIssueController {

    private final IssueService issueService;
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
     * 获取我的问题列表（分页）
     */
    @Operation(summary = "获取我的问题列表")
    @GetMapping("/my")
    public Result<Map<String, Object>> getMyIssues(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);

        // 构建查询参数
        com.dataacquisition.modules.issue.dto.IssueQueryDTO query =
            new com.dataacquisition.modules.issue.dto.IssueQueryDTO();
        query.setPageNum(pageNum);
        query.setPageSize(pageSize);
        query.setAssigneeId(user.getId());

        // 根据状态筛选
        if (status != null && !status.isEmpty()) {
            query.setStatus(status);
        }

        Page<Issue> result = issueService.pageIssues(query);

        Map<String, Object> response = new HashMap<>();
        response.put("records", result.getRecords());
        response.put("total", result.getTotal());
        return Result.success(response);
    }

    /**
     * 获取问题详情
     */
    @Operation(summary = "获取问题详情")
    @GetMapping("/{id}")
    public Result<Issue> getById(@PathVariable Long id) {
        Issue issue = issueService.getById(id);
        if (issue == null) {
            return Result.error("问题不存在");
        }
        return Result.success(issue);
    }
}
