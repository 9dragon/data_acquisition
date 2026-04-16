package com.dataacquisition.modules.device.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dataacquisition.modules.device.dto.*;
import com.dataacquisition.modules.device.entity.DeviceResearch;
import com.dataacquisition.modules.device.mapper.DeviceResearchMapper;
import com.dataacquisition.modules.device.service.DeviceResearchService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 设备调研Service实现
 */
@Service
public class DeviceResearchServiceImpl extends ServiceImpl<DeviceResearchMapper, DeviceResearch> implements DeviceResearchService {

    @Override
    public Page<DeviceResearch> pageResearch(Page<DeviceResearch> page, Long projectId, String workshopId, String deviceTypeId) {
        return baseMapper.pageResearchWithNames(page, projectId, workshopId, deviceTypeId);
    }

    @Override
    public DeviceResearch getById(Long id) {
        return baseMapper.selectByIdWithNames(id);
    }

    @Override
    @Transactional
    public DeviceResearchResponse createResearch(DeviceResearchRequest request) {
        DeviceResearch entity = new DeviceResearch();

        // 设置基本信息
        entity.setProjectId(request.getProjectId());
        entity.setDeviceTypeId(request.getDeviceTypeId());
        entity.setWorkshopId(request.getWorkshopId());
        entity.setQuantity(request.getQuantity());
        entity.setDeviceManufacturer(request.getDeviceManufacturer());
        entity.setRemarks(request.getRemarks());

        // 初始化进度
        entity.setBasicCompleted(false);
        entity.setControllerCompleted(false);
        entity.setCollectionCompleted(false);
        entity.setResearchProgress(33); // 填写基础信息后设置为33%

        this.save(entity);
        return toResponse(entity);
    }

    @Override
    @Transactional
    public void calculateProgress(DeviceResearch research) {
        int completedCount = 0;

        if (Boolean.TRUE.equals(research.getBasicCompleted())) {
            completedCount++;
        }
        if (Boolean.TRUE.equals(research.getControllerCompleted())) {
            completedCount++;
        }
        if (Boolean.TRUE.equals(research.getCollectionCompleted())) {
            completedCount++;
        }

        research.setResearchProgress(Math.round((completedCount / 3.0f) * 100));
    }

    @Override
    @Transactional
    public void updateBasic(Long id, BasicInfoRequest request) {
        DeviceResearch existing = this.getById(id);
        if (existing == null) {
            throw new RuntimeException("调研记录不存在");
        }

        // 更新基础信息字段
        existing.setProjectId(request.getProjectId());
        existing.setDeviceTypeId(request.getDeviceTypeId());
        existing.setWorkshopId(request.getWorkshopId());
        existing.setQuantity(request.getQuantity());
        existing.setDeviceManufacturer(request.getDeviceManufacturer());
        existing.setRemarks(request.getRemarks());
        existing.setBasicCompleted(true);

        calculateProgress(existing);
        this.updateById(existing);
    }

    @Override
    @Transactional
    public void updateController(Long id, ControllerInfoRequest request) {
        DeviceResearch existing = this.getById(id);
        if (existing == null) {
            throw new RuntimeException("调研记录不存在");
        }

        // 更新控制器信息字段
        existing.setIsInterfaceOccupied(request.getIsInterfaceOccupied());
        existing.setInterfaceType(request.getInterfaceType());
        existing.setHasTouchScreen(request.getHasTouchScreen());
        existing.setTouchScreenBrand(request.getTouchScreenBrand());
        existing.setControllerBrand(request.getControllerBrand());
        existing.setControllerModel(request.getControllerModel());
        existing.setHasPointTable(request.getHasPointTable());
        existing.setHasPlcSource(request.getHasPlcSource());
        existing.setHasTouchScreenSource(request.getHasTouchScreenSource());
        existing.setControllerPhotos(request.getControllerPhotos());
        existing.setControllerVideos(request.getControllerVideos());
        existing.setTouchscreenPhotos(request.getTouchscreenPhotos());
        existing.setTouchscreenVideos(request.getTouchscreenVideos());
        existing.setCabinetPhotos(request.getCabinetPhotos());
        existing.setCabinetVideos(request.getCabinetVideos());
        existing.setControllerCompleted(true);

        calculateProgress(existing);
        this.updateById(existing);
    }

    @Override
    @Transactional
    public void updateCollection(Long id, CollectionInfoRequest request) {
        DeviceResearch existing = this.getById(id);
        if (existing == null) {
            throw new RuntimeException("调研记录不存在");
        }

        // 更新采集信息字段
        existing.setCollectDeviceStatus(request.getCollectDeviceStatus());
        existing.setCollectProcessParams(request.getCollectProcessParams());
        existing.setDataItems(request.getDataItems());
        existing.setDataItemsDetail(request.getDataItemsDetail());
        existing.setCollectProduction(request.getCollectProduction());
        existing.setCollectEnergy(request.getCollectEnergy());
        existing.setCollectionCompleted(true);

        calculateProgress(existing);
        this.updateById(existing);
    }

    @Override
    public DeviceResearchResponse toResponse(DeviceResearch entity) {
        DeviceResearchResponse response = new DeviceResearchResponse();
        BeanUtils.copyProperties(entity, response);
        return response;
    }
}
