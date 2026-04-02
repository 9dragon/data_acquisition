package com.dataacquisition.modules.attendance.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 签到请求DTO
 */
@Data
@Schema(description = "签到请求")
public class CheckInRequestDto {

    @NotNull(message = "项目ID不能为空")
    @Schema(description = "项目ID")
    private Long projectId;

    @Schema(description = "照片Base64或URL")
    private String photo;

    @Schema(description = "纬度")
    private BigDecimal latitude;

    @Schema(description = "经度")
    private BigDecimal longitude;

    @Schema(description = "位置描述")
    private String location;

    @Schema(description = "详细地址")
    private String address;

    @Schema(description = "备注")
    private String remark;
}
