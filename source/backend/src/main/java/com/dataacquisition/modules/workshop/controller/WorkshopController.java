package com.dataacquisition.modules.workshop.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dataacquisition.common.dto.OptionDto;
import com.dataacquisition.common.response.Result;
import com.dataacquisition.modules.workshop.entity.Workshop;
import com.dataacquisition.modules.workshop.mapper.WorkshopMapper;
import com.dataacquisition.modules.workshop.service.WorkshopService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 车间Controller
 */
@Tag(name = "车间管理", description = "车间相关接口")
@RestController
@RequestMapping("/workshops")
@RequiredArgsConstructor
public class WorkshopController {

    private final WorkshopService workshopService;

    /**
     * 分页查询车间列表
     */
    @Operation(summary = "分页查询车间列表")
    @GetMapping
    public Result<Page<Workshop>> pageWorkshops(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer pageNum,
            @Parameter(description = "每页条数") @RequestParam(defaultValue = "10") Integer pageSize,
            @Parameter(description = "关键词") @RequestParam(required = false) String keyword,
            @Parameter(description = "项目ID") @RequestParam(required = false) Long projectId) {
        Page<Workshop> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Workshop> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(Workshop::getName, keyword)
                    .or()
                    .like(Workshop::getCode, keyword));
        }

        if (projectId != null) {
            wrapper.eq(Workshop::getProjectId, projectId);
        }

        wrapper.orderByDesc(Workshop::getCreatedAt);

        workshopService.page(page, wrapper);
        return Result.success(page);
    }

    /**
     * 获取车间选项列表（用于下拉选择器）
     */
    @Operation(summary = "获取车间选项列表")
    @GetMapping("/options")
    public Result<List<OptionDto>> getWorkshopOptions(
            @Parameter(description = "项目ID") @RequestParam(required = false) Long projectId,
            @Parameter(description = "关键词") @RequestParam(required = false) String keyword) {
        List<OptionDto> options = workshopService.getWorkshopOptions(projectId, keyword);
        return Result.success(options);
    }

    /**
     * 根据ID获取车间详情
     */
    @Operation(summary = "根据ID获取车间详情")
    @GetMapping("/{id}")
    public Result<Workshop> getWorkshop(@PathVariable Long id) {
        Workshop workshop = workshopService.getById(id);
        if (workshop == null) {
            return Result.error("车间不存在");
        }
        return Result.success(workshop);
    }

    /**
     * 新增车间
     */
    @Operation(summary = "新增车间")
    @PostMapping
    public Result<Void> createWorkshop(@Validated @RequestBody Workshop workshop) {
        workshopService.save(workshop);
        return Result.success();
    }

    /**
     * 更新车间
     */
    @Operation(summary = "更新车间")
    @PutMapping("/{id}")
    public Result<Void> updateWorkshop(@PathVariable Long id, @Validated @RequestBody Workshop workshop) {
        workshop.setId(id);
        workshopService.updateById(workshop);
        return Result.success();
    }

    /**
     * 删除车间
     */
    @Operation(summary = "删除车间")
    @DeleteMapping("/{id}")
    public Result<Void> deleteWorkshop(@PathVariable Long id) {
        workshopService.removeById(id);
        return Result.success();
    }
}
