package com.dataacquisition.modules.project.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dataacquisition.common.response.Result;
import com.dataacquisition.modules.project.dto.ProjectPlanResponseDto;
import com.dataacquisition.modules.project.entity.Project;
import com.dataacquisition.modules.project.service.ProjectPlanService;
import com.dataacquisition.modules.project.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * 项目Controller
 */
@Tag(name = "项目管理", description = "项目相关接口")
@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final ProjectPlanService projectPlanService;

    /**
     * 分页查询项目列表
     */
    @Operation(summary = "分页查询项目列表")
    @GetMapping
    public Result<Page<Project>> pageProjects(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer pageNum,
            @Parameter(description = "每页条数") @RequestParam(defaultValue = "10") Integer pageSize,
            @Parameter(description = "关键词") @RequestParam(required = false) String keyword,
            @Parameter(description = "状态") @RequestParam(required = false) Integer status,
            @Parameter(description = "阶段") @RequestParam(required = false) String stage) {
        Page<Project> page = new Page<>(pageNum, pageSize);
        Page<Project> result = projectService.pageProjects(page, keyword, status, stage);
        return Result.success(result);
    }

    /**
     * 根据ID获取项目详情
     */
    @Operation(summary = "根据ID获取项目详情")
    @GetMapping("/{id}")
    public Result<Project> getProject(@PathVariable Long id) {
        Project project = projectService.getProjectDetail(id);
        if (project == null) {
            return Result.error("项目不存在");
        }
        return Result.success(project);
    }

    /**
     * 新增项目
     */
    @Operation(summary = "新增项目")
    @PostMapping
    public Result<Void> createProject(@Validated @RequestBody Project project) {
        projectService.save(project);
        return Result.success();
    }

    /**
     * 更新项目
     */
    @Operation(summary = "更新项目")
    @PutMapping("/{id}")
    public Result<Void> updateProject(@PathVariable Long id, @Validated @RequestBody Project project) {
        project.setId(id);
        projectService.updateById(project);
        return Result.success();
    }

    /**
     * 删除项目
     */
    @Operation(summary = "删除项目")
    @DeleteMapping("/{id}")
    public Result<Void> deleteProject(@PathVariable Long id) {
        projectService.removeById(id);
        return Result.success();
    }

    /**
     * 获取项目完整计划（含阶段、任务）
     */
    @Operation(summary = "获取项目完整计划")
    @GetMapping("/{id}/plan")
    public Result<ProjectPlanResponseDto> getProjectPlan(@PathVariable Long id) {
        ProjectPlanResponseDto plan = projectPlanService.getProjectPlanWithStages(id);
        if (plan == null) {
            return Result.error("项目不存在");
        }
        return Result.success(plan);
    }
}
