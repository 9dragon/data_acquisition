package com.dataacquisition.modules.system.service.impl;

import cn.hutool.http.HttpUtil;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.dataacquisition.modules.system.config.AmapConfig;
import com.dataacquisition.modules.system.service.GeocodeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * 地理编码服务实现 - 基于高德地图API
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GeocodeServiceImpl implements GeocodeService {

    private final AmapConfig amapConfig;

    private static final String REGEO_API = "https://restapi.amap.com/v3/geocode/regeo";

    @Override
    public Map<String, Object> reverseGeocode(double latitude, double longitude) {
        Map<String, Object> result = new HashMap<>();
        result.put("latitude", latitude);
        result.put("longitude", longitude);

        String key = amapConfig.getKey();
        if (key == null || key.isEmpty()) {
            log.warn("高德地图API Key未配置，跳过逆地理编码");
            return result;
        }

        try {
            // 高德API location参数格式：经度,纬度
            // coordsys=gps 表示输入坐标为WGS-84，高德会自动转换为GCJ-02
            Map<String, Object> params = new HashMap<>();
            params.put("key", key);
            params.put("location", longitude + "," + latitude);
            params.put("coordsys", "gps");
            params.put("extensions", "base");
            params.put("output", "JSON");

            String response = HttpUtil.get(REGEO_API, params);
            log.debug("高德逆地理编码响应: {}", response);

            JSONObject json = JSONUtil.parseObj(response);

            if (!"1".equals(json.getStr("status"))) {
                log.warn("高德逆地理编码失败: {}", json.getStr("info"));
                return result;
            }

            JSONObject regeocode = json.getJSONObject("regeocode");
            if (regeocode == null) {
                return result;
            }

            // 完整地址
            String formattedAddress = regeocode.getStr("formatted_address");
            result.put("address", formattedAddress);

            // 地址组件
            JSONObject addressComponent = regeocode.getJSONObject("addressComponent");
            if (addressComponent != null) {
                String province = addressComponent.getStr("province");
                String city = addressComponent.getStr("city");
                String district = addressComponent.getStr("district");
                String township = addressComponent.getStr("township");

                // 高德API中直辖市city字段为空数组，此时city等于province
                if (city == null || city.isEmpty() || "[]".equals(city)) {
                    city = province;
                }

                result.put("province", province);
                result.put("city", city);
                result.put("district", district);
                result.put("street", township);
            }

        } catch (Exception e) {
            log.error("调用高德逆地理编码API异常", e);
        }

        return result;
    }
}
