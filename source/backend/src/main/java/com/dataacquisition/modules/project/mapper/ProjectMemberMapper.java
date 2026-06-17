package com.dataacquisition.modules.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.dataacquisition.modules.project.entity.ProjectMember;
import org.apache.ibatis.annotations.Mapper;

/**
 * 项目-成员关系Mapper
 */
@Mapper
public interface ProjectMemberMapper extends BaseMapper<ProjectMember> {
}
