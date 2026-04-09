package com.dataacquisition.modules.device.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.dataacquisition.common.dto.OptionDto;
import com.dataacquisition.common.response.Result;
import com.dataacquisition.modules.device.entity.DeviceType;
import com.dataacquisition.modules.device.service.DeviceTypeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 设备类型Controller
 */
@Tag(name = "设备类型管理", description = "设备类型相关接口")
@RestController
@RequestMapping("/device-types")
@RequiredArgsConstructor
public class DeviceTypeController {

    private final DeviceTypeService deviceTypeService;

    /**
     * 分页查询设备类型列表
     */
    @Operation(summary = "分页查询设备类型列表")
    @GetMapping
    public Result<IPage<DeviceType>> pageDeviceTypes(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer page,
            @Parameter(description = "每页条数") @RequestParam(defaultValue = "10") Integer pageSize,
            @Parameter(description = "项目ID") @RequestParam(required = false) Long projectId,
            @Parameter(description = "关键词") @RequestParam(required = false) String keyword,
            @Parameter(description = "排序字段") @RequestParam(required = false) String sortBy,
            @Parameter(description = "排序方向") @RequestParam(required = false) String sortOrder) {
        IPage<DeviceType> result = deviceTypeService.getDeviceTypePage(page, pageSize, projectId, keyword, sortBy, sortOrder);
        return Result.success(result);
    }

    /**
     * 获取设备类型选项列表（用于下拉选择器）
     */
    @Operation(summary = "获取设备类型选项列表")
    @GetMapping("/options")
    public Result<List<OptionDto>> getDeviceTypeOptions(
            @Parameter(description = "项目ID") @RequestParam(required = false) Long projectId,
            @Parameter(description = "关键词") @RequestParam(required = false) String keyword) {
        List<OptionDto> options = deviceTypeService.getDeviceTypeOptions(projectId, keyword);
        return Result.success(options);
    }

    /**
     * 根据ID获取设备类型详情
     */
    @Operation(summary = "根据ID获取设备类型详情")
    @GetMapping("/{id}")
    public Result<DeviceType> getDeviceType(@PathVariable Long id) {
        DeviceType deviceType = deviceTypeService.getById(id);
        if (deviceType == null) {
            return Result.error("设备类型不存在");
        }
        return Result.success(deviceType);
    }

    /**
     * 创建设备类型
     */
    @Operation(summary = "创建设备类型")
    @PostMapping
    public Result<Void> createDeviceType(@Validated @RequestBody DeviceType deviceType) {
        deviceTypeService.createDeviceType(deviceType);
        return Result.success();
    }

    /**
     * 更新设备类型
     */
    @Operation(summary = "更新设备类型")
    @PutMapping("/{id}")
    public Result<Void> updateDeviceType(@PathVariable Long id, @Validated @RequestBody DeviceType deviceType) {
        deviceType.setId(id);
        deviceTypeService.updateDeviceType(deviceType);
        return Result.success();
    }

    /**
     * 删除设备类型
     */
    @Operation(summary = "删除设备类型")
    @DeleteMapping("/{id}")
    public Result<Void> deleteDeviceType(@PathVariable Long id) {
        deviceTypeService.deleteDeviceType(id);
        return Result.success();
    }
}
