package com.dataacquisition.modules.attendance.service;

import com.dataacquisition.modules.attendance.dto.AttendanceQueryDto;

import jakarta.servlet.http.HttpServletResponse;

/**
 * 签到记录导出服务
 */
public interface AttendanceExportService {

    /**
     * 导出签到记录到Excel
     *
     * @param query    查询条件
     * @param response 响应
     */
    void exportToExcel(AttendanceQueryDto query, HttpServletResponse response);
}
