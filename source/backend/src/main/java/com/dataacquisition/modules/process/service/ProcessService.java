package com.dataacquisition.modules.process.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.dataacquisition.modules.process.entity.Process;

import java.util.List;

/**
 * 工序Service接口
 */
public interface ProcessService extends IService<Process> {

    /**
     * 根据项目ID获取工序列表
     */
    List<Process> getByProjectId(Long projectId);

    /**
     * 批量更新工序排序
     */
    Boolean updateSortOrder(List<Process> processes);

    /**
     * 创建工序
     */
    Boolean createProcess(Process process);

    /**
     * 更新工序
     */
    Boolean updateProcess(Process process);

    /**
     * 删除工序
     */
    Boolean deleteProcess(Long id);
}
