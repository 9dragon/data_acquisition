package com.dataacquisition.common.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 设备状态枚举
 */
@Getter
@AllArgsConstructor
public enum DeviceStatus {

    ONLINE(1, "在线"),
    OFFLINE(0, "离线"),
    MAINTENANCE(2, "维护中");

    private final Integer code;
    private final String desc;
}
