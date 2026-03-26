package com.dataacquisition.modules.device.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dataacquisition.modules.device.entity.Device;
import com.dataacquisition.modules.device.mapper.DeviceMapper;
import com.dataacquisition.modules.device.service.DeviceService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

/**
 * 设备Service实现
 */
@Service
public class DeviceServiceImpl extends ServiceImpl<DeviceMapper, Device> implements DeviceService {

    @Override
    public Page<Device> pageDevices(Page<Device> page, String keyword, Long projectId, Long typeId, Integer status) {
        LambdaQueryWrapper<Device> wrapper = new LambdaQueryWrapper<>();

        // 关键词搜索
        if (StringUtils.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(Device::getName, keyword)
                    .or()
                    .like(Device::getCode, keyword));
        }

        // 项目筛选
        if (projectId != null) {
            wrapper.eq(Device::getProjectId, projectId);
        }

        // 类型筛选
        if (typeId != null) {
            wrapper.eq(Device::getTypeId, typeId);
        }

        // 状态筛选
        if (status != null) {
            wrapper.eq(Device::getStatus, status);
        }

        // 排序
        wrapper.orderByDesc(Device::getCreatedAt);

        return this.page(page, wrapper);
    }
}
