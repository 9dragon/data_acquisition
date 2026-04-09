package com.dataacquisition.modules.attendance.service.impl;

import cn.hutool.core.util.StrUtil;
import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.write.handler.AbstractSheetWriteHandler;
import com.alibaba.excel.write.metadata.style.WriteCellStyle;
import com.alibaba.excel.write.metadata.holder.WriteWorkbookHolder;
import com.alibaba.excel.write.metadata.holder.WriteSheetHolder;
import com.alibaba.excel.write.style.HorizontalCellStyleStrategy;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dataacquisition.modules.attendance.dto.AttendanceExportDto;
import com.dataacquisition.modules.attendance.dto.AttendanceQueryDto;
import com.dataacquisition.modules.attendance.entity.AttendanceRecord;
import com.dataacquisition.modules.attendance.service.AttendanceExportService;
import com.dataacquisition.modules.attendance.service.AttendanceService;
import com.dataacquisition.service.MinioService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 签到记录导出服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceExportServiceImpl implements AttendanceExportService {

    private final AttendanceService attendanceService;
    private final MinioService minioService;

    @Override
    public void exportToExcel(AttendanceQueryDto query, HttpServletResponse response) {
        try {
            // 设置不分页，获取所有数据
            query.setPageNum(1);
            query.setPageSize(50000);
            Page<AttendanceRecord> page = attendanceService.getList(query);

            List<AttendanceExportDto> exportData = convertToExportData(page.getRecords());

            // 设置响应头
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setCharacterEncoding("utf-8");

            String fileName = "签到记录_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
            response.setHeader("Content-disposition",
                "attachment;filename*=utf-8''" + URLEncoder.encode(fileName, StandardCharsets.UTF_8) + ".xlsx");

            // 创建居中样式
            WriteCellStyle headStyle = new WriteCellStyle();
            headStyle.setHorizontalAlignment(HorizontalAlignment.CENTER);
            headStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            WriteCellStyle contentStyle = new WriteCellStyle();
            contentStyle.setHorizontalAlignment(HorizontalAlignment.CENTER);
            contentStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            HorizontalCellStyleStrategy styleStrategy = new HorizontalCellStyleStrategy(headStyle, contentStyle);

            // 写入Excel
            EasyExcel.write(response.getOutputStream(), AttendanceExportDto.class)
                .registerWriteHandler(styleStrategy)
                .registerWriteHandler(new AbstractSheetWriteHandler() {
                    @Override
                    public void afterSheetCreate(WriteWorkbookHolder writeWorkbookHolder, WriteSheetHolder writeSheetHolder) {
                        // 设置首行（标题行）行高为30
                        var headerRow = writeSheetHolder.getSheet().getRow(0);
                        if (headerRow != null) {
                            headerRow.setHeightInPoints(30);
                        }
                        // 设置数据行行高为100（遍历所有行）
                        var sheet = writeSheetHolder.getSheet();
                        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                            var row = sheet.getRow(i);
                            if (row != null) {
                                row.setHeightInPoints(100);
                            }
                        }
                        // 设置位置列（索引5）列宽
                        writeSheetHolder.getSheet().setColumnWidth(5, 20 * 256);
                    }
                })
                .sheet("签到记录")
                .doWrite(exportData);

            log.info("导出签到记录成功，共{}条", exportData.size());

        } catch (IOException e) {
            log.error("导出签到记录失败", e);
            throw new RuntimeException("导出失败: " + e.getMessage());
        }
    }

    /**
     * 转换为导出数据
     */
    private List<AttendanceExportDto> convertToExportData(List<AttendanceRecord> records) {
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm:ss");
        return records.stream().map(record -> {
            AttendanceExportDto dto = new AttendanceExportDto();
            dto.setProjectName(record.getProjectName());
            dto.setUserName(record.getUserName());
            dto.setCheckInDate(record.getCheckInTime().toLocalDate());
            dto.setShiftName(record.getShiftName());
            dto.setCheckInTime(record.getCheckInTime().toLocalTime().format(timeFormatter));
            dto.setIsLate(record.getIsLate() == 1 ? "是" : "否");
            dto.setLocation(record.getLocation());
            dto.setRemark(record.getRemark());

            // 获取照片：从照片路径读取（带水印）
            String photoPath = record.getPhotoPath();
            if (StrUtil.isNotBlank(photoPath)) {
                try {
                    byte[] imageBytes = minioService.getImageBytes(photoPath);
                    if (imageBytes != null && imageBytes.length > 0) {
                        dto.setPhoto(imageBytes);
                    }
                } catch (Exception e) {
                    log.warn("读取图片失败: {}", photoPath, e);
                }
            }

            return dto;
        }).collect(Collectors.toList());
    }
}
