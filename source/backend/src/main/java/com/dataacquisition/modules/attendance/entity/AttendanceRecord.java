package com.dataacquisition.modules.attendance.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 签到记录实体
 */
@Data
@TableName("t_attendance_record")
public class AttendanceRecord {

    /**
     * 主键ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 项目ID
     */
    private Long projectId;

    /**
     * 项目名称（非数据库字段）
     */
    @TableField(exist = false)
    private String projectName;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 用户名
     */
    private String userName;

    /**
     * 签到时间
     */
    private LocalDateTime checkInTime;

    /**
     * 签到照片URL（带签名，用于展示）
     */
    private String photoUrl;

    /**
     * 签到照片路径（无签名，带水印，用于导出）
     */
    private String photoPath;

    /**
     * 签到位置
     */
    private String location;

    /**
     * 纬度
     */
    private BigDecimal latitude;

    /**
     * 经度
     */
    private BigDecimal longitude;

    /**
     * 详细地址
     */
    private String address;

    /**
     * 状态: NORMAL-正常, LATE-迟到
     */
    private String status;

    /**
     * 备注
     */
    private String remark;

    /**
     * 时段索引: 1-第一次, 2-第二次, ...
     */
    private Integer shiftIndex;

    /**
     * 时段名称: 上班打卡、下班打卡等
     */
    private String shiftName;

    /**
     * 是否迟到: 0-否, 1-是
     */
    private Integer isLate;

    /**
     * 原始照片URL(无水印)
     */
    private String originalPhotoUrl;

    /**
     * 带水印照片URL
     */
    private String watermarkPhotoUrl;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;
}
