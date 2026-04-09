package com.dataacquisition.modules.device.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dataacquisition.common.dto.OptionDto;
import com.dataacquisition.modules.device.entity.Device;
import com.dataacquisition.modules.device.mapper.DeviceMapper;
import com.dataacquisition.modules.device.service.DeviceService;
import com.dataacquisition.modules.project.entity.Project;
import com.dataacquisition.modules.project.mapper.ProjectMapper;
import com.dataacquisition.modules.workshop.entity.Workshop;
import com.dataacquisition.modules.workshop.mapper.WorkshopMapper;
import com.dataacquisition.modules.device.entity.DeviceType;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 设备Service实现
 */
@Service
public class DeviceServiceImpl extends ServiceImpl<DeviceMapper, Device> implements DeviceService {

    @Autowired
    private ProjectMapper projectMapper;

    @Autowired
    private WorkshopMapper workshopMapper;

    @Autowired
    private com.dataacquisition.modules.device.mapper.DeviceTypeMapper deviceTypeMapper;

    @Override
    public Page<Device> pageDevices(Page<Device> page, String keyword, Long projectId, Long typeId) {
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

        // 排序
        wrapper.orderByDesc(Device::getCreatedAt);

        Page<Device> result = this.page(page, wrapper);

        // 填充关联名称
        fillRelatedNames(result.getRecords());

        return result;
    }

    private void fillRelatedNames(List<Device> devices) {
        if (devices == null || devices.isEmpty()) {
            return;
        }

        // 收集需要查询的ID
        List<Long> projectIds = devices.stream()
                .map(Device::getProjectId)
                .filter(id -> id != null)
                .distinct()
                .collect(Collectors.toList());

        List<Long> workshopIds = devices.stream()
                .map(Device::getWorkshopId)
                .filter(id -> id != null)
                .distinct()
                .collect(Collectors.toList());

        List<Long> typeIds = devices.stream()
                .map(Device::getTypeId)
                .filter(id -> id != null)
                .distinct()
                .collect(Collectors.toList());

        // 查询项目名称
        Map<Long, String> projectNameMap = projectMapper.selectBatchIds(projectIds).stream()
                .collect(Collectors.toMap(Project::getId, Project::getName));

        // 查询车间名称
        Map<Long, String> workshopNameMap = workshopMapper.selectBatchIds(workshopIds).stream()
                .collect(Collectors.toMap(Workshop::getId, Workshop::getName));

        // 查询设备类型名称
        Map<Long, String> typeNameMap = deviceTypeMapper.selectBatchIds(typeIds).stream()
                .collect(Collectors.toMap(DeviceType::getId, DeviceType::getName));

        // 填充名称
        for (Device device : devices) {
            if (device.getProjectId() != null) {
                device.setProjectName(projectNameMap.get(device.getProjectId()));
            }
            if (device.getWorkshopId() != null) {
                device.setWorkshopName(workshopNameMap.get(device.getWorkshopId()));
            }
            if (device.getTypeId() != null) {
                device.setTypeName(typeNameMap.get(device.getTypeId()));
            }
        }
    }

    @Override
    public List<OptionDto> getDeviceOptions(Long projectId, Long workshopId, String keyword) {
        LambdaQueryWrapper<Device> wrapper = new LambdaQueryWrapper<>();

        // 项目筛选
        if (projectId != null) {
            wrapper.eq(Device::getProjectId, projectId);
        }

        // 车间筛选
        if (workshopId != null) {
            wrapper.eq(Device::getWorkshopId, workshopId);
        }

        // 关键词搜索
        if (StringUtils.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(Device::getName, keyword)
                    .or()
                    .like(Device::getCode, keyword));
        }

        // 排序
        wrapper.orderByDesc(Device::getCreatedAt);

        List<Device> list = this.list(wrapper);
        return list.stream()
                .map(d -> new OptionDto(d.getId(), d.getName()))
                .collect(Collectors.toList());
    }
}
