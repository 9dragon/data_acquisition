package com.dataacquisition.modules.device.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dataacquisition.common.response.Result;
import com.dataacquisition.modules.device.dto.*;
import com.dataacquisition.modules.device.entity.DeviceResearch;
import com.dataacquisition.modules.device.service.DeviceResearchService;
import com.dataacquisition.modules.system.service.SystemConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 设备调研Controller
 */
@Tag(name = "设备调研", description = "设备调研相关接口")
@RestController
@RequestMapping("/device-research")
@RequiredArgsConstructor
public class DeviceResearchController {

    private final DeviceResearchService deviceResearchService;
    private final SystemConfigService systemConfigService;

    /**
     * 分页查询设备调研列表
     */
    @Operation(summary = "分页查询设备调研列表")
    @GetMapping
    public Result<Page<DeviceResearch>> pageResearch(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer pageNum,
            @Parameter(description = "每页条数") @RequestParam(defaultValue = "10") Integer pageSize,
            @Parameter(description = "项目ID") @RequestParam(required = false) Long projectId,
            @Parameter(description = "车间ID") @RequestParam(required = false) String workshopId,
            @Parameter(description = "设备类型ID") @RequestParam(required = false) String deviceTypeId) {
        Page<DeviceResearch> page = new Page<>(pageNum, pageSize);
        Page<DeviceResearch> result = deviceResearchService.pageResearch(page, projectId, workshopId, deviceTypeId);
        return Result.success(result);
    }

    /**
     * 根据ID获取调研详情
     */
    @Operation(summary = "根据ID获取调研详情")
    @GetMapping("/{id}")
    public Result<DeviceResearch> getResearch(@PathVariable Long id) {
        DeviceResearch research = deviceResearchService.getById(id);
        if (research == null) {
            return Result.error("调研记录不存在");
        }
        return Result.success(research);
    }


    /**
     * 新增调研
     */
    @Operation(summary = "新增调研")
    @PostMapping
    public Result<DeviceResearchResponse> createResearch(@Validated @RequestBody DeviceResearchRequest request) {
        DeviceResearchResponse response = deviceResearchService.createResearch(request);
        return Result.success(response);
    }

    /**
     * 更新调研
     */
    @Operation(summary = "更新调研")
    @PutMapping("/{id}")
    public Result<Void> updateResearch(@PathVariable Long id, @Validated @RequestBody DeviceResearch research) {
        research.setId(id);
        deviceResearchService.updateById(research);
        return Result.success();
    }

    /**
     * 更新基础信息
     */
    @Operation(summary = "更新基础信息")
    @PutMapping("/{id}/basic")
    public Result<Void> updateBasic(@PathVariable Long id, @Validated @RequestBody BasicInfoRequest request) {
        deviceResearchService.updateBasic(id, request);
        return Result.success();
    }

    /**
     * 更新控制器信息
     */
    @Operation(summary = "更新控制器信息")
    @PutMapping("/{id}/controller")
    public Result<Void> updateController(@PathVariable Long id, @Validated @RequestBody ControllerInfoRequest request) {
        deviceResearchService.updateController(id, request);
        return Result.success();
    }

    /**
     * 更新采集信息
     */
    @Operation(summary = "更新采集信息")
    @PutMapping("/{id}/collection")
    public Result<Void> updateCollection(@PathVariable Long id, @Validated @RequestBody CollectionInfoRequest request) {
        deviceResearchService.updateCollection(id, request);
        return Result.success();
    }

    /**
     * 删除调研
     */
    @Operation(summary = "删除调研")
    @DeleteMapping("/{id}")
    public Result<Void> deleteResearch(@PathVariable Long id) {
        deviceResearchService.removeById(id);
        return Result.success();
    }

    /**
     * 获取设备调研下拉选项
     */
    @Operation(summary = "获取设备调研下拉选项")
    @GetMapping("/options")
    public Result<Map<String, List<String>>> getOptions() {
        Map<String, List<String>> options = new HashMap<>();
        cn.hutool.json.JSONArray jsonArray;

        // 获取设备厂商
        jsonArray = cn.hutool.json.JSONUtil.parseArray(systemConfigService.getConfigValue("device_research.manufacturer"));
        options.put("manufacturer", jsonArray != null ? jsonArray.toList(String.class) : List.of());

        // 获取接口类型
        jsonArray = cn.hutool.json.JSONUtil.parseArray(systemConfigService.getConfigValue("device_research.interface_type"));
        options.put("interfaceType", jsonArray != null ? jsonArray.toList(String.class) : List.of());

        // 获取控制器品牌
        jsonArray = cn.hutool.json.JSONUtil.parseArray(systemConfigService.getConfigValue("device_research.controller_brand"));
        options.put("controllerBrand", jsonArray != null ? jsonArray.toList(String.class) : List.of());

        // 获取数据项
        jsonArray = cn.hutool.json.JSONUtil.parseArray(systemConfigService.getConfigValue("device_research.data_items"));
        options.put("dataItems", jsonArray != null ? jsonArray.toList(String.class) : List.of());

        return Result.success(options);
    }

    /**
     * 更新设备调研下拉选项
     */
    @Operation(summary = "更新设备调研下拉选项")
    @PutMapping("/options/{optionKey}")
    public Result<Void> updateOptions(
            @PathVariable String optionKey,
            @RequestBody List<String> options) {
        String configKey = "device_research." + optionKey;
        systemConfigService.updateConfig(configKey, cn.hutool.json.JSONUtil.toJsonStr(options));
        return Result.success();
    }
}
