package com.dataacquisition.modules.device.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.dataacquisition.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 设备实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_device")
public class Device extends BaseEntity {

    /**
     * 主键
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 设备编码
     */
    private String code;

    /**
     * 设备名称
     */
    private String name;

    /**
     * 所属项目ID
     */
    private Long projectId;

    /**
     * 设备类型ID
     */
    private Long typeId;

    /**
     * 所属车间ID
     */
    private Long workshopId;

    /**
     * 设备描述
     */
    private String description;

    /**
     * 所属项目名称（非数据库字段）
     */
    @TableField(exist = false)
    private String projectName;

    /**
     * 设备类型名称（非数据库字段）
     */
    @TableField(exist = false)
    private String typeName;

    /**
     * 所属车间名称（非数据库字段）
     */
    @TableField(exist = false)
    private String workshopName;
}
