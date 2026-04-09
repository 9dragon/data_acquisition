package com.dataacquisition.modules.workshop.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.dataacquisition.common.dto.OptionDto;
import com.dataacquisition.modules.workshop.entity.Workshop;

import java.util.List;

/**
 * 车间Service接口
 */
public interface WorkshopService extends IService<Workshop> {

    /**
     * 获取车间选项列表（用于下拉选择器）
     */
    List<OptionDto> getWorkshopOptions(Long projectId, String keyword);
}
