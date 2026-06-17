package com.dataacquisition.modules.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dataacquisition.modules.project.entity.ProjectMember;
import com.dataacquisition.modules.project.mapper.ProjectMemberMapper;
import com.dataacquisition.modules.project.service.ProjectMemberService;
import com.dataacquisition.modules.system.entity.User;
import com.dataacquisition.modules.system.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 项目-成员关系Service实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectMemberServiceImpl extends ServiceImpl<ProjectMemberMapper, ProjectMember>
        implements ProjectMemberService {

    private final UserMapper userMapper;

    @Override
    public List<ProjectMember> listByManager(Long userId) {
        LambdaQueryWrapper<ProjectMember> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProjectMember::getUserId, userId)
               .eq(ProjectMember::getRole, "MANAGER")
               .eq(ProjectMember::getIsActive, 1);
        return this.list(wrapper);
    }

    @Override
    public List<ProjectMember> listMembersByProject(Long projectId) {
        LambdaQueryWrapper<ProjectMember> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProjectMember::getProjectId, projectId)
               .eq(ProjectMember::getIsActive, 1)
               .orderByAsc(ProjectMember::getRole)
               .orderByAsc(ProjectMember::getJoinedAt);
        List<ProjectMember> members = this.list(wrapper);
        if (members.isEmpty()) {
            return members;
        }
        // 填充用户姓名/手机号
        List<Long> userIds = members.stream().map(ProjectMember::getUserId).distinct().collect(Collectors.toList());
        List<User> users = userMapper.selectBatchIds(userIds);
        java.util.Map<Long, User> userMap = users.stream().collect(java.util.stream.Collectors.toMap(User::getId, u -> u));
        for (ProjectMember m : members) {
            User u = userMap.get(m.getUserId());
            if (u != null) {
                m.setUserName(u.getName());
                m.setUserPhone(u.getPhone());
            }
        }
        return members;
    }

    @Override
    public boolean isManagerOfProject(Long userId, Long projectId) {
        LambdaQueryWrapper<ProjectMember> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProjectMember::getUserId, userId)
               .eq(ProjectMember::getProjectId, projectId)
               .eq(ProjectMember::getRole, "MANAGER")
               .eq(ProjectMember::getIsActive, 1);
        return this.count(wrapper) > 0;
    }

    @Override
    public boolean isManagerOfAnyProject(Long userId) {
        LambdaQueryWrapper<ProjectMember> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProjectMember::getUserId, userId)
               .eq(ProjectMember::getRole, "MANAGER")
               .eq(ProjectMember::getIsActive, 1);
        return this.count(wrapper) > 0;
    }

    @Override
    @Transactional
    public int addMembers(Long projectId, List<Long> userIds, String role, Long operatorId) {
        if (userIds == null || userIds.isEmpty()) {
            return 0;
        }
        List<Long> distinctUserIds = userIds.stream().distinct().collect(Collectors.toList());

        // 一个项目仅一个 MANAGER：添加 MANAGER 前先撤销该项目现有 MANAGER（保留本次要加的 userId）
        if ("MANAGER".equals(role)) {
            deactivateOtherManagers(projectId, distinctUserIds, operatorId);
        }

        // 查询已有（含历史已删除），用于判断是新增还是恢复
        LambdaQueryWrapper<ProjectMember> existWrapper = new LambdaQueryWrapper<>();
        existWrapper.eq(ProjectMember::getProjectId, projectId)
                    .in(ProjectMember::getUserId, distinctUserIds);
        List<ProjectMember> existList = this.list(existWrapper);
        java.util.Map<Long, ProjectMember> existMap = existList.stream()
                .collect(java.util.stream.Collectors.toMap(ProjectMember::getUserId, m -> m));

        LocalDateTime now = LocalDateTime.now();
        List<ProjectMember> toInsert = new ArrayList<>();
        List<ProjectMember> toRecover = new ArrayList<>();
        for (Long uid : distinctUserIds) {
            ProjectMember exist = existMap.get(uid);
            if (exist != null) {
                if (exist.getDeleted() == 1 || !Objects.equals(exist.getIsActive(), 1) || !Objects.equals(exist.getRole(), role)) {
                    exist.setDeleted(0);
                    exist.setIsActive(1);
                    exist.setRole(role);
                    exist.setUpdatedAt(now);
                    exist.setUpdatedBy(operatorId);
                    toRecover.add(exist);
                }
            } else {
                ProjectMember pm = new ProjectMember();
                pm.setProjectId(projectId);
                pm.setUserId(uid);
                pm.setRole(role);
                pm.setIsActive(1);
                pm.setJoinedAt(now);
                pm.setCreatedBy(operatorId);
                pm.setUpdatedBy(operatorId);
                toInsert.add(pm);
            }
        }
        int count = 0;
        if (!toInsert.isEmpty()) {
            this.saveBatch(toInsert);
            count += toInsert.size();
        }
        for (ProjectMember pm : toRecover) {
            this.updateById(pm);
            count++;
        }
        log.info("批量添加项目成员: projectId={}, role={}, 新增/恢复数量={}", projectId, role, count);
        return count;
    }

    @Override
    public boolean removeMember(Long projectId, Long userId) {
        LambdaQueryWrapper<ProjectMember> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProjectMember::getProjectId, projectId)
               .eq(ProjectMember::getUserId, userId);
        ProjectMember member = this.getOne(wrapper, false);
        if (member == null) {
            return false;
        }
        member.setIsActive(0);
        return this.updateById(member);
    }

    @Override
    @Transactional
    public boolean updateMemberRole(Long projectId, Long userId, String role) {
        LambdaQueryWrapper<ProjectMember> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProjectMember::getProjectId, projectId)
               .eq(ProjectMember::getUserId, userId);
        ProjectMember member = this.getOne(wrapper, false);
        if (member == null) {
            return false;
        }
        // 升级为 MANAGER 时，先把该项目其他 MANAGER 撤销，保证唯一
        if ("MANAGER".equals(role) && !Objects.equals(member.getRole(), "MANAGER")) {
            deactivateOtherManagers(projectId, Collections.singletonList(userId), null);
        }
        member.setRole(role);
        return this.updateById(member);
    }

    @Override
    @Transactional
    public boolean setProjectManager(Long projectId, Long managerUserId, Long operatorId) {
        if (projectId == null || managerUserId == null) {
            return false;
        }
        addMembers(projectId, Collections.singletonList(managerUserId), "MANAGER", operatorId);
        return true;
    }

    @Override
    public ProjectMember getActiveManager(Long projectId) {
        LambdaQueryWrapper<ProjectMember> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProjectMember::getProjectId, projectId)
               .eq(ProjectMember::getRole, "MANAGER")
               .eq(ProjectMember::getIsActive, 1);
        return this.getOne(wrapper, false);
    }

    @Override
    public java.util.Map<Long, ProjectMember> getActiveManagersMap(java.util.List<Long> projectIds) {
        if (projectIds == null || projectIds.isEmpty()) {
            return java.util.Collections.emptyMap();
        }
        LambdaQueryWrapper<ProjectMember> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(ProjectMember::getProjectId, projectIds)
               .eq(ProjectMember::getRole, "MANAGER")
               .eq(ProjectMember::getIsActive, 1);
        List<ProjectMember> managers = this.list(wrapper);
        if (managers.isEmpty()) {
            return java.util.Collections.emptyMap();
        }
        // 填充用户姓名/手机号
        Set<Long> userIds = managers.stream().map(ProjectMember::getUserId).collect(Collectors.toSet());
        Map<Long, User> userMap = userMapper.selectBatchIds(userIds).stream()
                .collect(java.util.stream.Collectors.toMap(User::getId, u -> u));
        for (ProjectMember m : managers) {
            User u = userMap.get(m.getUserId());
            if (u != null) {
                m.setUserName(u.getName());
                m.setUserPhone(u.getPhone());
            }
        }
        // 同一项目理论只有一个 active MANAGER；如有意外取第一条
        return managers.stream().collect(java.util.stream.Collectors.toMap(
                ProjectMember::getProjectId, m -> m, (a, b) -> a));
    }

    @Override
    public long countActiveMembers(Long projectId) {
        LambdaQueryWrapper<ProjectMember> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProjectMember::getProjectId, projectId)
               .eq(ProjectMember::getIsActive, 1);
        return this.count(wrapper);
    }

    /**
     * 把该项目当前 active MANAGER 中不在 keepUserIds 里的全部撤销
     */
    private void deactivateOtherManagers(Long projectId, List<Long> keepUserIds, Long operatorId) {
        LambdaQueryWrapper<ProjectMember> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProjectMember::getProjectId, projectId)
               .eq(ProjectMember::getRole, "MANAGER")
               .eq(ProjectMember::getIsActive, 1);
        if (keepUserIds != null && !keepUserIds.isEmpty()) {
            wrapper.notIn(ProjectMember::getUserId, keepUserIds);
        }
        List<ProjectMember> others = this.list(wrapper);
        if (others.isEmpty()) {
            return;
        }
        LocalDateTime now = LocalDateTime.now();
        for (ProjectMember m : others) {
            // 同一用户保留为 MEMBER 关系更合理（仍可见其历史归属）
            m.setRole("MEMBER");
            m.setUpdatedAt(now);
            m.setUpdatedBy(operatorId);
            this.updateById(m);
            log.info("项目 {} 旧经理 {} 已降级为 MEMBER（保证唯一经理）", projectId, m.getUserId());
        }
    }
}
