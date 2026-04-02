package com.dataacquisition.modules.project.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dataacquisition.common.response.Result;
import com.dataacquisition.modules.project.dto.ProjectTaskUpdateDTO;
import com.dataacquisition.modules.project.entity.ProjectTask;
import com.dataacquisition.modules.project.service.ProjectTaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 项目任务Controller
 */
@Tag(name = "项目任务管理", description = "项目任务相关接口")
@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class ProjectTaskController {

    private final ProjectTaskService projectTaskService;

    /**
     * 分页查询项目的任务列表
     */
    @Operation(summary = "分页查询项目的任务列表")
    @GetMapping("/project/{projectId}")
    public Result<Page<ProjectTask>> pageTasks(
            @Parameter(description = "项目ID") @PathVariable Long projectId,
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer pageNum,
            @Parameter(description = "每页条数") @RequestParam(defaultValue = "10") Integer pageSize,
            @Parameter(description = "阶段标识") @RequestParam(required = false) String stageKey,
            @Parameter(description = "任务状态") @RequestParam(required = false) String status) {
        Page<ProjectTask> page = new Page<>(pageNum, pageSize);
        Page<ProjectTask> result = projectTaskService.pageTasks(page, projectId, stageKey, status);
        return Result.success(result);
    }

    /**
     * 根据项目ID获取所有任务（不分页）
     */
    @Operation(summary = "根据项目ID获取所有任务")
    @GetMapping("/project/{projectId}/all")
    public Result<List<ProjectTask>> getTasksByProjectId(
            @Parameter(description = "项目ID") @PathVariable Long projectId) {
        List<ProjectTask> tasks = projectTaskService.getTasksByProjectId(projectId);
        return Result.success(tasks);
    }

    /**
     * 根据项目ID和阶段标识获取任务列表
     */
    @Operation(summary = "根据项目ID和阶段标识获取任务列表")
    @GetMapping("/project/{projectId}/stage/{stageKey}")
    public Result<List<ProjectTask>> getTasksByProjectIdAndStageKey(
            @Parameter(description = "项目ID") @PathVariable Long projectId,
            @Parameter(description = "阶段标识") @PathVariable String stageKey) {
        List<ProjectTask> tasks = projectTaskService.getTasksByProjectIdAndStageKey(projectId, stageKey);
        return Result.success(tasks);
    }

    /**
     * 根据ID获取任务详情
     */
    @Operation(summary = "根据ID获取任务详情")
    @GetMapping("/{id}")
    public Result<ProjectTask> getTask(@PathVariable Long id) {
        ProjectTask task = projectTaskService.getTaskDetail(id);
        if (task == null) {
            return Result.error("任务不存在");
        }
        return Result.success(task);
    }

    /**
     * 创建任务
     */
    @Operation(summary = "创建任务")
    @PostMapping
    public Result<Void> createTask(@Validated @RequestBody ProjectTask task) {
        boolean success = projectTaskService.createTask(task);
        if (!success) {
            return Result.error("创建失败");
        }
        return Result.success();
    }

    /**
     * 更新任务
     */
    @Operation(summary = "更新任务")
    @PutMapping("/{id}")
    public Result<Void> updateTask(
            @PathVariable Long id,
            @Validated @RequestBody ProjectTask task) {
        task.setId(id);
        boolean success = projectTaskService.updateTask(task);
        if (!success) {
            return Result.error("更新失败");
        }
        return Result.success();
    }

    /**
     * 更新任务进度
     */
    @Operation(summary = "更新任务进度")
    @PutMapping("/{id}/progress")
    public Result<Void> updateTaskProgress(
            @PathVariable Long id,
            @Validated @RequestBody ProjectTaskUpdateDTO updateDTO) {
        boolean success = projectTaskService.updateTaskProgress(id, updateDTO);
        if (!success) {
            return Result.error("更新失败");
        }
        return Result.success();
    }

    /**
     * 删除任务
     */
    @Operation(summary = "删除任务")
    @DeleteMapping("/{id}")
    public Result<Void> deleteTask(@PathVariable Long id) {
        boolean success = projectTaskService.deleteTask(id);
        if (!success) {
            return Result.error("删除失败");
        }
        return Result.success();
    }

    /**
     * 批量删除任务
     */
    @Operation(summary = "批量删除任务")
    @DeleteMapping("/batch")
    public Result<Void> batchDeleteTasks(@RequestBody List<Long> ids) {
        boolean success = projectTaskService.batchDeleteTasks(ids);
        if (!success) {
            return Result.error("批量删除失败");
        }
        return Result.success();
    }

    /**
     * 分页查询所有项目的任务列表（跨项目查询，用于任务列表页面）
     */
    @Operation(summary = "分页查询所有项目的任务列表")
    @GetMapping("/all-projects")
    public Result<Page<ProjectTask>> pageAllProjectTasks(
            @Parameter(description = "关键字搜索") @RequestParam(required = false) String keyword,
            @Parameter(description = "任务状态") @RequestParam(required = false) String status,
            @Parameter(description = "项目ID（可选，用于筛选特定项目）") @RequestParam(required = false) Long projectId,
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer pageNum,
            @Parameter(description = "每页条数") @RequestParam(defaultValue = "10") Integer pageSize) {
        Page<ProjectTask> page = new Page<>(pageNum, pageSize);
        Page<ProjectTask> result = projectTaskService.pageAllProjectTasks(page, keyword, status, projectId);
        return Result.success(result);
    }
}
