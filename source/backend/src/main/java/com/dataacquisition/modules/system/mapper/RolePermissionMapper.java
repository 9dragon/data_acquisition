package com.dataacquisition.modules.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.dataacquisition.modules.system.entity.RolePermission;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface RolePermissionMapper extends BaseMapper<RolePermission> {

    @Select("SELECT permission_id FROM t_role_permission WHERE role_id = #{roleId}")
    List<Long> selectPermissionIdsByRoleId(@Param("roleId") Long roleId);

    @Select("SELECT COUNT(*) FROM t_role_permission WHERE role_id = #{roleId}")
    int countByRoleId(@Param("roleId") Long roleId);

    void deleteByRoleId(@Param("roleId") Long roleId);

    void insertBatch(@Param("roleId") Long roleId, @Param("permissionIds") List<Long> permissionIds, @Param("createdBy") Long createdBy);
}
