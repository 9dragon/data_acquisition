package com.dataacquisition.modules.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dataacquisition.common.dto.OptionDto;
import com.dataacquisition.modules.project.entity.Project;
import com.dataacquisition.modules.project.mapper.ProjectMapper;
import com.dataacquisition.modules.project.service.ProjectService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 项目Service实现
 */
@Service
public class ProjectServiceImpl extends ServiceImpl<ProjectMapper, Project> implements ProjectService {

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

        return this.page(page, wrapper);
    }

    @Override
    public Project getProjectDetail(Long id) {
        return this.getById(id);
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
}
