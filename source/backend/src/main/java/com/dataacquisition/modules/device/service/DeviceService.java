package com.dataacquisition.modules.device.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.dataacquisition.modules.device.entity.Device;

/**
 * 设备Service接口
 */
public interface DeviceService extends IService<Device> {

    /**
     * 分页查询设备列表
     */
    Page<Device> pageDevices(Page<Device> page, String keyword, Long projectId, Long typeId);
}
