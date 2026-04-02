package com.dataacquisition.modules.device.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.dataacquisition.modules.device.dto.DeviceTaskQueryDTO;
import com.dataacquisition.modules.device.dto.DeviceTaskUpdateDTO;
import com.dataacquisition.modules.device.entity.DeviceTask;

import java.util.List;

/**
 * 设备任务Service接口
 */
public interface DeviceTaskService extends IService<DeviceTask> {

    /**
     * 分页查询设备任务列表
     */
    Page<DeviceTask> pageDeviceTasks(Page<DeviceTask> page, DeviceTaskQueryDTO queryDTO);

    /**
     * 根据设备ID获取任务列表
     */
    List<DeviceTask> getTasksByDeviceId(Long deviceId);

    /**
     * 根据项目ID获取任务列表
     */
    List<DeviceTask> getTasksByProjectId(Long projectId);

    /**
     * 根据项目ID和阶段标识获取任务列表
     */
    List<DeviceTask> getTasksByProjectIdAndStageKey(Long projectId, String stageKey);

    /**
     * 根据ID获取任务详情
     */
    DeviceTask getTaskDetail(Long id);

    /**
     * 创建设备任务
     */
    boolean createDeviceTask(DeviceTask deviceTask);

    /**
     * 更新设备任务进度
     */
    boolean updateDeviceTaskProgress(Long id, DeviceTaskUpdateDTO updateDTO);

    /**
     * 删除设备任务
     */
    boolean deleteDeviceTask(Long id);

    /**
     * 批量删除设备任务
     */
    boolean batchDeleteDeviceTasks(List<Long> ids);

    /**
     * 初始化设备的任务列表
     * 根据项目阶段配置为设备创建初始任务
     */
    boolean initializeDeviceTasks(Long deviceId, Long projectId);

    /**
     * 统计项目任务关联的设备任务数量
     */
    long countByProjectTaskId(Long projectTaskId);
}
