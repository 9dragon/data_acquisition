package com.dataacquisition.common.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 项目状态枚举
 */
@Getter
@AllArgsConstructor
public enum ProjectStatus {

    NOT_STARTED(0, "未开始"),
    IN_PROGRESS(1, "进行中"),
    ON_HOLD(2, "暂停"),
    COMPLETED(3, "已完成"),
    CANCELLED(4, "已取消");

    private final Integer code;
    private final String desc;
}
