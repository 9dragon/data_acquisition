package com.dataacquisition.modules.device.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.dataacquisition.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 设备类型实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_device_type")
public class DeviceType extends BaseEntity {

    /**
     * 主键ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 所属项目ID
     */
    @TableField("project_id")
    private Long projectId;

    /**
     * 所属项目名称（冗余）
     */
    @TableField("project_name")
    private String projectName;

    /**
     * 类型编码
     */
    private String code;

    /**
     * 类型名称
     */
    private String name;

    /**
     * 类型描述
     */
    private String description;

    /**
     * 设备数量（非数据库字段）
     */
    @TableField(exist = false)
    private Integer deviceCount;
}
