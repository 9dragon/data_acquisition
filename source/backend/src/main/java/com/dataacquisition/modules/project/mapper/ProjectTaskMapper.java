package com.dataacquisition.modules.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dataacquisition.modules.project.entity.ProjectTask;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 项目任务Mapper接口
 */
@Mapper
public interface ProjectTaskMapper extends BaseMapper<ProjectTask> {

    /**
     * 根据项目ID查询任务列表（包含阶段信息）
     */
    @Select("SELECT * FROM t_project_task WHERE project_id = #{projectId} AND deleted = 0 ORDER BY start_date ASC")
    List<ProjectTask> selectByProjectId(@Param("projectId") Long projectId);

    /**
     * 根据项目ID和阶段标识查询任务列表
     */
    @Select("SELECT * FROM t_project_task WHERE project_id = #{projectId} AND stage_key = #{stageKey} AND deleted = 0 ORDER BY start_date ASC")
    List<ProjectTask> selectByProjectIdAndStageKey(@Param("projectId") Long projectId, @Param("stageKey") String stageKey);

    /**
     * 根据状态统计任务数量
     */
    @Select("SELECT status, COUNT(*) as count FROM t_project_task WHERE project_id = #{projectId} AND deleted = 0 GROUP BY status")
    List<Object> countByStatus(@Param("projectId") Long projectId);

    /**
     * 分页查询所有项目任务（带项目名称和阶段名称）
     */
    Page<ProjectTask> selectPageWithProjectName(Page<ProjectTask> page, @Param("projectId") Long projectId,
                                                 @Param("status") String status, @Param("keyword") String keyword);
}
