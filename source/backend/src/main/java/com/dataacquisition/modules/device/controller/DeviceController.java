package com.dataacquisition.modules.device.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dataacquisition.common.response.Result;
import com.dataacquisition.modules.device.entity.Device;
import com.dataacquisition.modules.device.service.DeviceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * 设备Controller
 */
@Tag(name = "设备管理", description = "设备相关接口")
@RestController
@RequestMapping("/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;

    /**
     * 分页查询设备列表
     */
    @Operation(summary = "分页查询设备列表")
    @GetMapping
    public Result<Page<Device>> pageDevices(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer pageNum,
            @Parameter(description = "每页条数") @RequestParam(defaultValue = "10") Integer pageSize,
            @Parameter(description = "关键词") @RequestParam(required = false) String keyword,
            @Parameter(description = "项目ID") @RequestParam(required = false) Long projectId,
            @Parameter(description = "类型ID") @RequestParam(required = false) Long typeId,
            @Parameter(description = "状态") @RequestParam(required = false) Integer status) {
        Page<Device> page = new Page<>(pageNum, pageSize);
        Page<Device> result = deviceService.pageDevices(page, keyword, projectId, typeId, status);
        return Result.success(result);
    }

    /**
     * 根据ID获取设备详情
     */
    @Operation(summary = "根据ID获取设备详情")
    @GetMapping("/{id}")
    public Result<Device> getDevice(@PathVariable Long id) {
        Device device = deviceService.getById(id);
        if (device == null) {
            return Result.error("设备不存在");
        }
        return Result.success(device);
    }

    /**
     * 新增设备
     */
    @Operation(summary = "新增设备")
    @PostMapping
    public Result<Void> createDevice(@Validated @RequestBody Device device) {
        deviceService.save(device);
        return Result.success();
    }

    /**
     * 更新设备
     */
    @Operation(summary = "更新设备")
    @PutMapping("/{id}")
    public Result<Void> updateDevice(@PathVariable Long id, @Validated @RequestBody Device device) {
        device.setId(id);
        deviceService.updateById(device);
        return Result.success();
    }

    /**
     * 删除设备
     */
    @Operation(summary = "删除设备")
    @DeleteMapping("/{id}")
    public Result<Void> deleteDevice(@PathVariable Long id) {
        deviceService.removeById(id);
        return Result.success();
    }
}
