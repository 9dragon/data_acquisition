package com.dataacquisition.modules.system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dataacquisition.common.dto.OptionDto;
import com.dataacquisition.common.exception.BusinessException;
import com.dataacquisition.modules.project.entity.Project;
import com.dataacquisition.modules.project.service.ProjectService;
import com.dataacquisition.modules.system.entity.User;
import com.dataacquisition.modules.system.mapper.UserMapper;
import com.dataacquisition.modules.system.service.UserService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 用户Service实现
 */
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    private final PasswordEncoder passwordEncoder;
    private final ProjectService projectService;

    public UserServiceImpl(PasswordEncoder passwordEncoder, ProjectService projectService) {
        this.passwordEncoder = passwordEncoder;
        this.projectService = projectService;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = getByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("用户不存在");
        }
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .accountLocked(user.getStatus() == 0)
                .build();
    }

    @Override
    public User getByUsername(String username) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, username);
        return this.getOne(wrapper);
    }

    @Override
    public Boolean createUser(User user) {
        // 检查用户名是否已存在
        if (getByUsername(user.getUsername()) != null) {
            throw new BusinessException("用户名已存在");
        }
        // 加密密码
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return this.save(user);
    }

    @Override
    public Boolean updateUser(User user) {
        return this.updateById(user);
    }

    @Override
    public Boolean deleteUser(Long id) {
        return this.removeById(id);
    }

    @Override
    public Boolean resetPassword(Long id, String newPassword) {
        User user = this.getById(id);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        return this.updateById(user);
    }

    @Override
    public Boolean updateLoginInfo(Long id, String ip) {
        User user = this.getById(id);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        // 更新登录时间和IP
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        user.setLastLoginTime(LocalDateTime.now().format(formatter));
        user.setLastLoginIp(ip);
        return this.updateById(user);
    }

    @Override
    public Object getCurrentProject(Long projectId) {
        Project project = projectService.getById(projectId);
        if (project == null) {
            return null;
        }
        Map<String, Object> result = new HashMap<>();
        result.put("id", project.getId());
        result.put("name", project.getName());
        result.put("code", project.getCode());
        return result;
    }

    @Override
    public Boolean setCurrentProject(Long userId, Long projectId) {
        User user = this.getById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        // 验证项目是否存在
        Project project = projectService.getById(projectId);
        if (project == null) {
            throw new BusinessException("项目不存在");
        }
        user.setCurrentProjectId(projectId);
        return this.updateById(user);
    }

    @Override
    public List<OptionDto> getUserOptions(String keyword) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();

        // 只查询启用的用户
        wrapper.eq(User::getStatus, 1);

        // 关键词搜索（用户名或姓名）
        if (StringUtils.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(User::getName, keyword)
                    .or()
                    .like(User::getUsername, keyword));
        }

        // 排序
        wrapper.orderByDesc(User::getCreatedAt);

        List<User> list = this.list(wrapper);
        return list.stream()
                .map(u -> new OptionDto(u.getId(), u.getName()))
                .collect(Collectors.toList());
    }

    @Override
    public Boolean toggleStatus(Long id) {
        User user = this.getById(id);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        user.setStatus(user.getStatus() == 1 ? 0 : 1);
        return this.updateById(user);
    }
}
