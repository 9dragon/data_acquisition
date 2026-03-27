package com.dataacquisition.modules.device.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.dataacquisition.modules.device.entity.DeviceType;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 设备类型Mapper接口
 */
@Mapper
public interface DeviceTypeMapper extends BaseMapper<DeviceType> {

    /**
     * 根据项目ID查询设备类型列表
     *
     * @param projectId 项目ID
     * @return 设备类型列表
     */
    @Select("SELECT * FROM t_device_type WHERE project_id = #{projectId} AND deleted = 0")
    List<DeviceType> selectByProjectId(@Param("projectId") Long projectId);

    /**
     * 统计指定项目下的设备类型数量
     *
     * @param projectId 项目ID
     * @return 设备类型数量
     */
    @Select("SELECT COUNT(*) FROM t_device_type WHERE project_id = #{projectId} AND deleted = 0")
    int countByProjectId(@Param("projectId") Long projectId);
}
