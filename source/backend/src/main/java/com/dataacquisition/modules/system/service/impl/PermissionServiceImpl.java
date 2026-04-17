package com.dataacquisition.modules.system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dataacquisition.modules.system.entity.Permission;
import com.dataacquisition.modules.system.entity.RolePermission;
import com.dataacquisition.modules.system.mapper.PermissionMapper;
import com.dataacquisition.modules.system.mapper.RolePermissionMapper;
import com.dataacquisition.modules.system.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 权限Service实现
 */
@Service
@RequiredArgsConstructor
public class PermissionServiceImpl extends ServiceImpl<PermissionMapper, Permission> implements PermissionService {

    private final RolePermissionMapper rolePermissionMapper;

    @Override
    public List<Permission> getPermissionTree() {
        List<Permission> allPermissions = this.list(
                new LambdaQueryWrapper<Permission>()
                        .orderByAsc(Permission::getSortOrder)
        );

        return buildTree(allPermissions, null);
    }

    @Override
    public List<Permission> getByType(String type) {
        return this.list(
                new LambdaQueryWrapper<Permission>()
                        .eq(Permission::getType, type)
                        .orderByAsc(Permission::getSortOrder)
        );
    }

    @Override
    public List<Permission> getByRole(Long roleId) {
        List<Long> permissionIds = rolePermissionMapper.selectPermissionIdsByRoleId(roleId);
        if (permissionIds.isEmpty()) {
            return List.of();
        }
        return this.list(new LambdaQueryWrapper<Permission>()
                .in(Permission::getId, permissionIds)
                .orderByAsc(Permission::getSortOrder));
    }

    private List<Permission> buildTree(List<Permission> permissions, Long parentId) {
        List<Permission> tree = new ArrayList<>();

        for (Permission permission : permissions) {
            if ((parentId == null && permission.getParentId() == null) ||
                (parentId != null && parentId.equals(permission.getParentId()))) {
                permission.setChildren(buildTree(permissions, permission.getId()));
                tree.add(permission);
            }
        }

        return tree;
    }
}
