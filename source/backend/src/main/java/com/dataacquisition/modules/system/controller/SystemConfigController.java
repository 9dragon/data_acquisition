package com.dataacquisition.modules.system.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.dataacquisition.common.response.Result;
import com.dataacquisition.modules.system.entity.SystemConfig;
import com.dataacquisition.modules.system.service.SystemConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 系统配置管理Controller
 */
@Tag(name = "系统配置管理")
@RestController
@RequestMapping("/system/config")
@RequiredArgsConstructor
public class SystemConfigController {

    private final SystemConfigService systemConfigService;

    /**
     * 获取分类下的所有配置
     */
    @Operation(summary = "获取分类下的所有配置")
    @GetMapping("/category/{category}")
    public Result<List<SystemConfig>> getConfigsByCategory(@PathVariable String category) {
        return Result.success(systemConfigService.getConfigsByCategory(category));
    }

    /**
     * 获取单个配置
     * 统一返回JSON解析后的对象
     */
    @Operation(summary = "获取单个配置")
    @GetMapping("/{configKey}")
    public Result<Object> getConfig(@PathVariable String configKey) {
        SystemConfig config = systemConfigService.getOne(new LambdaQueryWrapper<SystemConfig>()
            .eq(SystemConfig::getConfigKey, configKey)
            .last("LIMIT 1"));

        if (config == null) {
            return Result.success(null);
        }

        Object jsonObj = systemConfigService.getConfigJson(configKey);
        if (jsonObj == null) {
            return Result.success(config.getConfigValue());
        }
        if (jsonObj instanceof cn.hutool.json.JSONObject) {
            return Result.success(((cn.hutool.json.JSONObject) jsonObj).toBean(Map.class));
        }
        return Result.success(jsonObj);
    }

    /**
     * 更新配置
     */
    @Operation(summary = "更新配置")
    @PutMapping("/{configKey}")
    public Result<Void> updateConfig(
        @PathVariable String configKey,
        @RequestBody @Valid ConfigUpdateDto dto
    ) {
        systemConfigService.updateConfig(configKey, dto.getConfigValue());
        return Result.success();
    }

    /**
     * 配置更新DTO
     */
    @Data
    public static class ConfigUpdateDto {
        /**
         * 配置值
         */
        private String configValue;
    }
}
