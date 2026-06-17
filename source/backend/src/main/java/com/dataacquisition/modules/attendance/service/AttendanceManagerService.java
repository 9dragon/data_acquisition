package com.dataacquisition.modules.attendance.service;

import com.dataacquisition.modules.attendance.dto.ManagerOverviewVO;
import com.dataacquisition.modules.attendance.dto.MemberStatusVO;

import java.util.List;

/**
 * 项目经理签到看板Service接口
 */
public interface AttendanceManagerService {

    /**
     * 获取当前用户作为项目经理名下所有项目的今日签到概览
     */
    ManagerOverviewVO getManagerOverview(Long managerUserId);

    /**
     * 获取指定项目的成员今日签到明细（含未签到人员）
     * 调用前需校验当前用户是该项目的项目经理
     */
    List<MemberStatusVO> getProjectMembersStatus(Long projectId);

    /**
     * 判断当前用户是否是任意项目的项目经理
     */
    boolean isManager(Long userId);
}
