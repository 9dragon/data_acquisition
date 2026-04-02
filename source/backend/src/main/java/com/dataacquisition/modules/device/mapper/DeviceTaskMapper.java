package com.dataacquisition.modules.device.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dataacquisition.modules.device.dto.DeviceTaskQueryDTO;
import com.dataacquisition.modules.device.entity.DeviceTask;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 设备任务Mapper接口
 */
@Mapper
public interface DeviceTaskMapper extends BaseMapper<DeviceTask> {

    /**
     * 根据设备ID查询任务列表
     */
    @Select("SELECT * FROM t_device_task WHERE device_id = #{deviceId} AND deleted = 0 ORDER BY stage_key ASC, task_key ASC")
    List<DeviceTask> selectByDeviceId(@Param("deviceId") Long deviceId);

    /**
     * 根据项目ID查询任务列表
     */
    @Select("SELECT * FROM t_device_task WHERE project_id = #{projectId} AND deleted = 0 ORDER BY project_name, stage_key ASC, task_key ASC")
    List<DeviceTask> selectByProjectId(@Param("projectId") Long projectId);

    /**
     * 根据项目ID和阶段标识查询任务列表
     */
    @Select("SELECT * FROM t_device_task WHERE project_id = #{projectId} AND stage_key = #{stageKey} AND deleted = 0 ORDER BY device_name ASC")
    List<DeviceTask> selectByProjectIdAndStageKey(@Param("projectId") Long projectId, @Param("stageKey") String stageKey);

    /**
     * 统计设备的任务完成情况
     */
    @Select("SELECT COUNT(*) as total, SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed FROM t_device_task WHERE device_id = #{deviceId} AND deleted = 0")
    Object countByDeviceId(@Param("deviceId") Long deviceId);

    /**
     * 分页查询设备任务（带设备名和项目名）
     */
    Page<DeviceTask> selectPageWithNames(
            @Param("page") Page<DeviceTask> page,
            @Param("queryDTO") DeviceTaskQueryDTO queryDTO
    );
}
