package com.dataacquisition.modules.device.service.impl;

import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONUtil;
import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.write.metadata.style.WriteCellStyle;
import com.alibaba.excel.write.style.HorizontalCellStyleStrategy;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.dataacquisition.common.exception.BusinessException;
import com.dataacquisition.common.excel.DropDownWriteHandler;
import com.dataacquisition.modules.device.dto.DeviceResearchImportExportDto;
import com.dataacquisition.modules.device.dto.DeviceResearchImportResult;
import com.dataacquisition.modules.device.entity.DeviceResearch;
import com.dataacquisition.modules.device.entity.DeviceType;
import com.dataacquisition.modules.device.service.DeviceResearchImportExportService;
import com.dataacquisition.modules.device.service.DeviceResearchService;
import com.dataacquisition.modules.device.service.DeviceTypeService;
import com.dataacquisition.modules.project.entity.Project;
import com.dataacquisition.modules.project.service.ProjectService;
import com.dataacquisition.modules.workshop.entity.Workshop;
import com.dataacquisition.modules.workshop.service.WorkshopService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 设备调研导入导出服务实现
 * <p>
 * 核心功能：
 * 1. 下载模板（包含示例数据）
 * 2. 批量导入（名称→ID转换、数据验证、批量保存）
 * 3. 批量导出（ID→名称转换、格式化）
 * <p>
 * 设计原则：导出的数据可以直接再次导入，无需手动修改
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DeviceResearchImportExportServiceImpl implements DeviceResearchImportExportService {

    private final DeviceResearchService deviceResearchService;
    private final ProjectService projectService;
    private final DeviceTypeService deviceTypeService;
    private final WorkshopService workshopService;

    @Override
    public void downloadTemplate(HttpServletResponse response) throws IOException {
        try {
            // 设置响应头
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setCharacterEncoding("utf-8");
            String fileName = URLEncoder.encode("设备调研导入模板", StandardCharsets.UTF_8);
            response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".xlsx");

            // 创建居中样式
            WriteCellStyle headStyle = createCenterStyle();
            WriteCellStyle contentStyle = createCenterStyle();
            HorizontalCellStyleStrategy styleStrategy = new HorizontalCellStyleStrategy(headStyle, contentStyle);

            // 构建下拉选项：列0=项目名称, 列1=设备类型名称, 列2=车间名称
            Map<Integer, List<String>> dropDownMap = new LinkedHashMap<>();

            List<String> projectNames = projectService.list().stream()
                    .map(Project::getName)
                    .filter(StrUtil::isNotBlank)
                    .distinct()
                    .collect(Collectors.toList());
            dropDownMap.put(0, projectNames);

            List<String> deviceTypeNames = deviceTypeService.list().stream()
                    .map(DeviceType::getName)
                    .filter(StrUtil::isNotBlank)
                    .distinct()
                    .collect(Collectors.toList());
            dropDownMap.put(1, deviceTypeNames);

            List<String> workshopNames = workshopService.list().stream()
                    .map(Workshop::getName)
                    .filter(StrUtil::isNotBlank)
                    .distinct()
                    .collect(Collectors.toList());
            dropDownMap.put(2, workshopNames);

            DropDownWriteHandler dropDownHandler = new DropDownWriteHandler(dropDownMap);

            // 写入Excel（仅表头，无示例数据）
            EasyExcel.write(response.getOutputStream(), DeviceResearchImportExportDto.class)
                    .registerWriteHandler(styleStrategy)
                    .registerWriteHandler(dropDownHandler)
                    .sheet("设备调研数据")
                    .doWrite(new ArrayList<>());

            log.info("下载设备调研导入模板成功");

        } catch (IOException e) {
            log.error("下载设备调研导入模板失败", e);
            throw new BusinessException("下载模板失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public DeviceResearchImportResult importData(MultipartFile file) throws IOException {
        // 读取Excel数据
        List<DeviceResearchImportExportDto> dataList = EasyExcel.read(file.getInputStream())
                .head(DeviceResearchImportExportDto.class)
                .sheet(0)
                .doReadSync();

        if (dataList == null || dataList.isEmpty()) {
            throw new BusinessException("Excel文件中没有数据");
        }

        // 构建名称到ID的映射缓存
        Map<String, Long> projectNameToId = buildProjectNameCache();
        Map<String, String> deviceTypeNameToId = buildDeviceTypeNameCache();
        Map<String, String> workshopNameToId = buildWorkshopNameCache();

        // 批量导入处理
        List<DeviceResearch> validEntities = new ArrayList<>();
        List<DeviceResearchImportResult.ImportError> errors = new ArrayList<>();

        int rowNum = 2; // Excel行号从2开始（第1行是表头）
        for (DeviceResearchImportExportDto dto : dataList) {
            try {
                // 跳过空行（所有关键字段都为空）
                if (isBlankRow(dto)) {
                    rowNum++;
                    continue;
                }

                // 验证必填字段
                validateRequiredFields(dto, rowNum);

                // 转换为实体对象
                DeviceResearch entity = convertToEntity(dto, projectNameToId, deviceTypeNameToId, workshopNameToId);
                validEntities.add(entity);

            } catch (Exception e) {
                // 记录错误信息
                errors.add(DeviceResearchImportResult.ImportError.builder()
                        .rowNum(rowNum)
                        .errorMessage(e.getMessage())
                        .dataPreview(buildDataPreview(dto))
                        .build());
                log.warn("导入第{}行数据失败: {}", rowNum, e.getMessage());
            }
            rowNum++;
        }

        // 批量保存有效数据
        if (!validEntities.isEmpty()) {
            deviceResearchService.saveBatch(validEntities);
            log.info("批量导入设备调研数据成功，成功{}条，失败{}条", validEntities.size(), errors.size());
        }

        // 返回导入结果
        return DeviceResearchImportResult.builder()
                .total(dataList.size())
                .successCount(validEntities.size())
                .failCount(errors.size())
                .errors(errors.isEmpty() ? null : errors)
                .build();
    }

    @Override
    public void exportData(List<Long> ids, HttpServletResponse response) throws IOException {
        try {
            // 查询数据
            List<DeviceResearch> entities;
            if (ids == null || ids.isEmpty()) {
                // 导出全部
                LambdaQueryWrapper<DeviceResearch> wrapper = new LambdaQueryWrapper<>();
                entities = deviceResearchService.list(wrapper);
            } else {
                // 导出指定ID
                entities = deviceResearchService.listByIds(ids);
            }

            // 批量查询并填充名称字段
            if (!entities.isEmpty()) {
                enrichEntitiesWithNames(entities);
            }

            // 转换为导出DTO
            List<DeviceResearchImportExportDto> exportData = entities.stream()
                    .map(this::convertToExportDto)
                    .collect(Collectors.toList());

            // 设置响应头
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setCharacterEncoding("utf-8");
            String fileName = URLEncoder.encode("设备调研数据_" + java.time.LocalDate.now(), StandardCharsets.UTF_8);
            response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".xlsx");

            // 创建居中样式
            WriteCellStyle headStyle = createCenterStyle();
            WriteCellStyle contentStyle = createCenterStyle();
            HorizontalCellStyleStrategy styleStrategy = new HorizontalCellStyleStrategy(headStyle, contentStyle);

            // 写入Excel
            EasyExcel.write(response.getOutputStream(), DeviceResearchImportExportDto.class)
                    .registerWriteHandler(styleStrategy)
                    .sheet("设备调研数据")
                    .doWrite(exportData);

            log.info("导出设备调研数据成功，共{}条", exportData.size());

        } catch (IOException e) {
            log.error("导出设备调研数据失败", e);
            throw new BusinessException("导出失败: " + e.getMessage());
        }
    }

    // ========== 私有辅助方法 ==========

    /**
     * 构建项目名称到ID的映射缓存
     */
    private Map<String, Long> buildProjectNameCache() {
        return projectService.list().stream()
                .collect(Collectors.toMap(Project::getName, Project::getId, (v1, v2) -> v1));
    }

    /**
     * 构建设备类型名称到ID的映射缓存
     */
    private Map<String, String> buildDeviceTypeNameCache() {
        return deviceTypeService.list().stream()
                .collect(Collectors.toMap(DeviceType::getName, dt -> String.valueOf(dt.getId()), (v1, v2) -> v1));
    }

    /**
     * 构建车间名称到ID的映射缓存
     */
    private Map<String, String> buildWorkshopNameCache() {
        return workshopService.list().stream()
                .collect(Collectors.toMap(Workshop::getName, ws -> String.valueOf(ws.getId()), (v1, v2) -> v1));
    }

    /**
     * 判断是否为空行
     */
    private boolean isBlankRow(DeviceResearchImportExportDto dto) {
        return StrUtil.isBlank(dto.getProjectName())
                && StrUtil.isBlank(dto.getDeviceTypeName())
                && StrUtil.isBlank(dto.getWorkshopName());
    }

    /**
     * 验证必填字段
     */
    private void validateRequiredFields(DeviceResearchImportExportDto dto, int rowNum) {
        List<String> missingFields = new ArrayList<>();

        if (StrUtil.isBlank(dto.getProjectName())) {
            missingFields.add("项目名称");
        }
        if (StrUtil.isBlank(dto.getDeviceTypeName())) {
            missingFields.add("设备类型名称");
        }
        if (StrUtil.isBlank(dto.getWorkshopName())) {
            missingFields.add("车间名称");
        }

        if (!missingFields.isEmpty()) {
            throw new BusinessException("第" + rowNum + "行：必填字段不能为空 - " + String.join("、", missingFields));
        }
    }

    /**
     * 转换为实体对象（导入）
     */
    private DeviceResearch convertToEntity(DeviceResearchImportExportDto dto,
                                           Map<String, Long> projectNameToId,
                                           Map<String, String> deviceTypeNameToId,
                                           Map<String, String> workshopNameToId) {
        DeviceResearch entity = new DeviceResearch();

        // 基础信息：名称转ID
        Long projectId = projectNameToId.get(dto.getProjectName().trim());
        if (projectId == null) {
            throw new BusinessException("项目名称不存在：" + dto.getProjectName());
        }
        entity.setProjectId(projectId);

        String deviceTypeId = deviceTypeNameToId.get(dto.getDeviceTypeName().trim());
        if (deviceTypeId == null) {
            throw new BusinessException("设备类型名称不存在：" + dto.getDeviceTypeName());
        }
        entity.setDeviceTypeId(deviceTypeId);

        String workshopId = workshopNameToId.get(dto.getWorkshopName().trim());
        if (workshopId == null) {
            throw new BusinessException("车间名称不存在：" + dto.getWorkshopName());
        }
        entity.setWorkshopId(workshopId);

        entity.setQuantity(dto.getQuantity() != null && dto.getQuantity() > 0 ? dto.getQuantity() : 1);
        entity.setDeviceManufacturer(dto.getDeviceManufacturer());
        entity.setRemarks(dto.getRemarks());

        // 控制器信息：布尔值转换
        entity.setIsInterfaceOccupied(parseBoolean(dto.getIsInterfaceOccupied()));
        entity.setInterfaceType(dto.getInterfaceType());
        entity.setHasTouchScreen(parseBoolean(dto.getHasTouchScreen()));
        entity.setControllerBrand(dto.getControllerBrand());
        entity.setControllerModel(dto.getControllerModel());
        entity.setTouchScreenBrand(dto.getTouchScreenBrand());
        entity.setHasPointTable(parseBoolean(dto.getHasPointTable()));
        entity.setHasPlcSource(parseBoolean(dto.getHasPlcSource()));
        entity.setHasTouchScreenSource(parseBoolean(dto.getHasTouchScreenSource()));

        // 采集信息：布尔值转换
        entity.setCollectDeviceStatus(parseBoolean(dto.getCollectDeviceStatus()));
        entity.setCollectProcessParams(parseBoolean(dto.getCollectProcessParams()));
        entity.setDataItems(parseJsonArray(dto.getDataItems()));
        entity.setDataItemsDetail(dto.getDataItemsDetail());
        entity.setCollectProduction(parseBoolean(dto.getCollectProduction()));
        entity.setCollectEnergy(parseBoolean(dto.getCollectEnergy()));

        // 初始化进度字段
        entity.setBasicCompleted(false);
        entity.setControllerCompleted(false);
        entity.setCollectionCompleted(false);
        entity.setResearchProgress(0);

        return entity;
    }

    /**
     * 转换为导出DTO（导出）
     */
    private DeviceResearchImportExportDto convertToExportDto(DeviceResearch entity) {
        DeviceResearchImportExportDto dto = new DeviceResearchImportExportDto();

        // 基础信息
        dto.setProjectName(entity.getProjectName());
        dto.setDeviceTypeName(entity.getDeviceTypeName());
        dto.setWorkshopName(entity.getWorkshopName());
        dto.setQuantity(entity.getQuantity());
        dto.setDeviceManufacturer(entity.getDeviceManufacturer());
        dto.setRemarks(entity.getRemarks());

        // 控制器信息：布尔值转中文
        dto.setIsInterfaceOccupied(formatBoolean(entity.getIsInterfaceOccupied()));
        dto.setInterfaceType(entity.getInterfaceType());
        dto.setHasTouchScreen(formatBoolean(entity.getHasTouchScreen()));
        dto.setControllerBrand(entity.getControllerBrand());
        dto.setControllerModel(entity.getControllerModel());
        dto.setTouchScreenBrand(entity.getTouchScreenBrand());
        dto.setHasPointTable(formatBoolean(entity.getHasPointTable()));
        dto.setHasPlcSource(formatBoolean(entity.getHasPlcSource()));
        dto.setHasTouchScreenSource(formatBoolean(entity.getHasTouchScreenSource()));

        // 采集信息：布尔值转中文
        dto.setCollectDeviceStatus(formatBoolean(entity.getCollectDeviceStatus()));
        dto.setCollectProcessParams(formatBoolean(entity.getCollectProcessParams()));
        dto.setDataItems(formatJsonArray(entity.getDataItems()));
        dto.setDataItemsDetail(entity.getDataItemsDetail());
        dto.setCollectProduction(formatBoolean(entity.getCollectProduction()));
        dto.setCollectEnergy(formatBoolean(entity.getCollectEnergy()));

        return dto;
    }

    /**
     * 解析布尔值（"是"/"否" → Boolean）
     */
    private Boolean parseBoolean(String value) {
        if (StrUtil.isBlank(value)) {
            return null;
        }
        return "是".equalsIgnoreCase(value.trim()) || "true".equalsIgnoreCase(value.trim());
    }

    /**
     * 格式化布尔值（Boolean → "是"/"否"）
     */
    private String formatBoolean(Boolean value) {
        if (value == null) {
            return "";
        }
        return value ? "是" : "否";
    }

    /**
     * 解析JSON数组（逗号分隔字符串 → JSON数组字符串）
     */
    private String parseJsonArray(String value) {
        if (StrUtil.isBlank(value)) {
            return null;
        }
        String trimmed = value.trim();
        // 如果已经是JSON数组格式，直接返回
        if (trimmed.startsWith("[")) {
            return trimmed;
        }
        // 逗号分隔转JSON数组
        String[] items = trimmed.split(",");
        JSONArray jsonArray = new JSONArray();
        for (String item : items) {
            if (StrUtil.isNotBlank(item)) {
                jsonArray.add(item.trim());
            }
        }
        return jsonArray.isEmpty() ? null : jsonArray.toString();
    }

    /**
     * 格式化JSON数组（JSON数组字符串 → 逗号分隔字符串）
     */
    private String formatJsonArray(String value) {
        if (StrUtil.isBlank(value)) {
            return "";
        }
        try {
            JSONArray jsonArray = JSONUtil.parseArray(value);
            return jsonArray.isEmpty() ? "" : jsonArray.join(",");
        } catch (Exception e) {
            return value; // 如果解析失败，返回原值
        }
    }

    /**
     * 批量查询并填充名称字段
     */
    private void enrichEntitiesWithNames(List<DeviceResearch> entities) {
        // 批量查询项目名称
        Set<Long> projectIds = entities.stream()
                .map(DeviceResearch::getProjectId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        if (!projectIds.isEmpty()) {
            Map<Long, String> projectNameMap = projectService.listByIds(projectIds).stream()
                    .collect(Collectors.toMap(Project::getId, Project::getName));
            entities.forEach(entity -> {
                if (entity.getProjectId() != null) {
                    entity.setProjectName(projectNameMap.get(entity.getProjectId()));
                }
            });
        }

        // 批量查询设备类型名称
        Set<String> deviceTypeIds = entities.stream()
                .map(DeviceResearch::getDeviceTypeId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        if (!deviceTypeIds.isEmpty()) {
            List<Long> deviceTypeIdLongs = deviceTypeIds.stream()
                    .map(Long::valueOf)
                    .collect(Collectors.toList());
            Map<String, String> deviceTypeNameMap = deviceTypeService.listByIds(deviceTypeIdLongs).stream()
                    .collect(Collectors.toMap(dt -> String.valueOf(dt.getId()), DeviceType::getName));
            entities.forEach(entity -> {
                if (entity.getDeviceTypeId() != null) {
                    entity.setDeviceTypeName(deviceTypeNameMap.get(entity.getDeviceTypeId()));
                }
            });
        }

        // 批量查询车间名称
        Set<String> workshopIds = entities.stream()
                .map(DeviceResearch::getWorkshopId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        if (!workshopIds.isEmpty()) {
            List<Long> workshopIdLongs = workshopIds.stream()
                    .map(Long::valueOf)
                    .collect(Collectors.toList());
            Map<String, String> workshopNameMap = workshopService.listByIds(workshopIdLongs).stream()
                    .collect(Collectors.toMap(ws -> String.valueOf(ws.getId()), Workshop::getName));
            entities.forEach(entity -> {
                if (entity.getWorkshopId() != null) {
                    entity.setWorkshopName(workshopNameMap.get(entity.getWorkshopId()));
                }
            });
        }
    }

    /**
     * 构建数据预览（用于错误提示）
     */
    private String buildDataPreview(DeviceResearchImportExportDto dto) {
        return String.format("项目:%s, 设备类型:%s, 车间:%s",
                dto.getProjectName(), dto.getDeviceTypeName(), dto.getWorkshopName());
    }

    /**
     * 创建居中样式
     */
    private WriteCellStyle createCenterStyle() {
        WriteCellStyle style = new WriteCellStyle();
        style.setHorizontalAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }
}
