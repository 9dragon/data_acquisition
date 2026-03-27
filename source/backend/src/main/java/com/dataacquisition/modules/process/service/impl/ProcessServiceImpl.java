package com.dataacquisition.modules.process.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dataacquisition.common.exception.BusinessException;
import com.dataacquisition.modules.process.entity.Process;
import com.dataacquisition.modules.process.mapper.ProcessMapper;
import com.dataacquisition.modules.process.service.ProcessService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 工序Service实现
 */
@Service
public class ProcessServiceImpl extends ServiceImpl<ProcessMapper, Process> implements ProcessService {

    @Override
    public List<Process> getByProjectId(Long projectId) {
        LambdaQueryWrapper<Process> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Process::getProjectId, projectId)
                .orderByAsc(Process::getSortOrder)
                .orderByDesc(Process::getCreatedAt);
        return this.list(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean updateSortOrder(List<Process> processes) {
        for (Process process : processes) {
            Process updateEntity = new Process();
            updateEntity.setId(process.getId());
            updateEntity.setSortOrder(process.getSortOrder());
            this.updateById(updateEntity);
        }
        return true;
    }

    @Override
    public Boolean createProcess(Process process) {
        // 如果未设置排序序号，设置为最大值+1
        if (process.getSortOrder() == null || process.getSortOrder() == 0) {
            LambdaQueryWrapper<Process> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(Process::getProjectId, process.getProjectId())
                    .orderByDesc(Process::getSortOrder)
                    .last("LIMIT 1");
            Process lastProcess = this.getOne(wrapper);
            int maxSort = lastProcess != null ? lastProcess.getSortOrder() : 0;
            process.setSortOrder(maxSort + 1);
        }
        return this.save(process);
    }

    @Override
    public Boolean updateProcess(Process process) {
        if (process.getId() == null) {
            throw new BusinessException("工序ID不能为空");
        }
        return this.updateById(process);
    }

    @Override
    public Boolean deleteProcess(Long id) {
        // TODO: 检查工序下是否有设备类型
        // if (deviceTypeService.countByProcessId(id) > 0) {
        //     throw new BusinessException("工序下有设备类型，不能删除");
        // }
        return this.removeById(id);
    }
}
