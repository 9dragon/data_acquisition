package com.dataacquisition.modules.system.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.dataacquisition.modules.system.entity.Stage;
import com.dataacquisition.modules.system.entity.StageTaskTemplate;

import java.util.List;

/**
 * 阶段Service接口
 */
public interface StageService extends IService<Stage> {

    /**
     * 获取所有阶段
     */
    List<Stage> getAllStages();

    /**
     * 根据key获取阶段
     */
    Stage getByKey(String key);

    /**
     * 创建阶段
     */
    Boolean createStage(Stage stage);

    /**
     * 更新阶段
     */
    Boolean updateStage(Stage stage);

    /**
     * 删除阶段
     */
    Boolean deleteStage(Long id);

    /**
     * 添加任务模板
     */
    Boolean addTaskTemplate(Long stageId, StageTaskTemplate taskTemplate);

    /**
     * 更新任务模板
     */
    Boolean updateTaskTemplate(Long stageId, String taskId, StageTaskTemplate taskTemplate);

    /**
     * 删除任务模板
     */
    Boolean deleteTaskTemplate(Long stageId, String taskId);
}
