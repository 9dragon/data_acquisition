package com.dataacquisition.modules.attendance.dto;

import com.alibaba.excel.annotation.ExcelProperty;
import com.alibaba.excel.annotation.write.style.ColumnWidth;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * 签到记录导出DTO
 */
@Data
public class AttendanceExportDto {

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
    private LocalTime checkInTime;

    @ExcelProperty("是否迟到")
    @ColumnWidth(12)
    private String isLate;

    @ExcelProperty("位置")
    @ColumnWidth(20)
    private String location;

    @ExcelProperty("详细地址")
    @ColumnWidth(30)
    private String address;

    @ExcelProperty("照片链接")
    @ColumnWidth(50)
    private String photoUrl;

    @ExcelProperty("备注")
    @ColumnWidth(30)
    private String remark;
}
