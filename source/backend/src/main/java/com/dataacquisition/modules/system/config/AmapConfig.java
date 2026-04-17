package com.dataacquisition.modules.system.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * 高德地图配置
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "amap")
public class AmapConfig {

    /**
     * 高德Web服务API Key
     */
    private String key;
}
