package com.dataacquisition.modules.attendance.dto;

import com.alibaba.excel.annotation.ExcelProperty;
import com.alibaba.excel.annotation.write.style.ColumnWidth;
import lombok.Data;

import java.time.LocalDate;

/**
 * 签到记录导出DTO
 */
@Data
public class AttendanceExportDto {

    @ExcelProperty("项目")
    @ColumnWidth(20)
    private String projectName;

    @ExcelProperty("用户姓名")
    @ColumnWidth(15)
    private String userName;

    @ExcelProperty("签到日期")
    @ColumnWidth(15)
    private LocalDate checkInDate;

    @ExcelProperty("时段")
    @ColumnWidth(15)
    private String shiftName;

    @ExcelProperty("签到时间")
    @ColumnWidth(15)
    private String checkInTime;

    @ExcelProperty("是否迟到")
    @ColumnWidth(12)
    private String isLate;

    @ExcelProperty("位置")
    @ColumnWidth(20)
    private String location;

    /**
     * 照片字节数组（用于导出图片）
     */
    @ExcelProperty("照片")
    @ColumnWidth(20)
    private byte[] photo;

    @ExcelProperty("备注")
    @ColumnWidth(30)
    private String remark;
}
