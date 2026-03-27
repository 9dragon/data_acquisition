package com.dataacquisition.modules.system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dataacquisition.modules.system.entity.Permission;
import com.dataacquisition.modules.system.mapper.PermissionMapper;
import com.dataacquisition.modules.system.service.PermissionService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 权限Service实现
 */
@Service
public class PermissionServiceImpl extends ServiceImpl<PermissionMapper, Permission> implements PermissionService {

    @Override
    public List<Permission> getPermissionTree() {
        // 查询所有权限
        List<Permission> allPermissions = this.list(
                new LambdaQueryWrapper<Permission>()
                        .orderByAsc(Permission::getSortOrder)
        );

        // 构建树形结构
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
        // TODO: 实现根据角色获取权限的逻辑
        // 目前返回所有权限
        return this.list();
    }

    /**
     * 构建权限树
     */
    private List<Permission> buildTree(List<Permission> permissions, Long parentId) {
        List<Permission> tree = new ArrayList<>();

        for (Permission permission : permissions) {
            // 判断是否为当前父节点的子节点
            if ((parentId == null && permission.getParentId() == null) ||
                (parentId != null && parentId.equals(permission.getParentId()))) {
                // 递归构建子树
                permission.setChildren(buildTree(permissions, permission.getId()));
                tree.add(permission);
            }
        }

        return tree;
    }
}
