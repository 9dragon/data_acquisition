package com.dataacquisition.modules.project.controller;

import com.dataacquisition.common.response.Result;
import com.dataacquisition.modules.project.dto.ProjectPlanSummaryDto;
import com.dataacquisition.modules.project.entity.ProjectPlan;
import com.dataacquisition.modules.project.service.ProjectPlanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 项目计划Controller
 */
@Tag(name = "项目计划管理", description = "项目计划相关接口")
@RestController
@RequestMapping("/project-plans")
@RequiredArgsConstructor
public class ProjectPlanController {

    private final ProjectPlanService projectPlanService;

    /**
     * 获取所有计划列表（包含任务数和进度）
     */
    @Operation(summary = "获取所有计划列表")
    @GetMapping
    public Result<List<ProjectPlanSummaryDto>> getPlanList() {
        List<ProjectPlanSummaryDto> plans = projectPlanService.getAllPlansWithSummary();
        return Result.success(plans);
    }

    /**
     * 根据ID获取计划详情
     */
    @Operation(summary = "根据ID获取计划详情")
    @GetMapping("/{id}")
    public Result<ProjectPlan> getPlan(@PathVariable Long id) {
        ProjectPlan plan = projectPlanService.getById(id);
        if (plan == null) {
            return Result.error("计划不存在");
        }
        return Result.success(plan);
    }

    /**
     * 根据项目ID获取计划
     */
    @Operation(summary = "根据项目ID获取计划")
    @GetMapping("/project/{projectId}")
    public Result<ProjectPlan> getPlanByProjectId(@PathVariable Long projectId) {
        ProjectPlan plan = projectPlanService.getByProjectId(projectId);
        if (plan == null) {
            return Result.error("计划不存在");
        }
        return Result.success(plan);
    }

    /**
     * 创建计划
     */
    @Operation(summary = "创建计划")
    @PostMapping
    public Result<Void> createPlan(@Validated @RequestBody ProjectPlan plan) {
        boolean success = projectPlanService.createPlan(plan);
        if (!success) {
            return Result.error("创建失败");
        }
        return Result.success();
    }

    /**
     * 更新计划
     */
    @Operation(summary = "更新计划")
    @PutMapping("/{id}")
    public Result<Void> updatePlan(
            @PathVariable Long id,
            @Validated @RequestBody ProjectPlan plan) {
        plan.setId(id);
        boolean success = projectPlanService.updatePlan(plan);
        if (!success) {
            return Result.error("更新失败");
        }
        return Result.success();
    }

    /**
     * 删除计划
     */
    @Operation(summary = "删除计划")
    @DeleteMapping("/{id}")
    public Result<Void> deletePlan(@PathVariable Long id) {
        boolean success = projectPlanService.deletePlan(id);
        if (!success) {
            return Result.error("删除失败");
        }
        return Result.success();
    }
}
