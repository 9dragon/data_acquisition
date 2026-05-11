package com.dataacquisition.modules.device.service;

import com.dataacquisition.modules.device.dto.DeviceResearchImportExportDto;
import com.dataacquisition.modules.device.dto.DeviceResearchImportResult;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * 设备调研导入导出服务接口
 * <p>
 * 提供设备调研数据的批量导入导出功能，支持：
 * - 下载导入模板（包含示例数据）
 * - 批量导入Excel数据
 * - 批量导出数据到Excel
 * <p>
 * 核心特性：导出的数据可以直接再次导入，无需手动修改
 */
public interface DeviceResearchImportExportService {

    /**
     * 下载导入模板
     * <p>
     * 生成包含示例数据的Excel模板文件，用户可以基于模板填写数据后导入
     *
     * @param response HTTP响应
     * @throws IOException IO异常
     */
    void downloadTemplate(HttpServletResponse response) throws IOException;

    /**
     * 批量导入设备调研数据
     * <p>
     * 从Excel文件批量导入设备调研数据，支持：
     * - 名称自动转换为ID（项目名称→项目ID、设备类型名称→设备类型ID、车间名称→车间ID）
     * - 布尔值格式转换（是/否 → true/false）
     * - JSON数组转换（逗号分隔 → JSON数组）
     * - 数据验证（必填字段、关联数据存在性）
     * - 错误信息收集（返回详细的行号和错误原因）
     *
     * @param file Excel文件
     * @return 导入结果（总数、成功数、失败数、错误明细）
     * @throws IOException IO异常
     */
    DeviceResearchImportResult importData(MultipartFile file) throws IOException;

    /**
     * 批量导出设备调研数据
     * <p>
     * 将设备调研数据导出为Excel文件，支持：
     * - ID自动转换为名称（项目ID→项目名称、设备类型ID→设备类型名称、车间ID→车间名称）
     * - 布尔值格式转换（true/false → 是/否）
     * - JSON数组转换（JSON数组 → 逗号分隔）
     * - 批量查询优化（避免N+1查询问题）
     * <p>
     * 导出的数据可以直接再次导入，无需手动修改
     *
     * @param ids 调研记录ID列表（为空或null则导出全部数据）
     * @param response HTTP响应
     * @throws IOException IO异常
     */
    void exportData(List<Long> ids, HttpServletResponse response) throws IOException;
}
