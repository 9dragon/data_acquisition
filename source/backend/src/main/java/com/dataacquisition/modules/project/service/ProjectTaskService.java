package com.dataacquisition.modules.project.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.dataacquisition.modules.project.dto.ProjectTaskUpdateDTO;
import com.dataacquisition.modules.project.entity.ProjectTask;

import java.util.List;

/**
 * 项目任务Service接口
 */
public interface ProjectTaskService extends IService<ProjectTask> {

    /**
     * 分页查询项目的任务列表
     */
    Page<ProjectTask> pageTasks(Page<ProjectTask> page, Long projectId, String stageKey, String status);

    /**
     * 根据项目ID获取所有任务
     */
    List<ProjectTask> getTasksByProjectId(Long projectId);

    /**
     * 根据项目ID和阶段标识获取任务列表
     */
    List<ProjectTask> getTasksByProjectIdAndStageKey(Long projectId, String stageKey);

    /**
     * 根据ID获取任务详情
     */
    ProjectTask getTaskDetail(Long id);

    /**
     * 创建任务
     */
    boolean createTask(ProjectTask task);

    /**
     * 更新任务
     */
    boolean updateTask(ProjectTask task);

    /**
     * 更新任务进度
     */
    boolean updateTaskProgress(Long id, ProjectTaskUpdateDTO updateDTO);

    /**
     * 删除任务
     */
    boolean deleteTask(Long id);

    /**
     * 批量删除任务
     */
    boolean batchDeleteTasks(List<Long> ids);

    /**
     * 分页查询所有项目的任务列表（跨项目查询）
     */
    Page<ProjectTask> pageAllProjectTasks(Page<ProjectTask> page, String keyword, String status, Long projectId);
}
