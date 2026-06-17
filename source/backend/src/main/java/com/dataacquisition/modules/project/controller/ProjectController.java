package com.dataacquisition.modules.project.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dataacquisition.common.dto.OptionDto;
import com.dataacquisition.common.exception.BusinessException;
import com.dataacquisition.common.response.Result;
import com.dataacquisition.modules.project.dto.ProjectMemberAddDto;
import com.dataacquisition.modules.project.dto.ProjectMemberRoleUpdateDto;
import com.dataacquisition.modules.project.dto.ProjectPlanResponseDto;
import com.dataacquisition.modules.project.entity.Project;
import com.dataacquisition.modules.project.entity.ProjectMember;
import com.dataacquisition.modules.project.service.ProjectMemberService;
import com.dataacquisition.modules.project.service.ProjectPlanService;
import com.dataacquisition.modules.project.service.ProjectService;
import com.dataacquisition.modules.system.entity.User;
import com.dataacquisition.modules.system.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    private final ProjectMemberService projectMemberService;
    private final UserService userService;

    /**
     * 获取当前登录用户
     */
    private User getCurrentUser(UserDetails userDetails) {
        String username = userDetails.getUsername();
        User user = userService.getByUsername(username);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        return user;
    }

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
     * 获取项目选项列表（用于下拉选择器）
     */
    @Operation(summary = "获取项目选项列表")
    @GetMapping("/options")
    public Result<List<OptionDto>> getProjectOptions(
            @Parameter(description = "关键词") @RequestParam(required = false) String keyword) {
        List<OptionDto> options = projectService.getProjectOptions(keyword);
        return Result.success(options);
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
    public Result<Long> createProject(
            @Validated @RequestBody Project project,
            @AuthenticationPrincipal UserDetails userDetails) {
        // managerUserId 不入库（瞬态），单独写入 t_project_member
        Long managerUserId = project.getManagerUserId();
        project.setManagerUserId(null);
        projectService.save(project);
        if (managerUserId != null) {
            Long operatorId = userDetails != null ? getCurrentUser(userDetails).getId() : null;
            projectMemberService.setProjectManager(project.getId(), managerUserId, operatorId);
        }
        return Result.success(project.getId());
    }

    /**
     * 更新项目
     */
    @Operation(summary = "更新项目")
    @PutMapping("/{id}")
    public Result<Void> updateProject(
            @PathVariable Long id,
            @Validated @RequestBody Project project,
            @AuthenticationPrincipal UserDetails userDetails) {
        project.setId(id);
        // managerUserId 不入库（瞬态），单独维护 t_project_member
        Long managerUserId = project.getManagerUserId();
        project.setManagerUserId(null);
        // managerName 也是瞬态字段，避免被当作更新条件
        project.setManagerName(null);
        projectService.updateById(project);
        if (managerUserId != null) {
            Long operatorId = userDetails != null ? getCurrentUser(userDetails).getId() : null;
            projectMemberService.setProjectManager(id, managerUserId, operatorId);
        }
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

    /**
     * 获取项目成员列表
     */
    @Operation(summary = "获取项目成员列表")
    @GetMapping("/{id}/members")
    public Result<List<ProjectMember>> listMembers(@PathVariable Long id) {
        List<ProjectMember> members = projectMemberService.listMembersByProject(id);
        return Result.success(members);
    }

    /**
     * 批量添加项目成员
     */
    @Operation(summary = "批量添加项目成员")
    @PostMapping("/{id}/members")
    public Result<Integer> addMembers(
            @PathVariable Long id,
            @Validated @RequestBody ProjectMemberAddDto request,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (request.getUserIds() == null || request.getUserIds().isEmpty()) {
            return Result.error("用户列表不能为空");
        }
        String role = (request.getRole() == null || request.getRole().isEmpty()) ? "MEMBER" : request.getRole();
        Long operatorId = userDetails != null ? getCurrentUser(userDetails).getId() : null;
        int count = projectMemberService.addMembers(id, request.getUserIds(), role, operatorId);
        return Result.success(count);
    }

    /**
     * 修改项目成员角色
     */
    @Operation(summary = "修改项目成员角色")
    @PutMapping("/{id}/members/{userId}")
    public Result<Void> updateMemberRole(
            @PathVariable Long id,
            @PathVariable Long userId,
            @Validated @RequestBody ProjectMemberRoleUpdateDto request) {
        if (request.getRole() == null || request.getRole().isEmpty()) {
            return Result.error("角色不能为空");
        }
        boolean ok = projectMemberService.updateMemberRole(id, userId, request.getRole());
        return ok ? Result.success() : Result.error("成员不存在");
    }

    /**
     * 移除项目成员
     */
    @Operation(summary = "移除项目成员")
    @DeleteMapping("/{id}/members/{userId}")
    public Result<Void> removeMember(
            @PathVariable Long id,
            @PathVariable Long userId) {
        boolean ok = projectMemberService.removeMember(id, userId);
        return ok ? Result.success() : Result.error("成员不存在");
    }
}
