package com.dataacquisition.modules.workshop.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dataacquisition.common.dto.OptionDto;
import com.dataacquisition.modules.workshop.entity.Workshop;
import com.dataacquisition.modules.workshop.mapper.WorkshopMapper;
import com.dataacquisition.modules.workshop.service.WorkshopService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

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
}
