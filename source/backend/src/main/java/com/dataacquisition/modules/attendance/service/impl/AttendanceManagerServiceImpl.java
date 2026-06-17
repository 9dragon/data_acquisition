package com.dataacquisition.modules.attendance.service.impl;

import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.dataacquisition.common.exception.BusinessException;
import com.dataacquisition.modules.attendance.dto.ManagerOverviewVO;
import com.dataacquisition.modules.attendance.dto.MemberStatusVO;
import com.dataacquisition.modules.attendance.entity.AttendanceRecord;
import com.dataacquisition.modules.attendance.mapper.AttendanceRecordMapper;
import com.dataacquisition.modules.attendance.service.AttendanceManagerService;
import com.dataacquisition.modules.project.entity.Project;
import com.dataacquisition.modules.project.entity.ProjectMember;
import com.dataacquisition.modules.project.service.ProjectMemberService;
import com.dataacquisition.modules.project.service.ProjectService;
import com.dataacquisition.modules.system.entity.User;
import com.dataacquisition.modules.system.service.SystemConfigService;
import com.dataacquisition.modules.system.service.UserService;
import com.dataacquisition.service.MinioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 项目经理签到看板Service实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceManagerServiceImpl implements AttendanceManagerService {

    private final ProjectMemberService projectMemberService;
    private final ProjectService projectService;
    private final UserService userService;
    private final AttendanceRecordMapper attendanceRecordMapper;
    private final SystemConfigService systemConfigService;
    private final MinioService minioService;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATETIME_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    public ManagerOverviewVO getManagerOverview(Long managerUserId) {
        ManagerOverviewVO vo = new ManagerOverviewVO();

        // 1. 查询经理名下所有项目
        List<ProjectMember> managerRelations = projectMemberService.listByManager(managerUserId);
        if (managerRelations.isEmpty()) {
            vo.setIsManager(false);
            vo.setProjects(Collections.emptyList());
            vo.setRecentCheckIns(Collections.emptyList());
            ManagerOverviewVO.AggregateStats agg = new ManagerOverviewVO.AggregateStats();
            agg.setTotalProjects(0);
            agg.setTotalMembers(0);
            agg.setCheckedInMembers(0);
            agg.setPendingMembers(0);
            agg.setLateMembers(0);
            vo.setAggregate(agg);
            return vo;
        }
        vo.setIsManager(true);

        List<Long> projectIds = managerRelations.stream()
                .map(ProjectMember::getProjectId).distinct().collect(Collectors.toList());
        List<Project> projects = projectService.listByIds(projectIds);
        Map<Long, Project> projectMap = projects.stream()
                .collect(Collectors.toMap(Project::getId, p -> p));

        // 2. 查询每个项目的有效成员
        Map<Long, List<ProjectMember>> projectMembersMap = new HashMap<>();
        Set<Long> allMemberUserIds = new HashSet<>();
        for (Long pid : projectIds) {
            List<ProjectMember> ms = projectMemberService.listMembersByProject(pid);
            projectMembersMap.put(pid, ms);
            for (ProjectMember m : ms) {
                allMemberUserIds.add(m.getUserId());
            }
        }

        // 3. 查询今日所有签到记录（按项目筛选）
        LocalDate today = LocalDate.now();
        LocalDateTime todayStart = today.atStartOfDay();
        LocalDateTime todayEnd = todayStart.plusDays(1);
        LambdaQueryWrapper<AttendanceRecord> recWrapper = new LambdaQueryWrapper<>();
        recWrapper.in(AttendanceRecord::getProjectId, projectIds)
                  .ge(AttendanceRecord::getCheckInTime, todayStart)
                  .lt(AttendanceRecord::getCheckInTime, todayEnd)
                  .orderByDesc(AttendanceRecord::getCheckInTime);
        List<AttendanceRecord> todayRecords = attendanceRecordMapper.selectList(recWrapper);
        refreshPhotoUrls(todayRecords);

        // 4. 按项目分组
        Map<Long, List<AttendanceRecord>> recordsByProject = todayRecords.stream()
                .collect(Collectors.groupingBy(AttendanceRecord::getProjectId));

        // 5. 构建项目概览
        List<ManagerOverviewVO.ProjectOverview> projectOverviews = new ArrayList<>();
        int aggTotal = 0, aggChecked = 0, aggPending = 0, aggLate = 0;
        for (Long pid : projectIds) {
            Project p = projectMap.get(pid);
            if (p == null) {
                continue;
            }
            List<ProjectMember> ms = projectMembersMap.getOrDefault(pid, Collections.emptyList());
            // 一个成员在某项目今日任意一条签到即算已签到
            List<AttendanceRecord> projRecs = recordsByProject.getOrDefault(pid, Collections.emptyList());
            Set<Long> checkedUserIds = projRecs.stream().map(AttendanceRecord::getUserId).collect(Collectors.toSet());
            Set<Long> lateUserIds = projRecs.stream()
                    .filter(r -> "LATE".equalsIgnoreCase(r.getStatus()) || (r.getIsLate() != null && r.getIsLate() == 1))
                    .map(AttendanceRecord::getUserId).collect(Collectors.toSet());

            int total = ms.size();
            int checked = checkedUserIds.size();
            int late = lateUserIds.size();
            int pending = total - checked;
            int rate = total == 0 ? 0 : Math.round((float) checked * 100 / total);

            ManagerOverviewVO.ProjectOverview ov = new ManagerOverviewVO.ProjectOverview();
            ov.setProjectId(pid);
            ov.setProjectName(p.getName());
            ov.setProjectCode(p.getCode());
            ov.setTotalMembers(total);
            ov.setCheckedInMembers(checked);
            ov.setPendingMembers(pending);
            ov.setLateMembers(late);
            ov.setCheckInRate(rate);
            projectOverviews.add(ov);

            aggTotal += total;
            aggChecked += checked;
            aggPending += pending;
            aggLate += late;
        }
        // 按未签到数倒序，让最该关注的项目排在前面
        projectOverviews.sort(Comparator
                .comparing(ManagerOverviewVO.ProjectOverview::getPendingMembers).reversed()
                .thenComparing(ManagerOverviewVO.ProjectOverview::getProjectName));
        vo.setProjects(projectOverviews);

        // 6. 聚合最新签到流水（前 10 条）
        List<ManagerOverviewVO.RecentCheckIn> recent = todayRecords.stream()
                .limit(10)
                .map(r -> {
                    ManagerOverviewVO.RecentCheckIn rc = new ManagerOverviewVO.RecentCheckIn();
                    rc.setRecordId(r.getId());
                    rc.setProjectId(r.getProjectId());
                    Project p = projectMap.get(r.getProjectId());
                    rc.setProjectName(p != null ? p.getName() : null);
                    rc.setUserId(r.getUserId());
                    rc.setUserName(r.getUserName());
                    rc.setCheckInTime(r.getCheckInTime().format(DATETIME_FMT));
                    rc.setShiftName(r.getShiftName());
                    rc.setStatus(r.getStatus());
                    rc.setLocation(r.getLocation());
                    rc.setPhotoUrl(r.getPhotoUrl());
                    return rc;
                }).collect(Collectors.toList());
        vo.setRecentCheckIns(recent);

        // 7. 聚合统计
        ManagerOverviewVO.AggregateStats agg = new ManagerOverviewVO.AggregateStats();
        agg.setTotalProjects(projectOverviews.size());
        agg.setTotalMembers(aggTotal);
        agg.setCheckedInMembers(aggChecked);
        agg.setPendingMembers(aggPending);
        agg.setLateMembers(aggLate);
        vo.setAggregate(agg);

        // 8. 当前班次信息
        vo.setCurrentShift(resolveCurrentShift());
        return vo;
    }

    @Override
    public List<MemberStatusVO> getProjectMembersStatus(Long projectId) {
        // 1. 项目成员
        List<ProjectMember> members = projectMemberService.listMembersByProject(projectId);
        if (members.isEmpty()) {
            return Collections.emptyList();
        }

        // 2. 项目今日签到记录
        LocalDate today = LocalDate.now();
        LocalDateTime todayStart = today.atStartOfDay();
        LocalDateTime todayEnd = todayStart.plusDays(1);
        LambdaQueryWrapper<AttendanceRecord> recWrapper = new LambdaQueryWrapper<>();
        recWrapper.eq(AttendanceRecord::getProjectId, projectId)
                  .ge(AttendanceRecord::getCheckInTime, todayStart)
                  .lt(AttendanceRecord::getCheckInTime, todayEnd)
                  .orderByAsc(AttendanceRecord::getCheckInTime);
        List<AttendanceRecord> records = attendanceRecordMapper.selectList(recWrapper);
        refreshPhotoUrls(records);

        // 按用户分组
        Map<Long, List<AttendanceRecord>> recordsByUser = records.stream()
                .collect(Collectors.groupingBy(AttendanceRecord::getUserId));

        // 3. 组装每个成员的状态
        List<MemberStatusVO> result = new ArrayList<>(members.size());
        for (ProjectMember m : members) {
            MemberStatusVO vo = new MemberStatusVO();
            vo.setUserId(m.getUserId());
            vo.setUserName(m.getUserName());
            vo.setPhone(m.getUserPhone());
            vo.setRole(m.getRole());

            List<AttendanceRecord> userRecs = recordsByUser.getOrDefault(m.getUserId(), Collections.emptyList());
            List<MemberStatusVO.AttendanceRecordVO> recVos = userRecs.stream().map(r -> {
                MemberStatusVO.AttendanceRecordVO rv = new MemberStatusVO.AttendanceRecordVO();
                rv.setId(r.getId());
                rv.setShiftIndex(r.getShiftIndex());
                rv.setShiftName(r.getShiftName());
                rv.setCheckInTime(r.getCheckInTime().format(TIME_FMT));
                rv.setStatus(r.getStatus());
                rv.setLocation(r.getLocation());
                rv.setPhotoUrl(r.getPhotoUrl());
                return rv;
            }).collect(Collectors.toList());
            vo.setRecords(recVos);

            boolean hasLate = userRecs.stream().anyMatch(r ->
                    "LATE".equalsIgnoreCase(r.getStatus()) || (r.getIsLate() != null && r.getIsLate() == 1));
            vo.setHasLate(hasLate);
            vo.setCheckedShifts((int) userRecs.stream()
                    .map(AttendanceRecord::getShiftIndex).filter(java.util.Objects::nonNull).distinct().count());

            if (userRecs.isEmpty()) {
                vo.setCheckedIn(false);
                vo.setStatus("PENDING");
                vo.setFirstCheckInTime(null);
                vo.setLastCheckInTime(null);
            } else {
                vo.setCheckedIn(true);
                vo.setStatus(hasLate ? "LATE" : "CHECKED");
                vo.setFirstCheckInTime(userRecs.get(0).getCheckInTime().format(TIME_FMT));
                vo.setLastCheckInTime(userRecs.get(userRecs.size() - 1).getCheckInTime().format(TIME_FMT));
            }
            result.add(vo);
        }

        // 排序：未签到优先，再按是否有迟到，最后按姓名
        result.sort(Comparator
                .comparing((MemberStatusVO v) -> Boolean.TRUE.equals(v.getCheckedIn()))
                .thenComparing(v -> Boolean.TRUE.equals(v.getHasLate()), Comparator.reverseOrder())
                .thenComparing(MemberStatusVO::getUserName, Comparator.nullsLast(String::compareTo)));
        return result;
    }

    @Override
    public boolean isManager(Long userId) {
        return projectMemberService.isManagerOfAnyProject(userId);
    }

    /**
     * 从 system_config 读取班次配置，返回当前时段
     */
    private ManagerOverviewVO.ShiftInfoVO resolveCurrentShift() {
        try {
            JSONObject config = systemConfigService.getConfigJson("attendance.check_times");
            if (config == null) {
                return null;
            }
            JSONArray shifts = config.getJSONArray("shifts");
            if (shifts == null || shifts.isEmpty()) {
                return null;
            }
            LocalTime now = LocalTime.now();
            for (int i = 0; i < shifts.size(); i++) {
                JSONObject shift = shifts.getJSONObject(i);
                String startStr = shift.getStr("startTime");
                String endStr = shift.getStr("endTime");
                if (startStr == null || endStr == null) continue;
                LocalTime start = LocalTime.parse(startStr);
                LocalTime end = LocalTime.parse(endStr);
                boolean isCurrent = !now.isBefore(start) && !now.isAfter(end);
                ManagerOverviewVO.ShiftInfoVO vo = new ManagerOverviewVO.ShiftInfoVO();
                vo.setIndex(i + 1);
                vo.setName(shift.getStr("name"));
                vo.setStartTime(start);
                vo.setEndTime(end);
                String lateStr = shift.getStr("lateTime");
                vo.setLateTime(lateStr != null ? LocalTime.parse(lateStr) : null);
                vo.setIsCurrent(isCurrent);
                if (isCurrent) {
                    return vo;
                }
            }
            return null;
        } catch (Exception e) {
            log.warn("解析当前班次失败", e);
            return null;
        }
    }

    /**
     * 刷新照片预签名 URL
     */
    private void refreshPhotoUrls(List<AttendanceRecord> records) {
        if (records == null) return;
        for (AttendanceRecord r : records) {
            if (r.getPhotoPath() != null && !r.getPhotoPath().isEmpty()) {
                try {
                    r.setPhotoUrl(minioService.getFileUrl(r.getPhotoPath()));
                } catch (Exception e) {
                    log.warn("刷新照片URL失败: {}", r.getPhotoPath(), e);
                }
            }
        }
    }
}
