package com.dataacquisition.modules.device.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.dataacquisition.common.dto.OptionDto;
import com.dataacquisition.modules.device.entity.Device;

import java.util.List;

/**
 * 设备Service接口
 */
public interface DeviceService extends IService<Device> {

    /**
     * 分页查询设备列表
     */
    Page<Device> pageDevices(Page<Device> page, String keyword, Long projectId, Long typeId);

    /**
     * 获取设备选项列表（用于下拉选择器）
     */
    List<OptionDto> getDeviceOptions(Long projectId, Long workshopId, String keyword);
}
