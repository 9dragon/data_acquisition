package com.dataacquisition.modules.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dataacquisition.common.dto.OptionDto;
import com.dataacquisition.modules.project.entity.Project;
import com.dataacquisition.modules.project.entity.ProjectMember;
import com.dataacquisition.modules.project.mapper.ProjectMapper;
import com.dataacquisition.modules.project.service.ProjectMemberService;
import com.dataacquisition.modules.project.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 项目Service实现
 */
@Service
@RequiredArgsConstructor
public class ProjectServiceImpl extends ServiceImpl<ProjectMapper, Project> implements ProjectService {

    private final ProjectMemberService projectMemberService;

    @Override
    public Page<Project> pageProjects(Page<Project> page, String keyword, Integer status, String stage) {
        LambdaQueryWrapper<Project> wrapper = new LambdaQueryWrapper<>();

        // 关键词搜索
        if (StringUtils.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(Project::getName, keyword)
                    .or()
                    .like(Project::getCode, keyword));
        }

        // 状态筛选
        if (status != null) {
            wrapper.eq(Project::getStatus, status);
        }

        // 阶段筛选
        if (StringUtils.isNotBlank(stage)) {
            wrapper.eq(Project::getStage, stage);
        }

        // 排序
        wrapper.orderByDesc(Project::getCreatedAt);

        Page<Project> result = this.page(page, wrapper);
        fillManagerInfo(result.getRecords());
        return result;
    }

    @Override
    public Project getProjectDetail(Long id) {
        Project project = this.getById(id);
        if (project != null) {
            fillManagerInfo(Collections.singletonList(project));
        }
        return project;
    }

    @Override
    public List<OptionDto> getProjectOptions(String keyword) {
        LambdaQueryWrapper<Project> wrapper = new LambdaQueryWrapper<>();

        // 关键词搜索
        if (StringUtils.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(Project::getName, keyword)
                    .or()
                    .like(Project::getCode, keyword));
        }

        // 只查询未删除的项目
        wrapper.eq(Project::getDeleted, 0)
               .orderByDesc(Project::getCreatedAt);

        List<Project> list = this.list(wrapper);
        return list.stream()
                .map(p -> new OptionDto(p.getId(), p.getName()))
                .collect(Collectors.toList());
    }

    /**
     * 批量填充项目的经理信息（managerUserId、managerName）
     * 通过 ProjectMemberService.getActiveManagersMap 获取（已填充 userName），
     * 避免直接依赖 UserService 造成循环引用。
     */
    private void fillManagerInfo(List<Project> projects) {
        if (projects == null || projects.isEmpty()) {
            return;
        }
        List<Long> projectIds = projects.stream()
                .map(Project::getId).collect(Collectors.toList());
        Map<Long, ProjectMember> managerMap = projectMemberService.getActiveManagersMap(projectIds);
        if (managerMap.isEmpty()) {
            return;
        }
        for (Project p : projects) {
            ProjectMember m = managerMap.get(p.getId());
            if (m != null) {
                p.setManagerUserId(m.getUserId());
                p.setManagerName(m.getUserName());
            }
        }
    }
}
