package com.dataacquisition.modules.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dataacquisition.modules.project.dto.*;
import com.dataacquisition.modules.project.entity.Project;
import com.dataacquisition.modules.project.entity.ProjectPlan;
import com.dataacquisition.modules.project.entity.ProjectTask;
import com.dataacquisition.modules.project.mapper.ProjectPlanMapper;
import com.dataacquisition.modules.project.mapper.ProjectTaskMapper;
import com.dataacquisition.modules.project.service.ProjectPlanService;
import com.dataacquisition.modules.project.service.ProjectService;
import com.dataacquisition.modules.project.service.ProjectTaskService;
import com.dataacquisition.modules.device.entity.DeviceTask;
import com.dataacquisition.modules.device.service.DeviceTaskService;
import com.dataacquisition.modules.device.mapper.DeviceTaskMapper;
import com.dataacquisition.modules.system.entity.Stage;
import com.dataacquisition.modules.system.entity.StageTaskTemplate;
import com.dataacquisition.modules.system.service.StageService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 项目计划Service实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectPlanServiceImpl extends ServiceImpl<ProjectPlanMapper, ProjectPlan> implements ProjectPlanService {

    private final ProjectTaskService projectTaskService;
    private final ProjectTaskMapper projectTaskMapper;
    private final StageService stageService;
    private final DeviceTaskService deviceTaskService;
    private final DeviceTaskMapper deviceTaskMapper;
    private final ProjectService projectService;
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    public ProjectPlan getByProjectId(Long projectId) {
        return baseMapper.selectByProjectId(projectId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean createPlan(ProjectPlan plan) {
        // 1. 保存项目计划
        boolean success = this.save(plan);

        if (success && plan.getStagesJson() != null && !plan.getStagesJson().isEmpty()) {
            try {
                // 2. 解析阶段配置并初始化任务
                List<StageConfig> stageConfigs = parseStageConfigs(plan.getStagesJson());
                if (stageConfigs != null && !stageConfigs.isEmpty()) {
                    initializeTasksForPlan(plan.getProjectId(), stageConfigs);
                }
            } catch (Exception e) {
                log.error("初始化项目任务失败: projectId={}", plan.getProjectId(), e);
                // 任务初始化失败不影响计划创建
            }
        }

        return success;
    }

    @Override
    public boolean updatePlan(ProjectPlan plan) {
        return this.updateById(plan);
    }

    @Override
    public boolean deletePlan(Long id) {
        return this.removeById(id);
    }

    @Override
    public List<ProjectPlan> getAllPlansWithProject() {
        return baseMapper.selectAllWithProject();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void initializeTasksForPlan(Long projectId, List<StageConfig> stageConfigs) {
        log.info("开始初始化项目任务: projectId={}, stageCount={}", projectId, stageConfigs.size());

        for (StageConfig config : stageConfigs) {
            try {
                // 使用前端配置的任务列表
                List<StageTaskConfigDTO> taskConfigs = config.getTasks();
                if (taskConfigs == null || taskConfigs.isEmpty()) {
                    log.warn("阶段没有配置任务: stageKey={}, 跳过", config.getStageKey());
                    continue;
                }

                // 为每个启用的任务创建任务记录
                for (StageTaskConfigDTO taskConfig : taskConfigs) {
                    // 只处理启用的任务
                    if (!taskConfig.getEnabled()) {
                        log.debug("任务未启用，跳过: stageKey={}, taskKey={}",
                                config.getStageKey(), taskConfig.getKey());
                        continue;
                    }

                    // 检查是否已存在
                    if (isTaskExists(projectId, config.getStageKey(), taskConfig.getKey())) {
                        log.debug("任务已存在，跳过: projectId={}, stageKey={}, taskKey={}",
                                projectId, config.getStageKey(), taskConfig.getKey());
                        continue;
                    }

                    // 创建项目级任务
                    ProjectTask task = buildProjectTaskFromConfig(projectId, config, taskConfig);
                    projectTaskService.createTask(task);
                    Long projectTaskId = task.getId();
                    log.info("创建任务成功: projectId={}, stageKey={}, taskName={}, taskId={}",
                            projectId, config.getStageKey(), taskConfig.getName(), projectTaskId);

                    // 如果是按设备推进的阶段，需要为每个设备创建设备任务
                    if (config.getDeviceIds() != null && !config.getDeviceIds().isEmpty()) {
                        for (Long deviceId : config.getDeviceIds()) {
                            for (StageTaskConfigDTO taskCfg : taskConfigs) {
                                if (!taskCfg.getEnabled()) {
                                    continue;
                                }

                                // 检查设备任务是否已存在
                                if (isDeviceTaskExists(projectId, config.getStageKey(), deviceId, taskCfg.getKey())) {
                                    log.debug("设备任务已存在，跳过: projectId={}, stageKey={}, deviceId={}, taskKey={}",
                                            projectId, config.getStageKey(), deviceId, taskCfg.getKey());
                                    continue;
                                }

                                // 创建设备任务，关联项目任务ID
                                DeviceTask deviceTask = buildDeviceTask(projectId, config, taskCfg, deviceId, projectTaskId);
                                deviceTaskService.createDeviceTask(deviceTask);
                                log.info("创建设备任务成功: projectId={}, stageKey={}, deviceId={}, taskName={}",
                                        projectId, config.getStageKey(), deviceId, taskCfg.getName());
                            }
                        }
                    }
                }

                log.info("项目任务初始化完成: projectId={}", projectId);

            } catch (Exception e) {
                log.error("处理阶段任务失败: stageKey={}, 跳过", config.getStageKey(), e);
            }
        }
    }

    /**
     * 解析阶段配置JSON
     */
    private List<StageConfig> parseStageConfigs(String stagesJson) {
        try {
            return objectMapper.readValue(stagesJson, new TypeReference<List<StageConfig>>() {});
        } catch (Exception e) {
            log.error("解析阶段配置JSON失败: {}", stagesJson, e);
            return null;
        }
    }

    /**
     * 构建ProjectTask对象（从任务配置）
     */
    private ProjectTask buildProjectTaskFromConfig(Long projectId, StageConfig stageConfig, StageTaskConfigDTO taskConfig) {
        ProjectTask task = new ProjectTask();
        task.setProjectId(projectId);
        task.setStageKey(stageConfig.getStageKey());
        task.setTaskKey(taskConfig.getKey());
        task.setName(taskConfig.getName());
        task.setDescription(taskConfig.getDescription());
        task.setStatus("pending");
        task.setProgress(0);

        // 使用任务配置中的日期（如果有的话），否则使用阶段日期
        if (taskConfig.getStartDate() != null) {
            task.setStartDate(LocalDate.parse(taskConfig.getStartDate()));
        } else if (stageConfig.getStartDate() != null) {
            task.setStartDate(LocalDate.parse(stageConfig.getStartDate()));
        }

        if (taskConfig.getEndDate() != null) {
            task.setEndDate(LocalDate.parse(taskConfig.getEndDate()));
        } else if (stageConfig.getEndDate() != null) {
            task.setEndDate(LocalDate.parse(stageConfig.getEndDate()));
        }

        // 使用任务配置中的负责人（如果有的话），否则使用阶段负责人
        if (taskConfig.getManagerId() != null) {
            task.setManagerId(taskConfig.getManagerId().longValue());
        } else if (stageConfig.getManagerId() != null) {
            task.setManagerId(stageConfig.getManagerId().longValue());
        }

        // 使用任务配置中的参与人（如果有的话），否则使用阶段参与人
        if (taskConfig.getParticipantIds() != null && taskConfig.getParticipantIds().length > 0) {
            task.setParticipantIds(String.join(",", 
                java.util.Arrays.stream(taskConfig.getParticipantIds())
                    .map(String::valueOf)
                    .toArray(String[]::new)));
        } else if (stageConfig.getParticipantIds() != null && stageConfig.getParticipantIds().length > 0) {
            task.setParticipantIds(String.join(",", 
                java.util.Arrays.stream(stageConfig.getParticipantIds())
                    .map(String::valueOf)
                    .toArray(String[]::new)));
        }

        return task;
    }

    /**
     * 构建ProjectTask对象
     */
    private ProjectTask buildProjectTask(Long projectId, StageConfig config, StageTaskTemplate template) {
        ProjectTask task = new ProjectTask();
        task.setProjectId(projectId);
        task.setStageKey(config.getStageKey());
        task.setTaskKey(template.getKey());
        task.setName(template.getName());
        task.setDescription(template.getDescription());
        task.setStatus("pending");
        task.setProgress(0);

        // 设置日期
        if (config.getStartDate() != null) {
            task.setStartDate(LocalDate.parse(config.getStartDate()));
        }
        if (config.getEndDate() != null) {
            task.setEndDate(LocalDate.parse(config.getEndDate()));
        }

        // 设置负责人
        if (config.getManagerId() != null) {
            task.setManagerId(config.getManagerId());
        }

        return task;
    }

    /**
     * 检查任务是否已存在
     */
    private boolean isTaskExists(Long projectId, String stageKey, String taskKey) {
        LambdaQueryWrapper<ProjectTask> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProjectTask::getProjectId, projectId)
                .eq(ProjectTask::getStageKey, stageKey)
                .eq(ProjectTask::getTaskKey, taskKey);
        return projectTaskMapper.selectCount(wrapper) > 0;
    }

    /**
     * 构建设备任务对象
     */
    private DeviceTask buildDeviceTask(Long projectId, StageConfig stageConfig,
                                       StageTaskConfigDTO taskConfig, Long deviceId, Long projectTaskId) {
        DeviceTask deviceTask = new DeviceTask();
        deviceTask.setDeviceId(deviceId);
        deviceTask.setProjectId(projectId);
        deviceTask.setStageKey(stageConfig.getStageKey());
        deviceTask.setTaskKey(taskConfig.getKey());
        deviceTask.setTaskName(taskConfig.getName());
        deviceTask.setProjectTaskId(projectTaskId);
        deviceTask.setCompleted(false);

        // 使用任务配置中的负责人（如果有的话），否则使用阶段负责人
        if (taskConfig.getManagerId() != null) {
            deviceTask.setManagerId(taskConfig.getManagerId().longValue());
        } else if (stageConfig.getManagerId() != null) {
            deviceTask.setManagerId(stageConfig.getManagerId().longValue());
        }

        // 使用任务配置中的参与人（如果有的话），否则使用阶段参与人
        if (taskConfig.getParticipantIds() != null && taskConfig.getParticipantIds().length > 0) {
            deviceTask.setParticipantIds(String.join(",", 
                java.util.Arrays.stream(taskConfig.getParticipantIds())
                    .map(String::valueOf)
                    .toArray(String[]::new)));
        } else if (stageConfig.getParticipantIds() != null && stageConfig.getParticipantIds().length > 0) {
            deviceTask.setParticipantIds(String.join(",", 
                java.util.Arrays.stream(stageConfig.getParticipantIds())
                    .map(String::valueOf)
                    .toArray(String[]::new)));
        }

        return deviceTask;
    }

    /**
     * 检查设备任务是否已存在
     */
    private boolean isDeviceTaskExists(Long projectId, String stageKey, Long deviceId, String taskKey) {
        LambdaQueryWrapper<DeviceTask> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DeviceTask::getProjectId, projectId)
                .eq(DeviceTask::getStageKey, stageKey)
                .eq(DeviceTask::getDeviceId, deviceId)
                .eq(DeviceTask::getTaskKey, taskKey);
        return deviceTaskMapper.selectCount(wrapper) > 0;
    }

    @Override
    public ProjectPlanResponseDto getProjectPlanWithStages(Long projectId) {
        log.info("获取项目完整计划: projectId={}", projectId);

        // 1. 查询项目信息
        Project project = projectService.getById(projectId);
        if (project == null) {
            log.warn("项目不存在: projectId={}", projectId);
            return null;
        }

        // 2. 查询项目计划记录
        ProjectPlan plan = getByProjectId(projectId);

        // 3. 查询所有阶段定义
        List<Stage> allStages = stageService.getAllStages();
        List<Stage> selectedStages;
        List<StageConfig> stageConfigs = null;

        // 4. 根据项目计划配置获取阶段
        if (plan != null && plan.getStagesJson() != null && !plan.getStagesJson().isEmpty()) {
            // 解析 stagesJson，获取项目选择的阶段
            try {
                stageConfigs = parseStageConfigs(plan.getStagesJson());
                // 提取阶段key列表
                List<String> stageKeys = stageConfigs.stream()
                        .map(StageConfig::getStageKey)
                        .collect(Collectors.toList());
                log.info("项目配置的阶段: projectId={}, stageKeys={}", projectId, stageKeys);

                // 根据key过滤阶段
                selectedStages = allStages.stream()
                        .filter(s -> stageKeys.contains(s.getKey()))
                        .collect(Collectors.toList());
            } catch (Exception e) {
                log.error("解析stagesJson失败，使用所有阶段: projectId={}", projectId, e);
                selectedStages = allStages;
            }
        } else {
            // 没有项目计划配置，返回所有阶段
            log.info("无项目计划配置，返回所有阶段: projectId={}", projectId);
            selectedStages = allStages;
        }

        // 5. 查询项目所有任务
        List<ProjectTask> allTasks = projectTaskService.getTasksByProjectId(projectId);

        // 6. 构建阶段配置Map（便于查找）
        java.util.Map<String, StageConfig> stageConfigMap = new java.util.HashMap<>();
        if (stageConfigs != null) {
            stageConfigMap = stageConfigs.stream()
                    .collect(Collectors.toMap(StageConfig::getStageKey, c -> c));
        }

        // 7. 构建阶段DTO列表
        List<ProjectPlanStageDto> stageDtos = new ArrayList<>();
        for (Stage stage : selectedStages) {
            List<ProjectTask> stageTasks = allTasks.stream()
                    .filter(t -> stage.getKey().equals(t.getStageKey()))
                    .collect(Collectors.toList());

            StageConfig stageConfig = stageConfigMap.get(stage.getKey());
            ProjectPlanStageDto stageDto = buildStageDto(stage, stageTasks, stageConfig);
            stageDtos.add(stageDto);
        }

        // 8. 构建任务DTO列表

        // 7. 构建任务DTO列表
        List<ProjectTaskDto> taskDtos = allTasks.stream()
                .map(this::buildTaskDto)
                .collect(Collectors.toList());

        // 8. 组装响应
        ProjectPlanResponseDto response = new ProjectPlanResponseDto();
        response.setId(plan != null ? plan.getId() : null);
        response.setProjectId(project.getId());
        response.setProjectName(project.getName());
        response.setProjectCode(project.getCode());
        response.setName(plan != null ? plan.getName() : project.getName() + "计划");
        response.setDescription(plan != null ? plan.getDescription() : project.getDescription());
        response.setStartDate(plan != null && plan.getStartDate() != null ? plan.getStartDate().toString() : null);
        response.setEndDate(plan != null && plan.getEndDate() != null ? plan.getEndDate().toString() : null);
        response.setStages(stageDtos);
        response.setTasks(taskDtos);
        response.setCreatedAt(plan != null && plan.getCreatedAt() != null ?
                plan.getCreatedAt().format(DATETIME_FORMATTER) : null);
        response.setUpdatedAt(plan != null && plan.getUpdatedAt() != null ?
                plan.getUpdatedAt().format(DATETIME_FORMATTER) : null);

        log.info("获取项目完整计划成功: projectId={}, stages={}, tasks={}",
                projectId, stageDtos.size(), taskDtos.size());

        return response;
    }

    /**
     * 构建阶段DTO
     */
    private ProjectPlanStageDto buildStageDto(Stage stage, List<ProjectTask> tasks, StageConfig stageConfig) {
        ProjectPlanStageDto dto = new ProjectPlanStageDto();
        dto.setStageKey(stage.getKey());
        dto.setStageName(stage.getName());
        dto.setDescription(stage.getDescription());
        dto.setColor(stage.getColor());
        dto.setIcon(stage.getIcon());
        dto.setProgressMode(stage.getProgressMode());
        dto.setDefaultWeight(stage.getDefaultWeight());
        dto.setTaskCount(tasks.size());
        dto.setCompletedTaskCount((int) tasks.stream().filter(t -> "completed".equals(t.getStatus())).count());
        dto.setProgress(calculateStageProgress(tasks));

        // 计划日期：从 stageConfig 获取
        if (stageConfig != null) {
            log.info("阶段日期配置: stageKey={}, startDate={}, endDate={}",
                stageConfig.getStageKey(), stageConfig.getStartDate(), stageConfig.getEndDate());
            dto.setStartDate(stageConfig.getStartDate());
            dto.setEndDate(stageConfig.getEndDate());
        } else {
            log.warn("stageConfig为空: stageKey={}", stage.getKey());
        }

        // 实际日期：只统计已执行的任务（in_progress 或 completed）
        if (!tasks.isEmpty()) {
            // 实际开始时间：从已开始的任务中取最早的 startDate
            LocalDate minStart = tasks.stream()
                    .filter(t -> "in_progress".equals(t.getStatus()) || "completed".equals(t.getStatus()))
                    .map(ProjectTask::getStartDate)
                    .filter(java.util.Objects::nonNull)
                    .min(LocalDate::compareTo)
                    .orElse(null);

            // 实际结束时间：从已完成的任务中取最晚的 endDate
            LocalDate maxEnd = tasks.stream()
                    .filter(t -> "completed".equals(t.getStatus()))
                    .map(ProjectTask::getEndDate)
                    .filter(java.util.Objects::nonNull)
                    .max(LocalDate::compareTo)
                    .orElse(null);

            dto.setActualStartDate(minStart != null ? minStart.toString() : null);
            dto.setActualEndDate(maxEnd != null ? maxEnd.toString() : null);
        }

        // 设置任务列表
        List<ProjectTaskDto> taskDtos = tasks.stream()
                .map(this::buildTaskDto)
                .collect(Collectors.toList());
        dto.setTasks(taskDtos);

        return dto;
    }

    /**
     * 构建任务DTO
     */
    private ProjectTaskDto buildTaskDto(ProjectTask task) {
        ProjectTaskDto dto = new ProjectTaskDto();
        dto.setId(task.getId());
        dto.setProjectId(task.getProjectId());
        dto.setStageKey(task.getStageKey());
        dto.setStageName(task.getStageName());
        dto.setTaskKey(task.getTaskKey());
        dto.setName(task.getName());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus());
        dto.setStartDate(task.getStartDate() != null ? task.getStartDate().toString() : null);
        dto.setEndDate(task.getEndDate() != null ? task.getEndDate().toString() : null);
        dto.setProgress(task.getProgress());
        dto.setActualStartDate(task.getActualStartDate() != null ? task.getActualStartDate().toString() : null);
        dto.setActualEndDate(task.getActualEndDate() != null ? task.getActualEndDate().toString() : null);

        dto.setCreatedAt(task.getCreatedAt() != null ? task.getCreatedAt().format(DATETIME_FORMATTER) : null);
        dto.setUpdatedAt(task.getUpdatedAt() != null ? task.getUpdatedAt().format(DATETIME_FORMATTER) : null);
        return dto;
    }

    /**
     * 计算阶段进度
     */
    private Integer calculateStageProgress(List<ProjectTask> tasks) {
        if (tasks == null || tasks.isEmpty()) {
            return 0;
        }
        int totalProgress = tasks.stream()
                .mapToInt(t -> t.getProgress() != null ? t.getProgress() : 0)
                .sum();
        return totalProgress / tasks.size();
    }

    @Override
    public List<ProjectPlanSummaryDto> getAllPlansWithSummary() {
        // 1. 获取所有计划和项目信息
        List<ProjectPlan> plans = baseMapper.selectAllWithProject();

        return plans.stream().map(plan -> {
            ProjectPlanSummaryDto dto = new ProjectPlanSummaryDto();
            dto.setId(plan.getId());
            dto.setProjectId(plan.getProjectId());
            dto.setProjectName(plan.getProjectName());
            dto.setProjectCode(plan.getProjectCode());
            dto.setName(plan.getName());
            dto.setDescription(plan.getDescription());
            dto.setStartDate(plan.getStartDate() != null ? plan.getStartDate().toString() : null);
            dto.setEndDate(plan.getEndDate() != null ? plan.getEndDate().toString() : null);
            dto.setStagesJson(plan.getStagesJson());
            dto.setCreatedAt(plan.getCreatedAt() != null ?
                    plan.getCreatedAt().format(DATETIME_FORMATTER) : null);
            dto.setUpdatedAt(plan.getUpdatedAt() != null ?
                    plan.getUpdatedAt().format(DATETIME_FORMATTER) : null);

            // 2. 查询项目任务
            List<ProjectTask> tasks = projectTaskService.getTasksByProjectId(plan.getProjectId());

            // 3. 计算任务总数
            dto.setTotalTasks(tasks.size());

            // 4. 计算整体进度
            if (tasks.isEmpty()) {
                dto.setOverallProgress(0);
            } else {
                // 获取项目阶段配置
                List<StageConfig> stageConfigs = null;
                if (plan.getStagesJson() != null && !plan.getStagesJson().isEmpty()) {
                    try {
                        stageConfigs = parseStageConfigs(plan.getStagesJson());
                    } catch (Exception e) {
                        log.error("解析阶段配置失败: projectId={}", plan.getProjectId(), e);
                    }
                }

                // 计算整体进度
                dto.setOverallProgress(calculateOverallProgressForProject(
                        plan.getProjectId(), tasks, stageConfigs));
            }

            return dto;
        }).collect(Collectors.toList());
    }

    /**
     * 计算项目整体进度
     */
    private Integer calculateOverallProgressForProject(
            Long projectId,
            List<ProjectTask> tasks,
            List<StageConfig> stageConfigs) {

        if (tasks.isEmpty()) {
            return 0;
        }

        // 获取所有阶段定义
        List<Stage> allStages = stageService.getAllStages();

        // 确定使用的阶段
        List<Stage> selectedStages;
        if (stageConfigs != null && !stageConfigs.isEmpty()) {
            List<String> stageKeys = stageConfigs.stream()
                    .map(StageConfig::getStageKey)
                    .collect(Collectors.toList());
            selectedStages = allStages.stream()
                    .filter(s -> stageKeys.contains(s.getKey()))
                    .collect(Collectors.toList());
        } else {
            selectedStages = allStages;
        }

        if (selectedStages.isEmpty()) {
            // 没有阶段配置，简单计算任务平均进度
            return tasks.stream()
                    .mapToInt(t -> t.getProgress() != null ? t.getProgress() : 0)
                    .sum() / tasks.size();
        }

        // 按阶段计算进度
        int totalWeight = selectedStages.stream()
                .mapToInt(s -> s.getDefaultWeight() != null ? s.getDefaultWeight() : 0)
                .sum();

        if (totalWeight == 0) {
            // 没有权重，简单平均
            return tasks.stream()
                    .mapToInt(t -> t.getProgress() != null ? t.getProgress() : 0)
                    .sum() / tasks.size();
        }

        // 按权重加权平均
        double weightedProgress = 0;
        for (Stage stage : selectedStages) {
            List<ProjectTask> stageTasks = tasks.stream()
                    .filter(t -> stage.getKey().equals(t.getStageKey()))
                    .collect(Collectors.toList());

            int stageProgress = calculateStageProgress(stageTasks);
            int weight = stage.getDefaultWeight() != null ? stage.getDefaultWeight() : 0;
            weightedProgress += (stageProgress * weight) / (double) totalWeight;
        }

        return (int) Math.round(weightedProgress);
    }
}
