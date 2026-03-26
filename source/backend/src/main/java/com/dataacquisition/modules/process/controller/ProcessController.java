package com.dataacquisition.modules.process.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dataacquisition.common.response.Result;
import com.dataacquisition.modules.process.entity.Process;
import com.dataacquisition.modules.process.mapper.ProcessMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * 工序Controller
 */
@Tag(name = "工序管理", description = "工序相关接口")
@RestController
@RequestMapping("/processes")
@RequiredArgsConstructor
public class ProcessController {

    private final ProcessMapper processMapper;

    /**
     * 分页查询工序列表
     */
    @Operation(summary = "分页查询工序列表")
    @GetMapping
    public Result<Page<Process>> pageProcesses(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer pageNum,
            @Parameter(description = "每页条数") @RequestParam(defaultValue = "10") Integer pageSize,
            @Parameter(description = "关键词") @RequestParam(required = false) String keyword,
            @Parameter(description = "项目ID") @RequestParam(required = false) Long projectId) {
        Page<Process> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Process> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(Process::getName, keyword)
                    .or()
                    .like(Process::getCode, keyword));
        }

        if (projectId != null) {
            wrapper.eq(Process::getProjectId, projectId);
        }

        wrapper.orderByAsc(Process::getSortOrder)
                .orderByDesc(Process::getCreatedAt);

        processMapper.selectPage(page, wrapper);
        return Result.success(page);
    }

    /**
     * 根据ID获取工序详情
     */
    @Operation(summary = "根据ID获取工序详情")
    @GetMapping("/{id}")
    public Result<Process> getProcess(@PathVariable Long id) {
        Process process = processMapper.selectById(id);
        if (process == null) {
            return Result.error("工序不存在");
        }
        return Result.success(process);
    }

    /**
     * 新增工序
     */
    @Operation(summary = "新增工序")
    @PostMapping
    public Result<Void> createProcess(@Validated @RequestBody Process process) {
        processMapper.insert(process);
        return Result.success();
    }

    /**
     * 更新工序
     */
    @Operation(summary = "更新工序")
    @PutMapping("/{id}")
    public Result<Void> updateProcess(@PathVariable Long id, @Validated @RequestBody Process process) {
        process.setId(id);
        processMapper.updateById(process);
        return Result.success();
    }

    /**
     * 删除工序
     */
    @Operation(summary = "删除工序")
    @DeleteMapping("/{id}")
    public Result<Void> deleteProcess(@PathVariable Long id) {
        processMapper.deleteById(id);
        return Result.success();
    }
}
