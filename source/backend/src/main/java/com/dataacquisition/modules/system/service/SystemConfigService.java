package com.dataacquisition.modules.system.service;

import cn.hutool.json.JSONObject;
import com.baomidou.mybatisplus.extension.service.IService;
import com.dataacquisition.modules.system.entity.SystemConfig;

import java.util.List;

/**
 * 系统配置Service接口
 */
public interface SystemConfigService extends IService<SystemConfig> {

    /**
     * 获取配置值(字符串)
     *
     * @param configKey 配置键
     * @return 配置值
     */
    String getConfigValue(String configKey);

    /**
     * 获取配置值(JSON对象)
     *
     * @param configKey 配置键
     * @return JSON对象
     */
    JSONObject getConfigJson(String configKey);

    /**
     * 获取配置值(指定类型)
     *
     * @param configKey 配置键
     * @param clazz     目标类型
     * @param <T>       泛型
     * @return 配置值
     */
    <T> T getConfigValue(String configKey, Class<T> clazz);

    /**
     * 更新配置
     *
     * @param configKey   配置键
     * @param configValue 配置值
     */
    void updateConfig(String configKey, String configValue);

    /**
     * 获取分类下的所有配置
     *
     * @param category 配置分类
     * @return 配置列表
     */
    List<SystemConfig> getConfigsByCategory(String category);
}
