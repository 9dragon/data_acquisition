package com.dataacquisition.modules.device.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dataacquisition.modules.device.entity.DeviceResearch;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/**
 * 设备调研Mapper
 */
@Mapper
public interface DeviceResearchMapper extends BaseMapper<DeviceResearch> {

    /**
     * 分页查询调研列表（关联查询名称）
     */
    @Select("<script>" +
            "SELECT dr.*, " +
            "       p.name as project_name, " +
            "       dt.name as device_type_name, " +
            "       w.name as workshop_name, " +
            "       u.name as researcher_name " +
            "FROM t_device_research dr " +
            "LEFT JOIN t_project p ON dr.project_id = p.id " +
            "LEFT JOIN t_device_type dt ON dr.device_type_id = dt.id " +
            "LEFT JOIN t_workshop w ON dr.workshop_id = w.id " +
            "LEFT JOIN t_user u ON dr.researcher_id = u.id " +
            "WHERE dr.deleted = 0 " +
            "<if test='projectId != null'> AND dr.project_id = #{projectId} </if>" +
            "<if test='workshopId != null and workshopId != &quot;&quot;'> AND dr.workshop_id = #{workshopId} </if>" +
            "<if test='deviceTypeId != null and deviceTypeId != &quot;&quot;'> AND dr.device_type_id = #{deviceTypeId} </if>" +
            "ORDER BY dr.created_at DESC" +
            "</script>")
    Page<DeviceResearch> pageResearchWithNames(
            Page<DeviceResearch> page,
            @Param("projectId") Long projectId,
            @Param("workshopId") String workshopId,
            @Param("deviceTypeId") String deviceTypeId
    );
}
