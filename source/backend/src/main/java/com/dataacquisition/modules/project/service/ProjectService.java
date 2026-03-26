package com.dataacquisition.modules.project.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.dataacquisition.modules.project.entity.Project;

/**
 * 项目Service接口
 */
public interface ProjectService extends IService<Project> {

    /**
     * 分页查询项目列表
     */
    Page<Project> pageProjects(Page<Project> page, String keyword, Integer status, String stage);

    /**
     * 根据ID获取项目详情
     */
    Project getProjectDetail(Long id);
}
