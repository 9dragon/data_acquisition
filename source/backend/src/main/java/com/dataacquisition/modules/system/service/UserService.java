package com.dataacquisition.modules.system.service;

import org.springframework.security.core.userdetails.UserDetailsService;
import com.baomidou.mybatisplus.extension.service.IService;
import com.dataacquisition.modules.system.entity.User;

/**
 * 用户Service接口
 */
public interface UserService extends IService<User>, UserDetailsService {

    /**
     * 根据用户名获取用户
     */
    User getByUsername(String username);

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
}
