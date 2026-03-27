package com.dataacquisition.modules.system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dataacquisition.common.exception.BusinessException;
import com.dataacquisition.modules.system.entity.Stage;
import com.dataacquisition.modules.system.entity.StageTaskTemplate;
import com.dataacquisition.modules.system.mapper.StageMapper;
import com.dataacquisition.modules.system.service.StageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * 阶段Service实现
 */
@Slf4j
@Service
public class StageServiceImpl extends ServiceImpl<StageMapper, Stage> implements StageService {

    @Override
    public List<Stage> getAllStages() {
        LambdaQueryWrapper<Stage> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(Stage::getSortOrder);
        return this.list(wrapper);
    }

    @Override
    public Stage getByKey(String key) {
        LambdaQueryWrapper<Stage> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Stage::getKey, key);
        return this.getOne(wrapper);
    }

    @Override
    public Boolean createStage(Stage stage) {
        // 检查key是否已存在
        if (getByKey(stage.getKey()) != null) {
            throw new BusinessException("阶段标识已存在");
        }
        return this.save(stage);
    }

    @Override
    public Boolean updateStage(Stage stage) {
        Stage existingStage = this.getById(stage.getId());
        if (existingStage == null) {
            throw new BusinessException("阶段不存在");
        }

        // 系统预置阶段不能修改key和progressMode
        if (existingStage.getIsSystem() == 1) {
            stage.setKey(existingStage.getKey());
            stage.setProgressMode(existingStage.getProgressMode());
        }

        return this.updateById(stage);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean deleteStage(Long id) {
        Stage stage = this.getById(id);
        if (stage == null) {
            throw new BusinessException("阶段不存在");
        }

        // 系统预置阶段不能删除
        if (stage.getIsSystem() == 1) {
            throw new BusinessException("系统预置阶段不能删除");
        }

        // TODO: 检查阶段是否被项目使用
        // if (projectService.countByStageId(id) > 0) {
        //     throw new BusinessException("阶段已被项目使用，不能删除");
        // }

        return this.removeById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean addTaskTemplate(Long stageId, StageTaskTemplate taskTemplate) {
        Stage stage = this.getById(stageId);
        if (stage == null) {
            throw new BusinessException("阶段不存在");
        }

        // 生成任务ID
        if (taskTemplate.getId() == null || taskTemplate.getId().isEmpty()) {
            taskTemplate.setId(UUID.randomUUID().toString());
        }

        // 添加任务到列表
        List<StageTaskTemplate> templates = stage.getTaskTemplates();
        if (templates == null) {
            templates = new java.util.ArrayList<>();
        }
        templates.add(taskTemplate);

        stage.setTaskTemplates(templates);
        return this.updateById(stage);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean updateTaskTemplate(Long stageId, String taskId, StageTaskTemplate taskTemplate) {
        Stage stage = this.getById(stageId);
        if (stage == null) {
            throw new BusinessException("阶段不存在");
        }

        List<StageTaskTemplate> templates = stage.getTaskTemplates();
        if (templates == null || templates.isEmpty()) {
            throw new BusinessException("任务模板不存在");
        }

        // 查找并更新任务
        for (int i = 0; i < templates.size(); i++) {
            if (templates.get(i).getId().equals(taskId)) {
                templates.set(i, taskTemplate);
                break;
            }
        }

        stage.setTaskTemplates(templates);
        return this.updateById(stage);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean deleteTaskTemplate(Long stageId, String taskId) {
        Stage stage = this.getById(stageId);
        if (stage == null) {
            throw new BusinessException("阶段不存在");
        }

        List<StageTaskTemplate> templates = stage.getTaskTemplates();
        if (templates == null || templates.isEmpty()) {
            return true;
        }

        // 移除任务
        templates.removeIf(t -> t.getId().equals(taskId));

        stage.setTaskTemplates(templates);
        return this.updateById(stage);
    }
}
