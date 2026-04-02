package com.dataacquisition.modules.device.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dataacquisition.common.response.Result;
import com.dataacquisition.modules.device.dto.DeviceTaskQueryDTO;
import com.dataacquisition.modules.device.dto.DeviceTaskUpdateDTO;
import com.dataacquisition.modules.device.entity.DeviceTask;
import com.dataacquisition.modules.device.service.DeviceTaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 设备任务Controller
 */
@Tag(name = "设备任务管理", description = "设备任务相关接口")
@RestController
@RequestMapping("/device-tasks")
@RequiredArgsConstructor
public class DeviceTaskController {

    private final DeviceTaskService deviceTaskService;

    /**
     * 分页查询设备任务列表
     */
    @Operation(summary = "分页查询设备任务列表")
    @GetMapping("/page")
    public Result<Page<DeviceTask>> pageDeviceTasks(
            @Parameter(description = "关键字搜索") @RequestParam(required = false) String keyword,
            @Parameter(description = "项目ID") @RequestParam(required = false) Long projectId,
            @Parameter(description = "阶段标识") @RequestParam(required = false) String stageKey,
            @Parameter(description = "是否完成") @RequestParam(required = false) Boolean completed,
            @Parameter(description = "设备ID") @RequestParam(required = false) Long deviceId,
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer pageNum,
            @Parameter(description = "每页条数") @RequestParam(defaultValue = "10") Integer pageSize) {

        DeviceTaskQueryDTO queryDTO = new DeviceTaskQueryDTO();
        queryDTO.setKeyword(keyword);
        queryDTO.setProjectId(projectId);
        queryDTO.setStageKey(stageKey);
        queryDTO.setCompleted(completed);
        queryDTO.setDeviceId(deviceId);
        queryDTO.setPageNum(pageNum);
        queryDTO.setPageSize(pageSize);

        Page<DeviceTask> page = new Page<>(pageNum, pageSize);
        Page<DeviceTask> result = deviceTaskService.pageDeviceTasks(page, queryDTO);
        return Result.success(result);
    }

    /**
     * 根据设备ID获取任务列表
     */
    @Operation(summary = "根据设备ID获取任务列表")
    @GetMapping("/device/{deviceId}")
    public Result<List<DeviceTask>> getTasksByDeviceId(
            @Parameter(description = "设备ID") @PathVariable Long deviceId) {
        List<DeviceTask> tasks = deviceTaskService.getTasksByDeviceId(deviceId);
        return Result.success(tasks);
    }

    /**
     * 根据项目ID获取任务列表
     */
    @Operation(summary = "根据项目ID获取任务列表")
    @GetMapping("/project/{projectId}")
    public Result<List<DeviceTask>> getTasksByProjectId(
            @Parameter(description = "项目ID") @PathVariable Long projectId) {
        List<DeviceTask> tasks = deviceTaskService.getTasksByProjectId(projectId);
        return Result.success(tasks);
    }

    /**
     * 根据项目ID和阶段标识获取任务列表
     */
    @Operation(summary = "根据项目ID和阶段标识获取任务列表")
    @GetMapping("/project/{projectId}/stage/{stageKey}")
    public Result<List<DeviceTask>> getTasksByProjectIdAndStageKey(
            @Parameter(description = "项目ID") @PathVariable Long projectId,
            @Parameter(description = "阶段标识") @PathVariable String stageKey) {
        List<DeviceTask> tasks = deviceTaskService.getTasksByProjectIdAndStageKey(projectId, stageKey);
        return Result.success(tasks);
    }

    /**
     * 根据ID获取任务详情
     */
    @Operation(summary = "根据ID获取设备任务详情")
    @GetMapping("/{id}")
    public Result<DeviceTask> getTask(@PathVariable Long id) {
        DeviceTask task = deviceTaskService.getTaskDetail(id);
        if (task == null) {
            return Result.error("任务不存在");
        }
        return Result.success(task);
    }

    /**
     * 创建设备任务
     */
    @Operation(summary = "创建设备任务")
    @PostMapping
    public Result<Void> createDeviceTask(@Validated @RequestBody DeviceTask deviceTask) {
        boolean success = deviceTaskService.createDeviceTask(deviceTask);
        if (!success) {
            return Result.error("创建失败");
        }
        return Result.success();
    }

    /**
     * 更新设备任务进度
     */
    @Operation(summary = "更新设备任务进度")
    @PutMapping("/{id}/progress")
    public Result<Void> updateDeviceTaskProgress(
            @PathVariable Long id,
            @Validated @RequestBody DeviceTaskUpdateDTO updateDTO) {
        boolean success = deviceTaskService.updateDeviceTaskProgress(id, updateDTO);
        if (!success) {
            return Result.error("更新失败");
        }
        return Result.success();
    }

    /**
     * 删除设备任务
     */
    @Operation(summary = "删除设备任务")
    @DeleteMapping("/{id}")
    public Result<Void> deleteDeviceTask(@PathVariable Long id) {
        boolean success = deviceTaskService.deleteDeviceTask(id);
        if (!success) {
            return Result.error("删除失败");
        }
        return Result.success();
    }

    /**
     * 批量删除设备任务
     */
    @Operation(summary = "批量删除设备任务")
    @DeleteMapping("/batch")
    public Result<Void> batchDeleteDeviceTasks(@RequestBody List<Long> ids) {
        boolean success = deviceTaskService.batchDeleteDeviceTasks(ids);
        if (!success) {
            return Result.error("批量删除失败");
        }
        return Result.success();
    }

    /**
     * 初始化设备的任务列表
     */
    @Operation(summary = "初始化设备的任务列表")
    @PostMapping("/initialize")
    public Result<Void> initializeDeviceTasks(
            @Parameter(description = "设备ID") @RequestParam Long deviceId,
            @Parameter(description = "项目ID") @RequestParam Long projectId) {
        boolean success = deviceTaskService.initializeDeviceTasks(deviceId, projectId);
        if (!success) {
            return Result.error("初始化失败");
        }
        return Result.success();
    }
}
