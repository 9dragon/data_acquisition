package com.dataacquisition.modules.device.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dataacquisition.common.dto.OptionDto;
import com.dataacquisition.common.exception.BusinessException;
import com.dataacquisition.modules.device.entity.Device;
import com.dataacquisition.modules.device.entity.DeviceType;
import com.dataacquisition.modules.device.mapper.DeviceMapper;
import com.dataacquisition.modules.device.mapper.DeviceTypeMapper;
import com.dataacquisition.modules.device.service.DeviceTypeService;
import com.dataacquisition.modules.project.entity.Project;
import com.dataacquisition.modules.project.mapper.ProjectMapper;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 设备类型Service实现
 */
@Service
@RequiredArgsConstructor
public class DeviceTypeServiceImpl extends ServiceImpl<DeviceTypeMapper, DeviceType> implements DeviceTypeService {

    private final DeviceTypeMapper deviceTypeMapper;
    private final DeviceMapper deviceMapper;
    private final ProjectMapper projectMapper;

    @Override
    public IPage<DeviceType> getDeviceTypePage(Integer page, Integer pageSize, Long projectId, String keyword, String sortBy, String sortOrder) {
        Page<DeviceType> pageParam = new Page<>(page, pageSize);
        LambdaQueryWrapper<DeviceType> wrapper = new LambdaQueryWrapper<>();

        // 项目筛选
        if (projectId != null) {
            wrapper.eq(DeviceType::getProjectId, projectId);
        }

        // 关键词搜索
        if (StringUtils.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(DeviceType::getName, keyword)
                    .or()
                    .like(DeviceType::getCode, keyword)
                    .or()
                    .like(DeviceType::getDescription, keyword));
        }

        // 排序
        if (StringUtils.isNotBlank(sortBy)) {
            boolean isAsc = "asc".equalsIgnoreCase(sortOrder);
            switch (sortBy) {
                case "code":
                    wrapper.orderBy(true, isAsc, DeviceType::getCode);
                    break;
                case "name":
                    wrapper.orderBy(true, isAsc, DeviceType::getName);
                    break;
                case "createdAt":
                    wrapper.orderBy(true, isAsc, DeviceType::getCreatedAt);
                    break;
                default:
                    wrapper.orderByDesc(DeviceType::getCreatedAt);
            }
        } else {
            wrapper.orderByDesc(DeviceType::getCreatedAt);
        }

        IPage<DeviceType> result = deviceTypeMapper.selectPage(pageParam, wrapper);

        // TODO: 填充设备数量（暂时注释，避免查询t_device表导致的错误）
        // result.getRecords().forEach(deviceType -> {
        //     LambdaQueryWrapper<Device> deviceWrapper = new LambdaQueryWrapper<>();
        //     deviceWrapper.eq(Device::getTypeId, deviceType.getId());
        //     Integer count = deviceMapper.selectCount(deviceWrapper).intValue();
        //     deviceType.setDeviceCount(count);
        // });

        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean createDeviceType(DeviceType deviceType) {
        // 检查编码唯一性
        if (!checkCodeUnique(deviceType.getProjectId(), deviceType.getCode(), null)) {
            throw new BusinessException("设备类型编码已存在");
        }

        // 自动填充项目名称
        if (deviceType.getProjectId() != null) {
            Project project = projectMapper.selectById(deviceType.getProjectId());
            if (project != null) {
                deviceType.setProjectName(project.getName());
            }
        }

        return deviceTypeMapper.insert(deviceType) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean updateDeviceType(DeviceType deviceType) {
        // 检查编码唯一性（排除自身）
        if (!checkCodeUnique(deviceType.getProjectId(), deviceType.getCode(), deviceType.getId())) {
            throw new BusinessException("设备类型编码已存在");
        }

        // 自动填充项目名称
        if (deviceType.getProjectId() != null) {
            Project project = projectMapper.selectById(deviceType.getProjectId());
            if (project != null) {
                deviceType.setProjectName(project.getName());
            }
        }

        return deviceTypeMapper.updateById(deviceType) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean deleteDeviceType(Long id) {
        // 检查是否有关联设备
        LambdaQueryWrapper<Device> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Device::getTypeId, id);
        Long count = deviceMapper.selectCount(wrapper);
        if (count > 0) {
            throw new BusinessException("该设备类型下存在设备，无法删除");
        }

        return deviceTypeMapper.deleteById(id) > 0;
    }

    @Override
    public Boolean checkCodeUnique(Long projectId, String code, Long excludeId) {
        LambdaQueryWrapper<DeviceType> wrapper = new LambdaQueryWrapper<>();
        // 当 projectId 为 null 时，只检查 code 的唯一性（全局设备类型）
        // 当 projectId 不为 null 时，检查该 project 下 code 的唯一性
        if (projectId != null) {
            wrapper.eq(DeviceType::getProjectId, projectId);
        } else {
            wrapper.isNull(DeviceType::getProjectId);
        }
        wrapper.eq(DeviceType::getCode, code);
        if (excludeId != null) {
            wrapper.ne(DeviceType::getId, excludeId);
        }
        return deviceTypeMapper.selectCount(wrapper) == 0;
    }

    @Override
    public List<OptionDto> getDeviceTypeOptions(Long projectId, String keyword) {
        LambdaQueryWrapper<DeviceType> wrapper = new LambdaQueryWrapper<>();

        // 项目筛选：返回该项目专属的 + 通用类型（projectId为空）
        if (projectId != null) {
            wrapper.and(w -> w.eq(DeviceType::getProjectId, projectId)
                    .or()
                    .isNull(DeviceType::getProjectId));
        }

        // 关键词搜索
        if (StringUtils.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(DeviceType::getName, keyword)
                    .or()
                    .like(DeviceType::getCode, keyword));
        }

        // 排序
        wrapper.orderByDesc(DeviceType::getCreatedAt);

        List<DeviceType> list = this.list(wrapper);
        return list.stream()
                .map(dt -> new OptionDto(dt.getId(), dt.getName()))
                .collect(Collectors.toList());
    }
}
