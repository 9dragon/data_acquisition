package com.dataacquisition.modules.system.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.dataacquisition.modules.system.entity.Role;
import com.dataacquisition.modules.system.entity.Permission;

import java.util.List;
import java.util.Map;

/**
 * 角色Service接口
 */
public interface RoleService extends IService<Role> {

    /**
     * 根据编码获取角色
     */
    Role getByCode(String code);

    /**
     * 分页查询角色列表
     */
    IPage<Role> getRolePage(Integer page, Integer pageSize, String name, String code);

    /**
     * 创建角色
     */
    Boolean createRole(Role role);

    /**
     * 更新角色
     */
    Boolean updateRole(Role role);

    /**
     * 删除角色
     */
    Boolean deleteRole(Long id);

    /**
     * 分配权限
     */
    Boolean assignPermissions(Long roleId, List<Long> permissionIds);

    /**
     * 获取角色的权限ID列表
     */
    List<Long> getRolePermissionIds(Long roleId);

    /**
     * 获取角色的权限详情列表
     */
    List<Permission> getRolePermissionsDetail(Long roleId);

    /**
     * 获取角色权限数量
     */
    Integer getPermissionCount(Long roleId);
}
