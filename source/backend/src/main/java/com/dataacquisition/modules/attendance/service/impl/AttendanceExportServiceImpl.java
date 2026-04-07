package com.dataacquisition.modules.attendance.service.impl;

import cn.hutool.core.util.StrUtil;
import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.write.style.column.LongestMatchColumnWidthStyleStrategy;
import com.dataacquisition.modules.attendance.dto.AttendanceExportDto;
import com.dataacquisition.modules.attendance.dto.AttendanceQueryDto;
import com.dataacquisition.modules.attendance.entity.AttendanceRecord;
import com.dataacquisition.modules.attendance.service.AttendanceExportService;
import com.dataacquisition.modules.attendance.service.AttendanceService;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletResponse;
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

            // 写入Excel
            EasyExcel.write(response.getOutputStream(), AttendanceExportDto.class)
                .registerWriteHandler(new LongestMatchColumnWidthStyleStrategy())
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
        return records.stream().map(record -> {
            AttendanceExportDto dto = new AttendanceExportDto();
            dto.setUserName(record.getUserName());
            dto.setCheckInDate(record.getCheckInTime().toLocalDate());
            dto.setShiftName(record.getShiftName());
            dto.setCheckInTime(record.getCheckInTime().toLocalTime());
            dto.setIsLate(record.getIsLate() == 1 ? "是" : "否");
            dto.setLocation(record.getLocation());
            dto.setAddress(record.getAddress());
            dto.setPhotoUrl(record.getWatermarkPhotoUrl() != null ? record.getWatermarkPhotoUrl() : record.getPhotoUrl());
            dto.setRemark(record.getRemark());
            return dto;
        }).collect(Collectors.toList());
    }
}
