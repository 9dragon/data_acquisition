package com.dataacquisition.modules.device.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 设备调研导入结果DTO
 * <p>
 * 用于返回批量导入的详细结果，包括成功、失败统计和错误明细
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceResearchImportResult {

    /**
     * 总记录数
     */
    private Integer total;

    /**
     * 成功导入数量
     */
    private Integer successCount;

    /**
     * 失败数量
     */
    private Integer failCount;

    /**
     * 错误明细列表
     * 如果全部成功则为null或空列表
     */
    private List<ImportError> errors;

    /**
     * 单个导入错误
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImportError {

        /**
         * 行号（从2开始，第1行是表头）
         */
        private Integer rowNum;

        /**
         * 错误信息
         */
        private String errorMessage;

        /**
         * 数据内容（用于定位问题行）
         * 示例：项目:项目A, 设备类型:车床, 车间:车间1
         */
        private String dataPreview;
    }
}
