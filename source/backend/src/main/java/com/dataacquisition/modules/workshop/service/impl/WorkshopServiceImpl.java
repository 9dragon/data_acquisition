package com.dataacquisition.modules.workshop.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dataacquisition.common.dto.OptionDto;
import com.dataacquisition.modules.workshop.entity.Workshop;
import com.dataacquisition.modules.workshop.mapper.WorkshopMapper;
import com.dataacquisition.modules.workshop.service.WorkshopService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 车间Service实现
 */
@Service
public class WorkshopServiceImpl extends ServiceImpl<WorkshopMapper, Workshop> implements WorkshopService {

    @Override
    public List<OptionDto> getWorkshopOptions(Long projectId, String keyword) {
        LambdaQueryWrapper<Workshop> wrapper = new LambdaQueryWrapper<>();

        // 项目筛选
        if (projectId != null) {
            wrapper.eq(Workshop::getProjectId, projectId);
        }

        // 关键词搜索
        if (StringUtils.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(Workshop::getName, keyword)
                    .or()
                    .like(Workshop::getCode, keyword));
        }

        // 排序
        wrapper.orderByDesc(Workshop::getCreatedAt);

        List<Workshop> list = this.list(wrapper);
        return list.stream()
                .map(w -> new OptionDto(w.getId(), w.getName()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OptionDto createOrGetByName(Long projectId, String name) {
        if (StringUtils.isBlank(name)) {
            throw new IllegalArgumentException("车间名称不能为空");
        }
        if (projectId == null) {
            throw new IllegalArgumentException("项目ID不能为空");
        }

        String normalizeName = name.trim();

        // 按名称查找同项目下的车间，存在则直接返回
        LambdaQueryWrapper<Workshop> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Workshop::getProjectId, projectId)
                .eq(Workshop::getName, normalizeName)
                .last("LIMIT 1");
        Workshop existing = this.getOne(wrapper);
        if (existing != null) {
            return new OptionDto(existing.getId(), existing.getName());
        }

        // 不存在则自动创建
        Workshop workshop = new Workshop();
        workshop.setName(normalizeName);
        workshop.setProjectId(projectId);
        this.save(workshop);
        return new OptionDto(workshop.getId(), workshop.getName());
    }
}
