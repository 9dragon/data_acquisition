package com.dataacquisition.modules.project.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.dataacquisition.modules.project.entity.ProjectMember;

import java.util.List;

/**
 * 项目-成员关系Service接口
 */
public interface ProjectMemberService extends IService<ProjectMember> {

    /**
     * 查询用户作为项目经理名下的所有项目成员关系
     */
    List<ProjectMember> listByManager(Long userId);

    /**
     * 查询项目的所有有效成员
     */
    List<ProjectMember> listMembersByProject(Long projectId);

    /**
     * 判断用户是否是某项目的项目经理
     */
    boolean isManagerOfProject(Long userId, Long projectId);

    /**
     * 判断用户是否是任意项目的项目经理（用于移动端首页入口判断）
     */
    boolean isManagerOfAnyProject(Long userId);

    /**
     * 批量添加项目成员
     *
     * @param projectId 项目ID
     * @param userIds   用户ID列表
     * @param role      角色（MANAGER/MEMBER）
     * @param operatorId 操作人ID
     * @return 新增数量
     */
    int addMembers(Long projectId, List<Long> userIds, String role, Long operatorId);

    /**
     * 移除项目成员（软删除）
     */
    boolean removeMember(Long projectId, Long userId);

    /**
     * 更新成员角色
     */
    boolean updateMemberRole(Long projectId, Long userId, String role);

    /**
     * 项目有效成员数
     */
    long countActiveMembers(Long projectId);

    /**
     * 设置项目唯一经理：先撤销该项目现有 MANAGER，再添加新 MANAGER（事务）
     * 用于项目表单提交与"成员管理"对话框"设为经理"
     *
     * @param projectId     项目ID
     * @param managerUserId 经理用户ID
     * @param operatorId    操作人ID
     * @return 是否成功
     */
    boolean setProjectManager(Long projectId, Long managerUserId, Long operatorId);

    /**
     * 查询项目的当前 MANAGER（is_active=1）
     */
    ProjectMember getActiveManager(Long projectId);

    /**
     * 批量查询多个项目的当前经理，并填充用户姓名/手机号
     *
     * @param projectIds 项目ID集合
     * @return projectId -> ProjectMember（含 userName/userPhone），无经理的项目不在 map 中
     */
    java.util.Map<Long, ProjectMember> getActiveManagersMap(java.util.List<Long> projectIds);
}
