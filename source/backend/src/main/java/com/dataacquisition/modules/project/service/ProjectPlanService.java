package com.dataacquisition.modules.project.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.dataacquisition.modules.project.dto.ProjectPlanResponseDto;
import com.dataacquisition.modules.project.dto.ProjectPlanSummaryDto;
import com.dataacquisition.modules.project.dto.StageConfig;
import com.dataacquisition.modules.project.entity.ProjectPlan;

import java.util.List;

/**
 * 项目计划Service接口
 */
public interface ProjectPlanService extends IService<ProjectPlan> {

    /**
     * 根据项目ID获取计划
     */
    ProjectPlan getByProjectId(Long projectId);

    /**
     * 创建计划
     */
    boolean createPlan(ProjectPlan plan);

    /**
     * 更新计划
     */
    boolean updatePlan(ProjectPlan plan);

    /**
     * 删除计划
     */
    boolean deletePlan(Long id);

    /**
     * 获取所有计划列表（带项目信息）
     */
    List<ProjectPlan> getAllPlansWithProject();

    /**
     * 初始化项目计划的任务
     * 根据阶段配置从Stage模板生成ProjectTask记录
     *
     * @param projectId 项目ID
     * @param stageConfigs 阶段配置列表
     */
    void initializeTasksForPlan(Long projectId, List<StageConfig> stageConfigs);

    /**
     * 获取项目完整计划（含阶段、任务）
     *
     * @param projectId 项目ID
     * @return 项目计划响应DTO
     */
    ProjectPlanResponseDto getProjectPlanWithStages(Long projectId);

    /**
     * 获取所有计划摘要（包含任务数和进度）
     *
     * @return 计划摘要DTO列表
     */
    List<ProjectPlanSummaryDto> getAllPlansWithSummary();
}
