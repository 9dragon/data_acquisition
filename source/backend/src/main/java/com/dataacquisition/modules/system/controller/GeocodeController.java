package com.dataacquisition.modules.system.controller;

import com.dataacquisition.common.response.Result;
import com.dataacquisition.modules.system.service.GeocodeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 地理编码Controller
 */
@Tag(name = "地理编码", description = "逆地理编码接口")
@RestController
@RequestMapping("/geocode")
@RequiredArgsConstructor
public class GeocodeController {

    private final GeocodeService geocodeService;

    /**
     * 逆地理编码：经纬度转地址
     */
    @Operation(summary = "逆地理编码")
    @GetMapping("/reverse")
    public Result<Map<String, Object>> reverseGeocode(
            @RequestParam Double latitude,
            @RequestParam Double longitude
    ) {
        Map<String, Object> addressInfo = geocodeService.reverseGeocode(latitude, longitude);
        return Result.success(addressInfo);
    }
}
