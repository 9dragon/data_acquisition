package com.dataacquisition.modules.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dataacquisition.modules.device.service.DeviceTaskService;
import com.dataacquisition.modules.project.dto.ProjectTaskUpdateDTO;
import com.dataacquisition.modules.project.entity.ProjectTask;
import com.dataacquisition.modules.project.mapper.ProjectTaskMapper;
import com.dataacquisition.modules.project.service.ProjectTaskService;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * 项目任务Service实现
 */
@Service
@RequiredArgsConstructor
public class ProjectTaskServiceImpl extends ServiceImpl<ProjectTaskMapper, ProjectTask> implements ProjectTaskService {

    private final ObjectProvider<DeviceTaskService> deviceTaskServiceProvider;

    @Override
    public Page<ProjectTask> pageTasks(Page<ProjectTask> page, Long projectId, String stageKey, String status) {
        LambdaQueryWrapper<ProjectTask> wrapper = new LambdaQueryWrapper<>();

        // 项目ID
        if (projectId != null) {
            wrapper.eq(ProjectTask::getProjectId, projectId);
        }

        // 阶段筛选
        if (StringUtils.isNotBlank(stageKey)) {
            wrapper.eq(ProjectTask::getStageKey, stageKey);
        }

        // 状态筛选
        if (StringUtils.isNotBlank(status)) {
            wrapper.eq(ProjectTask::getStatus, status);
        }

        // 排序：按开始日期升序
        wrapper.orderByAsc(ProjectTask::getStartDate);

        return this.page(page, wrapper);
    }

    @Override
    public List<ProjectTask> getTasksByProjectId(Long projectId) {
        return baseMapper.selectByProjectId(projectId);
    }

    @Override
    public List<ProjectTask> getTasksByProjectIdAndStageKey(Long projectId, String stageKey) {
        return baseMapper.selectByProjectIdAndStageKey(projectId, stageKey);
    }

    @Override
    public ProjectTask getTaskDetail(Long id) {
        return this.getById(id);
    }

    @Override
    public boolean createTask(ProjectTask task) {
        // 检查任务标识唯一性
        LambdaQueryWrapper<ProjectTask> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProjectTask::getProjectId, task.getProjectId())
                .eq(ProjectTask::getTaskKey, task.getTaskKey());
        if (this.count(wrapper) > 0) {
            throw new RuntimeException("任务标识已存在");
        }
        return this.save(task);
    }

    @Override
    public boolean updateTask(ProjectTask task) {
        return this.updateById(task);
    }

    @Override
    public boolean deleteTask(Long id) {
        return this.removeById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean batchDeleteTasks(List<Long> ids) {
        return this.removeByIds(ids);
    }

    @Override
    public Page<ProjectTask> pageAllProjectTasks(Page<ProjectTask> page, String keyword, String status, Long projectId) {
        // 使用自定义JOIN查询获取项目名称
        return baseMapper.selectPageWithProjectName  (page, projectId, status, keyword);
    }

    @Override
    public Page<ProjectTask> pageMyTasks(Page<ProjectTask> page, Long managerId, String status) {
        // 使用自定义JOIN查询获取项目名称，并按负责人ID和状态筛选
        return baseMapper.selectMyTasksPage(page, managerId, status);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateTaskProgress(Long id, ProjectTaskUpdateDTO updateDTO) {
        ProjectTask task = this.getById(id);
        if (task == null) {
            throw new RuntimeException("任务不存在");
        }

        // 检查是否有关联的设备任务，如果有则不允许手动更新
        long deviceTaskCount = deviceTaskServiceProvider.getObject().countByProjectTaskId(id);
        if (deviceTaskCount > 0) {
            throw new RuntimeException("该任务有关联的设备任务，进度将自动根据设备任务计算，不能手动更新");
        }

        // 记录旧状态
        String oldStatus = task.getStatus();

        // 更新状态和进度
        if (updateDTO.getStatus() != null) {
            task.setStatus(updateDTO.getStatus());
        }
        if (updateDTO.getProgress() != null) {
            task.setProgress(updateDTO.getProgress());
        }

        // 状态变为进行中时，自动记录实际开始时间
        if ("in_progress".equals(updateDTO.getStatus())
            && !"in_progress".equals(oldStatus)
            && !"completed".equals(oldStatus)
            && task.getActualStartDate() == null) {
            task.setActualStartDate(LocalDate.now());
        }

        // 状态变为完成时，自动记录实际完成时间
        if ("completed".equals(updateDTO.getStatus())
            && !"completed".equals(oldStatus)
            && task.getActualEndDate() == null) {
            task.setActualEndDate(LocalDate.now());
        }

        // 手动设置实际开始时间
        if (updateDTO.getActualStartDate() != null) {
            task.setActualStartDate(updateDTO.getActualStartDate());
        }

        // 手动设置实际完成时间
        if (updateDTO.getActualEndDate() != null) {
            task.setActualEndDate(updateDTO.getActualEndDate());
        }

        // 取消完成状态时，清空实际完成时间
        if (!"completed".equals(task.getStatus()) && task.getActualEndDate() != null) {
            task.setActualEndDate(null);
        }

        // 更新备注
        if (updateDTO.getRemark() != null) {
            task.setDescription(updateDTO.getRemark());
        }

        return this.updateById(task);
    }
}
