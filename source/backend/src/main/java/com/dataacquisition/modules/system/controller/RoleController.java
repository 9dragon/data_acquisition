package com.dataacquisition.modules.system.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.dataacquisition.common.response.Result;
import com.dataacquisition.modules.system.entity.Role;
import com.dataacquisition.modules.system.entity.Permission;
import com.dataacquisition.modules.system.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 角色Controller
 */
@Tag(name = "角色管理", description = "角色CRUD和权限分配接口")
@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    /**
     * 分页查询角色列表
     */
    @Operation(summary = "分页查询角色")
    @GetMapping
    public Result<IPage<Role>> getRolePage(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String code
    ) {
        IPage<Role> rolePage = roleService.getRolePage(page, pageSize, name, code);
        return Result.success(rolePage);
    }

    /**
     * 根据ID获取角色
     */
    @Operation(summary = "获取角色详情")
    @GetMapping("/{id}")
    public Result<Role> getRoleById(@PathVariable Long id) {
        Role role = roleService.getById(id);
        if (role == null) {
            return Result.error(4004, "角色不存在");
        }
        return Result.success(role);
    }

    /**
     * 创建角色
     */
    @Operation(summary = "创建角色")
    @PostMapping
    public Result<Role> createRole(@RequestBody Role role) {
        Boolean success = roleService.createRole(role);
        return success ? Result.success(role) : Result.error(2001, "创建失败");
    }

    /**
     * 更新角色
     */
    @Operation(summary = "更新角色")
    @PutMapping("/{id}")
    public Result<Void> updateRole(@PathVariable Long id, @RequestBody Role role) {
        role.setId(id);
        Boolean success = roleService.updateRole(role);
        return success ? Result.success() : Result.error(2002, "更新失败");
    }

    /**
     * 删除角色
     */
    @Operation(summary = "删除角色")
    @DeleteMapping("/{id}")
    public Result<Void> deleteRole(@PathVariable Long id) {
        Boolean success = roleService.deleteRole(id);
        return success ? Result.success() : Result.error(2003, "删除失败");
    }

    /**
     * 分配权限
     */
    @Operation(summary = "分配角色权限")
    @PostMapping("/{id}/permissions")
    public Result<Void> assignPermissions(
            @PathVariable Long id,
            @RequestBody Map<String, List<Long>> request
    ) {
        List<Long> permissionIds = request.get("permissionIds");
        Boolean success = roleService.assignPermissions(id, permissionIds);
        return success ? Result.success() : Result.error(2004, "分配失败");
    }

    /**
     * 获取角色的权限ID列表
     */
    @Operation(summary = "获取角色权限")
    @GetMapping("/{id}/permissions")
    public Result<List<Long>> getRolePermissions(@PathVariable Long id) {
        List<Long> permissionIds = roleService.getRolePermissionIds(id);
        return Result.success(permissionIds);
    }

    /**
     * 获取角色权限详情
     */
    @Operation(summary = "获取角色权限详情")
    @GetMapping("/{id}/permissions-detail")
    public Result<List<Permission>> getRolePermissionsDetail(@PathVariable Long id) {
        List<Permission> permissions = roleService.getRolePermissionsDetail(id);
        return Result.success(permissions);
    }

    /**
     * 获取角色权限数量
     */
    @Operation(summary = "获取角色权限数量")
    @GetMapping("/{id}/permission-count")
    public Result<Integer> getPermissionCount(@PathVariable Long id) {
        Integer count = roleService.getPermissionCount(id);
        return Result.success(count);
    }
}
