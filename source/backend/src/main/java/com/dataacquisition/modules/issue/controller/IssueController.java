package com.dataacquisition.modules.issue.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dataacquisition.common.response.Result;
import com.dataacquisition.modules.issue.dto.IssueCreateDTO;
import com.dataacquisition.modules.issue.dto.IssueQueryDTO;
import com.dataacquisition.modules.issue.entity.Issue;
import com.dataacquisition.modules.issue.entity.IssueComment;
import com.dataacquisition.modules.issue.entity.IssueStatusHistory;
import com.dataacquisition.modules.issue.service.IssueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 问题管理Controller
 */
@Tag(name = "问题管理", description = "问题相关接口")
@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;

    @Operation(summary = "分页查询问题列表")
    @GetMapping
    public Result<Page<Issue>> page(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer pageNum,
            @Parameter(description = "每页条数") @RequestParam(defaultValue = "10") Integer pageSize,
            @Parameter(description = "关键词") @RequestParam(required = false) String keyword,
            @Parameter(description = "项目ID") @RequestParam(required = false) Long projectId,
            @Parameter(description = "设备ID") @RequestParam(required = false) Long deviceId,
            @Parameter(description = "问题类型") @RequestParam(required = false) String type,
            @Parameter(description = "优先级") @RequestParam(required = false) String priority,
            @Parameter(description = "状态") @RequestParam(required = false) String status,
            @Parameter(description = "报告人ID") @RequestParam(required = false) Long reporterId,
            @Parameter(description = "负责人ID") @RequestParam(required = false) Long assigneeId,
            @Parameter(description = "排序字段") @RequestParam(defaultValue = "create_time") String sortField,
            @Parameter(description = "排序方式") @RequestParam(defaultValue = "desc") String sortOrder) {
        
        IssueQueryDTO query = new IssueQueryDTO();
        query.setPageNum(pageNum);
        query.setPageSize(pageSize);
        query.setKeyword(keyword);
        query.setProjectId(projectId);
        query.setDeviceId(deviceId);
        query.setType(type);
        query.setPriority(priority);
        query.setStatus(status);
        query.setReporterId(reporterId);
        query.setAssigneeId(assigneeId);
        query.setSortField(sortField);
        query.setSortOrder(sortOrder);
        
        Page<Issue> page = issueService.pageIssues(query);
        return Result.success(page);
    }

    @Operation(summary = "获取问题详情")
    @GetMapping("/{id}")
    public Result<Issue> getById(@PathVariable Long id) {
        Issue issue = issueService.getById(id);
        if (issue == null) {
            return Result.error("问题不存在");
        }
        return Result.success(issue);
    }

    @Operation(summary = "创建问题")
    @PostMapping
    public Result<Issue> create(@Validated @RequestBody IssueCreateDTO dto, 
            @RequestParam(defaultValue = "1") Long reporterId) {
        Issue issue = issueService.create(dto, reporterId);
        return Result.success(issue);
    }

    @Operation(summary = "更新问题")
    @PutMapping("/{id}")
    public Result<Issue> update(@PathVariable Long id, @Validated @RequestBody Issue issue) {
        issue.setId(id);
        Issue result = issueService.update(issue);
        return Result.success(result);
    }

    @Operation(summary = "删除问题")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        boolean success = issueService.delete(id);
        if (!success) {
            return Result.error("问题不存在");
        }
        return Result.success();
    }

    @Operation(summary = "分配负责人")
    @PostMapping("/{id}/assign")
    public Result<Issue> assign(@PathVariable Long id, 
            @RequestParam Long assigneeId,
            @RequestParam(defaultValue = "1") Long operatorId) {
        Issue issue = issueService.assign(id, assigneeId, operatorId);
        return Result.success(issue);
    }

    @Operation(summary = "更新状态")
    @PutMapping("/{id}/status")
    public Result<Issue> updateStatus(@PathVariable Long id, 
            @RequestParam String status,
            @RequestParam(defaultValue = "1") Long operatorId,
            @RequestParam(required = false) String remark) {
        Issue issue = issueService.updateStatus(id, status, operatorId, remark);
        return Result.success(issue);
    }

    @Operation(summary = "添加评论")
    @PostMapping("/{id}/comments")
    public Result<IssueComment> addComment(@PathVariable Long id,
            @RequestParam String content,
            @RequestParam(defaultValue = "1") Long authorId,
            @RequestParam(defaultValue = "false") Boolean isInternal) {
        IssueComment comment = issueService.addComment(id, content, authorId, isInternal);
        return Result.success(comment);
    }

    @Operation(summary = "获取评论列表")
    @GetMapping("/{id}/comments")
    public Result<List<IssueComment>> getComments(@PathVariable Long id) {
        List<IssueComment> comments = issueService.getComments(id);
        return Result.success(comments);
    }

    @Operation(summary = "获取状态变更历史")
    @GetMapping("/{id}/history")
    public Result<List<IssueStatusHistory>> getHistory(@PathVariable Long id) {
        List<IssueStatusHistory> history = issueService.getStatusHistory(id);
        return Result.success(history);
    }

    @Operation(summary = "我的待处理问题")
    @GetMapping("/my/todo")
    public Result<List<Issue>> myTodo(@RequestParam Long userId) {
        List<Issue> issues = issueService.getMyTodo(userId);
        return Result.success(issues);
    }

    @Operation(summary = "我提交的问题")
    @GetMapping("/my/reported")
    public Result<List<Issue>> myReported(@RequestParam Long userId) {
        List<Issue> issues = issueService.getMyReported(userId);
        return Result.success(issues);
    }

    @Operation(summary = "抄送给我的问题")
    @GetMapping("/my/cc")
    public Result<List<Issue>> myCc(@RequestParam Long userId) {
        List<Issue> issues = issueService.getMyCc(userId);
        return Result.success(issues);
    }

    @Operation(summary = "问题统计")
    @GetMapping("/stats")
    public Result<Map<String, Object>> stats() {
        Map<String, Object> stats = issueService.getStats();
        return Result.success(stats);
    }
}
