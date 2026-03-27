package com.dataacquisition.modules.device.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.dataacquisition.modules.device.entity.DeviceType;

/**
 * 设备类型Service接口
 */
public interface DeviceTypeService extends IService<DeviceType> {

    /**
     * 分页查询设备类型列表
     *
     * @param page      页码
     * @param pageSize  每页条数
     * @param projectId 项目ID
     * @param processId 工序ID
     * @param keyword   关键词
     * @param sortBy    排序字段
     * @param sortOrder 排序方向
     * @return 分页结果
     */
    IPage<DeviceType> getDeviceTypePage(Integer page, Integer pageSize, Long projectId, Long processId, String keyword, String sortBy, String sortOrder);

    /**
     * 创建设备类型
     *
     * @param deviceType 设备类型
     * @return 是否成功
     */
    Boolean createDeviceType(DeviceType deviceType);

    /**
     * 更新设备类型
     *
     * @param deviceType 设备类型
     * @return 是否成功
     */
    Boolean updateDeviceType(DeviceType deviceType);

    /**
     * 删除设备类型
     *
     * @param id 设备类型ID
     * @return 是否成功
     */
    Boolean deleteDeviceType(Long id);

    /**
     * 检查编码唯一性
     *
     * @param projectId 项目ID
     * @param code      编码
     * @param excludeId 排除的ID
     * @return 是否唯一
     */
    Boolean checkCodeUnique(Long projectId, String code, Long excludeId);
}
