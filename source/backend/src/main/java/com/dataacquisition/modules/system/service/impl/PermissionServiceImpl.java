package com.dataacquisition.modules.system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dataacquisition.modules.system.entity.Permission;
import com.dataacquisition.modules.system.entity.Role;
import com.dataacquisition.modules.system.entity.User;
import com.dataacquisition.modules.system.mapper.PermissionMapper;
import com.dataacquisition.modules.system.mapper.RoleMapper;
import com.dataacquisition.modules.system.mapper.RolePermissionMapper;
import com.dataacquisition.modules.system.mapper.UserMapper;
import com.dataacquisition.modules.system.mapper.UserRoleMapper;
import com.dataacquisition.modules.system.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 权限Service实现
 */
@Service
@RequiredArgsConstructor
public class PermissionServiceImpl extends ServiceImpl<PermissionMapper, Permission> implements PermissionService {

    private final RolePermissionMapper rolePermissionMapper;
    private final UserRoleMapper userRoleMapper;
    private final UserMapper userMapper;
    private final RoleMapper roleMapper;

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

    private static final String ADMIN_CODE = "admin";

    @Override
    public List<String> getPermissionCodesByUserId(Long userId) {
        if (isAdminUser(userId)) {
            return this.list().stream()
                    .map(Permission::getCode)
                    .collect(Collectors.toList());
        }
        List<Long> roleIds = userRoleMapper.selectRoleIdsByUserId(userId);
        if (roleIds.isEmpty()) {
            return List.of();
        }
        Set<String> permissionCodes = new HashSet<>();
        for (Long roleId : roleIds) {
            List<Long> permissionIds = rolePermissionMapper.selectPermissionIdsByRoleId(roleId);
            if (!permissionIds.isEmpty()) {
                List<Permission> permissions = this.list(
                        new LambdaQueryWrapper<Permission>()
                                .in(Permission::getId, permissionIds)
                                .select(Permission::getCode)
                );
                permissions.forEach(p -> permissionCodes.add(p.getCode()));
            }
        }
        return new ArrayList<>(permissionCodes);
    }

    @Override
    public List<Permission> getMenuTreeByUserId(Long userId) {
        List<Permission> allMenus = this.list(
                new LambdaQueryWrapper<Permission>()
                        .eq(Permission::getType, "menu")
                        .orderByAsc(Permission::getSortOrder)
        );
        if (isAdminUser(userId)) {
            return buildMenuTree(allMenus, null);
        }
        List<String> permissionCodes = getPermissionCodesByUserId(userId);
        if (permissionCodes.isEmpty()) {
            return List.of();
        }
        Set<Long> allowedMenuIds = new HashSet<>();
        for (Permission menu : allMenus) {
            if (permissionCodes.contains(menu.getCode())) {
                allowedMenuIds.add(menu.getId());
                if (menu.getParentId() != null) {
                    collectAncestors(menu.getParentId(), allMenus, allowedMenuIds);
                }
            }
        }
        List<Permission> userMenus = allMenus.stream()
                .filter(menu -> allowedMenuIds.contains(menu.getId()))
                .collect(Collectors.toList());
        return buildMenuTree(userMenus, null);
    }

    private boolean isAdminUser(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null || user.getUsername() == null) {
            return false;
        }
        if (ADMIN_CODE.equals(user.getUsername())) {
            return true;
        }
        List<Long> roleIds = userRoleMapper.selectRoleIdsByUserId(userId);
        for (Long roleId : roleIds) {
            Role role = roleMapper.selectById(roleId);
            if (role != null && ADMIN_CODE.equals(role.getCode())) {
                return true;
            }
        }
        return false;
    }

    private void collectAncestors(Long parentId, List<Permission> allMenus, Set<Long> ancestorIds) {
        if (parentId == null) return;
        ancestorIds.add(parentId);
        for (Permission menu : allMenus) {
            if (menu.getId().equals(parentId) && menu.getParentId() != null) {
                collectAncestors(menu.getParentId(), allMenus, ancestorIds);
            }
        }
    }

    private List<Permission> buildMenuTree(List<Permission> menus, Long parentId) {
        List<Permission> tree = new ArrayList<>();
        for (Permission menu : menus) {
            if ((parentId == null && menu.getParentId() == null) ||
                (parentId != null && parentId.equals(menu.getParentId()))) {
                List<Permission> children = buildMenuTree(menus, menu.getId());
                menu.setChildren(children);
                tree.add(menu);
            }
        }
        return tree;
    }
}
