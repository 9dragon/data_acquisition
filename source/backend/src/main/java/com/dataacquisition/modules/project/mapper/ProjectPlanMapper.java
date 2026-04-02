package com.dataacquisition.modules.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.dataacquisition.modules.project.entity.ProjectPlan;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 项目计划Mapper接口
 */
@Mapper
public interface ProjectPlanMapper extends BaseMapper<ProjectPlan> {

    /**
     * 根据项目ID查询计划
     */
    @Select("SELECT * FROM t_project_plan WHERE project_id = #{projectId} AND deleted = 0")
    ProjectPlan selectByProjectId(Long projectId);

    /**
     * 查询所有计划（带项目信息）
     */
    @Select("SELECT p.*, prj.name as project_name, prj.code as project_code " +
            "FROM t_project_plan p " +
            "LEFT JOIN t_project prj ON p.project_id = prj.id " +
            "WHERE p.deleted = 0 " +
            "ORDER BY p.created_at DESC")
    List<ProjectPlan> selectAllWithProject();
}
