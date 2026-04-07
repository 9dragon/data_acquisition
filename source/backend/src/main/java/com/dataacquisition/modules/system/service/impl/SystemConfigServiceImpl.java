package com.dataacquisition.modules.system.service.impl;

import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dataacquisition.modules.system.entity.SystemConfig;
import com.dataacquisition.modules.system.mapper.SystemConfigMapper;
import com.dataacquisition.modules.system.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * 系统配置Service实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SystemConfigServiceImpl extends ServiceImpl<SystemConfigMapper, SystemConfig> implements SystemConfigService {

    private final RedisTemplate<String, Object> redisTemplate;

    private static final String CONFIG_CACHE_PREFIX = "system:config:";
    private static final long CACHE_EXPIRE_HOURS = 1;

    @Override
    public String getConfigValue(String configKey) {
        // 先从缓存获取
        String cacheKey = CONFIG_CACHE_PREFIX + configKey;
        Object cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return (String) cached;
        }

        // 从数据库获取
        SystemConfig config = getOne(new LambdaQueryWrapper<SystemConfig>()
            .eq(SystemConfig::getConfigKey, configKey)
            .last("LIMIT 1"));

        if (config == null) {
            log.warn("配置不存在: {}", configKey);
            return null;
        }

        // 缓存配置
        redisTemplate.opsForValue().set(cacheKey, config.getConfigValue(), CACHE_EXPIRE_HOURS, TimeUnit.HOURS);

        return config.getConfigValue();
    }

    @Override
    public JSONObject getConfigJson(String configKey) {
        String value = getConfigValue(configKey);
        if (StrUtil.isBlank(value)) {
            return null;
        }
        try {
            return JSONUtil.parseObj(value);
        } catch (Exception e) {
            log.error("解析配置JSON失败: {}", configKey, e);
            return null;
        }
    }

    @Override
    public <T> T getConfigValue(String configKey, Class<T> clazz) {
        String value = getConfigValue(configKey);
        if (StrUtil.isBlank(value)) {
            return null;
        }
        try {
            JSONObject jsonObject = JSONUtil.parseObj(value);
            return jsonObject.toBean(clazz);
        } catch (Exception e) {
            log.error("解析配置失败: {}", configKey, e);
            return null;
        }
    }

    @Override
    public void updateConfig(String configKey, String configValue) {
        SystemConfig config = getOne(new LambdaQueryWrapper<SystemConfig>()
            .eq(SystemConfig::getConfigKey, configKey)
            .last("LIMIT 1"));

        if (config != null) {
            config.setConfigValue(configValue);
            updateById(config);
        } else {
            config = new SystemConfig();
            config.setConfigKey(configKey);
            config.setConfigValue(configValue);
            config.setConfigType("JSON");
            save(config);
        }

        // 清除缓存
        String cacheKey = CONFIG_CACHE_PREFIX + configKey;
        redisTemplate.delete(cacheKey);

        log.info("更新配置: {} = {}", configKey, configValue);
    }

    @Override
    public List<SystemConfig> getConfigsByCategory(String category) {
        return list(new LambdaQueryWrapper<SystemConfig>()
            .eq(SystemConfig::getCategory, category)
            .orderByAsc(SystemConfig::getId));
    }
}
