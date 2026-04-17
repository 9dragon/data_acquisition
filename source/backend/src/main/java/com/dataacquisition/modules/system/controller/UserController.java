package com.dataacquisition.modules.system.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dataacquisition.common.dto.OptionDto;
import com.dataacquisition.common.response.Result;
import com.dataacquisition.modules.system.entity.User;
import com.dataacquisition.modules.system.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 用户Controller
 */
@Tag(name = "用户管理", description = "用户相关接口")
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * 分页查询用户列表
     */
    @Operation(summary = "分页查询用户列表")
    @GetMapping
    public Result<Page<User>> pageUsers(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer pageNum,
            @Parameter(description = "每页条数") @RequestParam(defaultValue = "10") Integer pageSize,
            @Parameter(description = "关键词") @RequestParam(required = false) String keyword,
            @Parameter(description = "状态") @RequestParam(required = false) Integer status) {
        Page<User> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(User::getName, keyword)
                    .or()
                    .like(User::getUsername, keyword));
        }

        if (status != null) {
            wrapper.eq(User::getStatus, status);
        }

        wrapper.orderByDesc(User::getCreatedAt);

        userService.page(page, wrapper);
        page.getRecords().forEach(user -> user.setRoleIds(userService.getUserRoleIds(user.getId())));
        return Result.success(page);
    }

    /**
     * 获取用户选项列表（用于下拉选择器）
     */
    @Operation(summary = "获取用户选项列表")
    @GetMapping("/options")
    public Result<List<OptionDto>> getUserOptions(
            @Parameter(description = "关键词") @RequestParam(required = false) String keyword) {
        List<OptionDto> options = userService.getUserOptions(keyword);
        return Result.success(options);
    }

    /**
     * 根据ID获取用户详情
     */
    @Operation(summary = "根据ID获取用户详情")
    @GetMapping("/{id}")
    public Result<User> getUser(@PathVariable Long id) {
        User user = userService.getById(id);
        if (user == null) {
            return Result.error("用户不存在");
        }
        user.setPassword(null);
        user.setRoleIds(userService.getUserRoleIds(id));
        return Result.success(user);
    }

    /**
     * 新增用户
     */
    @Operation(summary = "新增用户")
    @PostMapping
    public Result<User> createUser(@Validated @RequestBody User user) {
        userService.createUser(user);
        User created = userService.getByUsername(user.getUsername());
        created.setPassword(null);
        return Result.success(created);
    }

    /**
     * 更新用户
     */
    @Operation(summary = "更新用户")
    @PutMapping("/{id}")
    public Result<Void> updateUser(@PathVariable Long id, @Validated @RequestBody User user) {
        user.setId(id);
        userService.updateUser(user);
        return Result.success();
    }

    /**
     * 删除用户
     */
    @Operation(summary = "删除用户")
    @DeleteMapping("/{id}")
    public Result<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return Result.success();
    }

    /**
     * 重置密码
     */
    @Operation(summary = "重置用户密码")
    @PutMapping("/{id}/reset-password")
    public Result<Void> resetPassword(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String newPassword = request.get("password");
        userService.resetPassword(id, newPassword);
        return Result.success();
    }

    /**
     * 获取当前用户的项目
     */
    @Operation(summary = "获取当前用户的项目")
    @GetMapping("/current-project")
    public Result<Object> getCurrentProject(@AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails.getUsername();
        User user = userService.getByUsername(username);
        if (user == null) {
            return Result.error("用户不存在");
        }
        if (user.getCurrentProjectId() == null) {
            return Result.error("用户未设置当前项目");
        }
        Object project = userService.getCurrentProject(user.getCurrentProjectId());
        if (project == null) {
            return Result.error("项目不存在");
        }
        return Result.success(project);
    }

    /**
     * 设置当前用户的项目
     */
    @Operation(summary = "设置当前用户的项目")
    @PostMapping("/current-project")
    public Result<Void> setCurrentProject(
            @RequestBody Map<String, Long> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails.getUsername();
        User user = userService.getByUsername(username);
        if (user == null) {
            return Result.error("用户不存在");
        }
        Long projectId = request.get("projectId");
        if (projectId == null) {
            return Result.error("项目ID不能为空");
        }
        userService.setCurrentProject(user.getId(), projectId);
        return Result.success();
    }

    /**
     * 切换用户状态
     */
    @Operation(summary = "切换用户状态")
    @PutMapping("/{id}/toggle-status")
    public Result<Void> toggleStatus(@PathVariable Long id) {
        userService.toggleStatus(id);
        return Result.success();
    }

    /**
     * 获取用户的角色ID列表
     */
    @Operation(summary = "获取用户的角色ID列表")
    @GetMapping("/{id}/roles")
    public Result<List<Long>> getUserRoles(@PathVariable Long id) {
        List<Long> roleIds = userService.getUserRoleIds(id);
        return Result.success(roleIds);
    }

    /**
     * 分配角色（覆盖式）
     */
    @Operation(summary = "分配角色（覆盖式）")
    @PutMapping("/{id}/roles")
    public Result<Void> assignRoles(@PathVariable Long id, @RequestBody Map<String, List<Long>> request) {
        List<Long> roleIds = request.get("roleIds");
        if (roleIds == null) {
            roleIds = List.of();
        }
        userService.assignRoles(id, roleIds);
        return Result.success();
    }
}
