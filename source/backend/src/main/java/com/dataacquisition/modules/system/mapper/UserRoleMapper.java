package com.dataacquisition.modules.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.dataacquisition.modules.system.entity.UserRole;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface UserRoleMapper extends BaseMapper<UserRole> {

    @Select("SELECT COUNT(*) FROM t_user_role WHERE role_id = #{roleId}")
    int countByRoleId(@Param("roleId") Long roleId);

    @Select("SELECT role_id FROM t_user_role WHERE user_id = #{userId}")
    java.util.List<Long> selectRoleIdsByUserId(@Param("userId") Long userId);
}
