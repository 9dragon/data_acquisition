package com.dataacquisition.modules.system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dataacquisition.common.exception.BusinessException;
import com.dataacquisition.modules.system.entity.Role;
import com.dataacquisition.modules.system.entity.Permission;
import com.dataacquisition.modules.system.entity.RolePermission;
import com.dataacquisition.modules.system.entity.UserRole;
import com.dataacquisition.modules.system.mapper.RoleMapper;
import com.dataacquisition.modules.system.mapper.PermissionMapper;
import com.dataacquisition.modules.system.mapper.RolePermissionMapper;
import com.dataacquisition.modules.system.mapper.UserRoleMapper;
import com.dataacquisition.modules.system.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 角色Service实现
 */
@Service
@RequiredArgsConstructor
public class RoleServiceImpl extends ServiceImpl<RoleMapper, Role> implements RoleService {

    private final PermissionMapper permissionMapper;
    private final RolePermissionMapper rolePermissionMapper;
    private final UserRoleMapper userRoleMapper;

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

        rolePage.getRecords().forEach(role -> {
            role.setPermissionCount(rolePermissionMapper.countByRoleId(role.getId()));
            role.setUserCount(userRoleMapper.countByRoleId(role.getId()));
        });

        return rolePage;
    }

    @Override
    public Boolean createRole(Role role) {
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

        if (existingRole.getIsSystem() == 1) {
            role.setCode(existingRole.getCode());
            role.setIsSystem(existingRole.getIsSystem());
        }

        LambdaQueryWrapper<Role> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Role::getId, role.getId());
        return this.update(role, wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean deleteRole(Long id) {
        Role role = this.getById(id);
        if (role == null) {
            throw new BusinessException("角色不存在");
        }

        if (role.getIsSystem() == 1) {
            throw new BusinessException("系统预置角色不能删除");
        }

        if (userRoleMapper.countByRoleId(id) > 0) {
            throw new BusinessException("角色下有用户，不能删除");
        }

        rolePermissionMapper.deleteByRoleId(id);
        return this.removeById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean assignPermissions(Long roleId, List<Long> permissionIds) {
        Role role = this.getById(roleId);
        if (role == null) {
            throw new BusinessException("角色不存在");
        }

        rolePermissionMapper.deleteByRoleId(roleId);

        if (permissionIds != null && !permissionIds.isEmpty()) {
            rolePermissionMapper.insertBatch(roleId, permissionIds);
        }

        return true;
    }

    @Override
    public List<Long> getRolePermissionIds(Long roleId) {
        return rolePermissionMapper.selectPermissionIdsByRoleId(roleId);
    }

    @Override
    public List<Permission> getRolePermissionsDetail(Long roleId) {
        List<Long> permissionIds = getRolePermissionIds(roleId);
        if (permissionIds.isEmpty()) {
            return List.of();
        }
        return permissionMapper.selectBatchIds(permissionIds);
    }

    @Override
    public Integer getPermissionCount(Long roleId) {
        return rolePermissionMapper.countByRoleId(roleId);
    }
}
