package com.dataacquisition.modules.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.dataacquisition.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 系统配置实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_system_config")
public class SystemConfig extends BaseEntity {

    /**
     * 主键ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 配置键
     */
    private String configKey;

    /**
     * 配置值(JSON格式)
     */
    private String configValue;

    /**
     * 配置类型: STRING, JSON, NUMBER
     */
    private String configType;

    /**
     * 配置描述
     */
    private String description;

    /**
     * 配置分类
     */
    private String category;

    /**
     * 是否系统配置: 0-否, 1-是
     */
    private Integer isSystem;
}
