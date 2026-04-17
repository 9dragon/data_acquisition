package com.dataacquisition.modules.system.service;

import java.util.Map;

/**
 * 地理编码服务
 */
public interface GeocodeService {

    /**
     * 逆地理编码：根据经纬度获取地址信息
     *
     * @param latitude  纬度（WGS-84）
     * @param longitude 经度（WGS-84）
     * @return 地址信息，包含 province, city, district, street, address 等字段
     */
    Map<String, Object> reverseGeocode(double latitude, double longitude);
}
