package com.dataacquisition.modules.system.entity;

import lombok.Data;

/**
 * 资料需求
 */
@Data
public class MaterialRequirement {

    /**
     * 资料类型唯一标识
     */
    private String key;

    /**
     * 资料名称
     */
    private String name;

    /**
     * 资料说明
     */
    private String description;

    /**
     * 文件类型：image/video/document/spreadsheet/cad/other
     */
    private String fileType;

    /**
     * 是否必填
     */
    private Boolean required;

    /**
     * 最少数量
     */
    private Integer minCount;

    /**
     * 最多数量
     */
    private Integer maxCount;

    /**
     * 接受的文件MIME类型
     */
    private java.util.List<String> acceptTypes;
}
