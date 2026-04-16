package com.dataacquisition.modules.device.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.dataacquisition.modules.device.dto.*;
import com.dataacquisition.modules.device.entity.DeviceResearch;

/**
 * 设备调研Service接口
 */
public interface DeviceResearchService extends IService<DeviceResearch> {

    /**
     * 分页查询设备调研列表
     */
    Page<DeviceResearch> pageResearch(Page<DeviceResearch> page, Long projectId, String workshopId, String deviceTypeId);

    /**
     * 根据ID获取调研详情（关联查询）
     */
    DeviceResearch getById(Long id);

    /**
     * 创建调研
     */
    DeviceResearchResponse createResearch(DeviceResearchRequest request);

    /**
     * 计算调研进度
     */
    void calculateProgress(DeviceResearch research);

    /**
     * 更新基础信息
     */
    void updateBasic(Long id, BasicInfoRequest request);

    /**
     * 更新控制器信息
     */
    void updateController(Long id, ControllerInfoRequest request);

    /**
     * 更新采集信息
     */
    void updateCollection(Long id, CollectionInfoRequest request);

    /**
     * 转换为响应DTO
     */
    DeviceResearchResponse toResponse(DeviceResearch entity);
}
