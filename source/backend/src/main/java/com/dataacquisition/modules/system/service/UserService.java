package com.dataacquisition.modules.system.service;

import org.springframework.security.core.userdetails.UserDetailsService;
import com.baomidou.mybatisplus.extension.service.IService;
import com.dataacquisition.common.dto.OptionDto;
import com.dataacquisition.modules.system.entity.User;

import java.util.List;

/**
 * 用户Service接口
 */
public interface UserService extends IService<User>, UserDetailsService {

    /**
     * 根据用户名获取用户
     */
    User getByUsername(String username);

    /**
     * 根据用户名或手机号获取用户
     */
    User getByUsernameOrPhone(String usernameOrPhone);

    /**
     * 创建用户
     */
    Boolean createUser(User user);

    /**
     * 更新用户
     */
    Boolean updateUser(User user);

    /**
     * 删除用户
     */
    Boolean deleteUser(Long id);

    /**
     * 重置密码
     */
    Boolean resetPassword(Long id, String newPassword);

    /**
     * 更新用户登录信息
     */
    Boolean updateLoginInfo(Long id, String ip);

    /**
     * 获取当前项目信息
     */
    Object getCurrentProject(Long projectId);

    /**
     * 设置当前项目
     */
    Boolean setCurrentProject(Long userId, Long projectId);

    /**
     * 获取用户选项列表（用于下拉选择器）
     */
    List<OptionDto> getUserOptions(String keyword);

    /**
     * 切换用户状态
     */
    Boolean toggleStatus(Long id);

    /**
     * 获取用户的角色ID列表
     */
    List<Long> getUserRoleIds(Long userId);

    /**
     * 分配角色（覆盖式）
     */
    Boolean assignRoles(Long userId, List<Long> roleIds);

    /**
     * 修改密码（验证旧密码）
     */
    Boolean changePassword(Long userId, String oldPassword, String newPassword);
}
