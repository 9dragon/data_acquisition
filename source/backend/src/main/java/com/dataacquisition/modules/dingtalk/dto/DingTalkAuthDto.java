package com.dataacquisition.modules.dingtalk.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 钉钉免登认证请求DTO
 */
@Data
@Schema(description = "钉钉免登认证请求")
public class DingTalkAuthDto {

    @NotBlank(message = "authCode不能为空")
    @Schema(description = "钉钉授权码")
    private String authCode;
}
