package com.dataacquisition.modules.process.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dataacquisition.common.response.Result;
import com.dataacquisition.modules.process.entity.Process;
import com.dataacquisition.modules.process.service.ProcessService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 工序Controller
 */
@Tag(name = "工序管理", description = "工序相关接口")
@RestController
@RequestMapping("/processes")
@RequiredArgsConstructor
public class ProcessController {

    private final ProcessService processService;

    /**
     * 分页查询工序列表
     */
    @Operation(summary = "分页查询工序列表")
    @GetMapping
    public Result<IPage<Process>> pageProcesses(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) String keyword
    ) {
        Page<Process> pageParam = new Page<>(page, pageSize);
        IPage<Process> pageResult = processService.page(pageParam);
        return Result.success(pageResult);
    }

    /**
     * 根据ID获取工序详情
     */
    @Operation(summary = "根据ID获取工序详情")
    @GetMapping("/{id}")
    public Result<Process> getProcess(@PathVariable Long id) {
        Process process = processService.getById(id);
        if (process == null) {
            return Result.error(4004, "工序不存在");
        }
        return Result.success(process);
    }

    /**
     * 根据项目ID获取工序列表
     */
    @Operation(summary = "根据项目ID获取工序列表")
    @GetMapping("/project/{projectId}")
    public Result<List<Process>> getProcessesByProject(@PathVariable Long projectId) {
        List<Process> processes = processService.getByProjectId(projectId);
        return Result.success(processes);
    }

    /**
     * 新增工序
     */
    @Operation(summary = "新增工序")
    @PostMapping
    public Result<Process> createProcess(@RequestBody Process process) {
        Boolean success = processService.createProcess(process);
        return success ? Result.success(process) : Result.error(2001, "创建失败");
    }

    /**
     * 更新工序
     */
    @Operation(summary = "更新工序")
    @PutMapping("/{id}")
    public Result<Void> updateProcess(@PathVariable Long id, @RequestBody Process process) {
        process.setId(id);
        Boolean success = processService.updateProcess(process);
        return success ? Result.success() : Result.error(2002, "更新失败");
    }

    /**
     * 批量更新工序排序
     */
    @Operation(summary = "批量更新工序排序")
    @PutMapping("/reorder")
    public Result<Void> updateSortOrder(@RequestBody Map<String, List<Process>> request) {
        List<Process> processes = request.get("processes");
        Boolean success = processService.updateSortOrder(processes);
        return success ? Result.success() : Result.error(2003, "排序失败");
    }

    /**
     * 删除工序
     */
    @Operation(summary = "删除工序")
    @DeleteMapping("/{id}")
    public Result<Void> deleteProcess(@PathVariable Long id) {
        Boolean success = processService.deleteProcess(id);
        return success ? Result.success() : Result.error(2004, "删除失败");
    }
}
