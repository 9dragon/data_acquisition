package com.dataacquisition.modules.system.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.dataacquisition.modules.system.entity.Permission;

import java.util.List;

/**
 * 权限Service接口
 */
public interface PermissionService extends IService<Permission> {

    /**
     * 获取权限树
     */
    List<Permission> getPermissionTree();

    /**
     * 根据类型获取权限列表
     */
    List<Permission> getByType(String type);

    /**
     * 根据角色获取权限列表
     */
    List<Permission> getByRole(Long roleId);

    /**
     * 根据用户ID获取所有权限码列表
     */
    List<String> getPermissionCodesByUserId(Long userId);

    /**
     * 根据用户ID获取菜单树
     */
    List<Permission> getMenuTreeByUserId(Long userId);
}
