package com.dataacquisition.modules.dingtalk.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * 钉钉配置
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "dingtalk")
public class DingTalkConfig {

    /**
     * 钉钉AppKey
     */
    private String appKey;

    /**
     * 钉钉AppSecret
     */
    private String appSecret;

    /**
     * 钉钉AgentId
     */
    private String agentId;

    /**
     * 钉钉企业ID
     */
    private String corpId;

    /**
     * 同步配置
     */
    private SyncConfig sync = new SyncConfig();

    @Data
    public static class SyncConfig {
        /**
         * 是否启用同步
         */
        private Boolean enabled = true;

        /**
         * 同步定时任务cron表达式
         */
        private String cron = "0 0 2 * * ?";
    }
}
