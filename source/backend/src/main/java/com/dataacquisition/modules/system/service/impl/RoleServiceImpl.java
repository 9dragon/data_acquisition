package com.dataacquisition.modules.system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dataacquisition.common.exception.BusinessException;
import com.dataacquisition.modules.system.entity.Role;
import com.dataacquisition.modules.system.entity.Permission;
import com.dataacquisition.modules.system.mapper.RoleMapper;
import com.dataacquisition.modules.system.mapper.PermissionMapper;
import com.dataacquisition.modules.system.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 角色Service实现
 */
@Service
@RequiredArgsConstructor
public class RoleServiceImpl extends ServiceImpl<RoleMapper, Role> implements RoleService {

    private final PermissionMapper permissionMapper;

    @Override
    public Role getByCode(String code) {
        LambdaQueryWrapper<Role> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Role::getCode, code);
        return this.getOne(wrapper);
    }

    @Override
    public IPage<Role> getRolePage(Integer page, Integer pageSize, String name, String code) {
        Page<Role> pageParam = new Page<>(page, pageSize);
        LambdaQueryWrapper<Role> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(name)) {
            wrapper.like(Role::getName, name);
        }
        if (StringUtils.hasText(code)) {
            wrapper.like(Role::getCode, code);
        }

        wrapper.orderByDesc(Role::getCreatedAt);
        IPage<Role> rolePage = this.page(pageParam, wrapper);

        // 填充每个角色的权限数量
        rolePage.getRecords().forEach(role -> {
            Integer count = getPermissionCount(role.getId());
            role.setPermissionCount(count);
        });

        return rolePage;
    }

    @Override
    public Boolean createRole(Role role) {
        // 检查角色编码是否已存在
        if (getByCode(role.getCode()) != null) {
            throw new BusinessException("角色编码已存在");
        }
        return this.save(role);
    }

    @Override
    public Boolean updateRole(Role role) {
        Role existingRole = this.getById(role.getId());
        if (existingRole == null) {
            throw new BusinessException("角色不存在");
        }

        // 系统预置角色不能修改编码和isSystem标识
        if (existingRole.getIsSystem() == 1) {
            role.setCode(existingRole.getCode());
            role.setIsSystem(existingRole.getIsSystem());
        }

        return this.updateById(role);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean deleteRole(Long id) {
        Role role = this.getById(id);
        if (role == null) {
            throw new BusinessException("角色不存在");
        }

        // 系统预置角色不能删除
        if (role.getIsSystem() == 1) {
            throw new BusinessException("系统预置角色不能删除");
        }

        // TODO: 检查角色下是否有用户
        // if (userService.countByRoleId(id) > 0) {
        //     throw new BusinessException("角色下有用户，不能删除");
        // }

        return this.removeById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean assignPermissions(Long roleId, List<Long> permissionIds) {
        Role role = this.getById(roleId);
        if (role == null) {
            throw new BusinessException("角色不存在");
        }

        // 将权限ID列表转换为逗号分隔的字符串
        String permissions = permissionIds != null && !permissionIds.isEmpty()
                ? String.join(",", permissionIds.stream().map(String::valueOf).collect(Collectors.toList()))
                : "";

        role.setPermissions(permissions);
        return this.updateById(role);
    }

    @Override
    public List<Long> getRolePermissionIds(Long roleId) {
        Role role = this.getById(roleId);
        if (role == null || role.getPermissions() == null || role.getPermissions().isEmpty()) {
            return List.of();
        }

        // 将逗号分隔的权限ID字符串转换为List<Long>
        return Arrays.stream(role.getPermissions().split(","))
                .filter(s -> !s.isEmpty())
                .map(Long::valueOf)
                .collect(Collectors.toList());
    }

    @Override
    public List<Permission> getRolePermissionsDetail(Long roleId) {
        List<Long> permissionIds = getRolePermissionIds(roleId);
        if (permissionIds.isEmpty()) {
            return List.of();
        }

        // 批量查询权限详情
        return permissionMapper.selectBatchIds(permissionIds);
    }

    @Override
    public Integer getPermissionCount(Long roleId) {
        List<Long> permissionIds = getRolePermissionIds(roleId);
        return permissionIds.size();
    }
}
