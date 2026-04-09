package com.dataacquisition.common.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 通用选项DTO，用于下拉选择器
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OptionDto {
    /**
     * 选项ID
     */
    private Object id;

    /**
     * 选项名称
     */
    private String name;
}
