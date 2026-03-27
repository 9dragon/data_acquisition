package com.dataacquisition.modules.system.controller;

import com.dataacquisition.common.response.Result;
import com.dataacquisition.modules.system.entity.Stage;
import com.dataacquisition.modules.system.entity.StageTaskTemplate;
import com.dataacquisition.modules.system.service.StageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 阶段Controller
 */
@Tag(name = "阶段管理", description = "项目阶段配置接口")
@RestController
@RequestMapping("/stages")
@RequiredArgsConstructor
public class StageController {

    private final StageService stageService;

    /**
     * 获取所有阶段
     */
    @Operation(summary = "获取所有阶段")
    @GetMapping
    public Result<List<Stage>> getAllStages(
            @RequestParam(required = false) Integer isSystem,
            @RequestParam(required = false) String progressMode
    ) {
        List<Stage> stages = stageService.getAllStages();
        return Result.success(stages);
    }

    /**
     * 根据ID获取阶段
     */
    @Operation(summary = "获取阶段详情")
    @GetMapping("/{id}")
    public Result<Stage> getStageById(@PathVariable Long id) {
        Stage stage = stageService.getById(id);
        if (stage == null) {
            return Result.error(4004, "阶段不存在");
        }
        return Result.success(stage);
    }

    /**
     * 创建阶段
     */
    @Operation(summary = "创建阶段")
    @PostMapping
    public Result<Stage> createStage(@RequestBody Stage stage) {
        Boolean success = stageService.createStage(stage);
        return success ? Result.success(stage) : Result.error(2001, "创建失败");
    }

    /**
     * 更新阶段
     */
    @Operation(summary = "更新阶段")
    @PutMapping("/{id}")
    public Result<Void> updateStage(@PathVariable Long id, @RequestBody Stage stage) {
        stage.setId(id);
        Boolean success = stageService.updateStage(stage);
        return success ? Result.success() : Result.error(2002, "更新失败");
    }

    /**
     * 删除阶段
     */
    @Operation(summary = "删除阶段")
    @DeleteMapping("/{id}")
    public Result<Void> deleteStage(@PathVariable Long id) {
        Boolean success = stageService.deleteStage(id);
        return success ? Result.success() : Result.error(2003, "删除失败");
    }

    /**
     * 添加任务模板
     */
    @Operation(summary = "添加任务模板")
    @PostMapping("/{id}/tasks")
    public Result<StageTaskTemplate> addTaskTemplate(
            @PathVariable Long id,
            @RequestBody StageTaskTemplate taskTemplate
    ) {
        Boolean success = stageService.addTaskTemplate(id, taskTemplate);
        return success ? Result.success(taskTemplate) : Result.error(2004, "添加失败");
    }

    /**
     * 更新任务模板
     */
    @Operation(summary = "更新任务模板")
    @PutMapping("/{stageId}/tasks/{taskId}")
    public Result<Void> updateTaskTemplate(
            @PathVariable Long stageId,
            @PathVariable String taskId,
            @RequestBody StageTaskTemplate taskTemplate
    ) {
        taskTemplate.setId(taskId);
        Boolean success = stageService.updateTaskTemplate(stageId, taskId, taskTemplate);
        return success ? Result.success() : Result.error(2005, "更新失败");
    }

    /**
     * 删除任务模板
     */
    @Operation(summary = "删除任务模板")
    @DeleteMapping("/{stageId}/tasks/{taskId}")
    public Result<Void> deleteTaskTemplate(
            @PathVariable Long stageId,
            @PathVariable String taskId
    ) {
        Boolean success = stageService.deleteTaskTemplate(stageId, taskId);
        return success ? Result.success() : Result.error(2006, "删除失败");
    }
}
