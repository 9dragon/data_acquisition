package com.dataacquisition.modules.system.controller;

import com.dataacquisition.common.response.Result;
import com.dataacquisition.modules.system.entity.Permission;
import com.dataacquisition.modules.system.service.PermissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 权限Controller
 */
@Tag(name = "权限管理", description = "权限查询接口")
@RestController
@RequestMapping("/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionService permissionService;

    /**
     * 获取权限列表（树形结构）
     */
    @Operation(summary = "获取权限树")
    @GetMapping
    public Result<List<Permission>> getPermissions(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer status
    ) {
        List<Permission> permissions;

        if (type != null && !type.isEmpty()) {
            permissions = permissionService.getByType(type);
        } else {
            permissions = permissionService.getPermissionTree();
        }

        return Result.success(permissions);
    }

    /**
     * 根据角色获取权限列表
     */
    @Operation(summary = "根据角色获取权限")
    @GetMapping("/role/{roleId}")
    public Result<List<Permission>> getPermissionsByRole(@PathVariable Long roleId) {
        List<Permission> permissions = permissionService.getByRole(roleId);
        return Result.success(permissions);
    }
}
