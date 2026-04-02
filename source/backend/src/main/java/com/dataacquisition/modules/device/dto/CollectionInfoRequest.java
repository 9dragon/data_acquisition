package com.dataacquisition.modules.device.dto;

import lombok.Data;

/**
 * 采集信息请求DTO
 */
@Data
public class CollectionInfoRequest {

    /**
     * 采集设备状态
     */
    private Boolean collectDeviceStatus;

    /**
     * 采集工艺参数
     */
    private Boolean collectProcessParams;

    /**
     * 需采集数据项（JSON数组）
     */
    private String dataItems;

    /**
     * 数据项明细说明
     */
    private String dataItemsDetail;

    /**
     * 采集产量/节拍
     */
    private Boolean collectProduction;

    /**
     * 采集能耗
     */
    private Boolean collectEnergy;
}
