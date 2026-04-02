package com.dataacquisition.modules.device.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dataacquisition.modules.device.dto.DeviceTaskQueryDTO;
import com.dataacquisition.modules.device.dto.DeviceTaskUpdateDTO;
import com.dataacquisition.modules.device.entity.DeviceTask;
import com.dataacquisition.modules.device.mapper.DeviceTaskMapper;
import com.dataacquisition.modules.device.service.DeviceTaskService;
import com.dataacquisition.modules.system.entity.Stage;
import com.dataacquisition.modules.system.entity.StageTaskTemplate;
import com.dataacquisition.modules.system.service.StageService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 设备任务Service实现
 */
@Service
@RequiredArgsConstructor
public class DeviceTaskServiceImpl extends ServiceImpl<DeviceTaskMapper, DeviceTask> implements DeviceTaskService {

    private final StageService stageService;
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Page<DeviceTask> pageDeviceTasks(Page<DeviceTask> page, DeviceTaskQueryDTO queryDTO) {
        // 使用自定义JOIN查询获取设备名和项目名
        return baseMapper.selectPageWithNames(page, queryDTO);
    }

    @Override
    public List<DeviceTask> getTasksByDeviceId(Long deviceId) {
        return baseMapper.selectByDeviceId(deviceId);
    }

    @Override
    public List<DeviceTask> getTasksByProjectId(Long projectId) {
        return baseMapper.selectByProjectId(projectId);
    }

    @Override
    public List<DeviceTask> getTasksByProjectIdAndStageKey(Long projectId, String stageKey) {
        return baseMapper.selectByProjectIdAndStageKey(projectId, stageKey);
    }

    @Override
    public DeviceTask getTaskDetail(Long id) {
        return this.getById(id);
    }

    @Override
    public boolean createDeviceTask(DeviceTask deviceTask) {
        // 检查任务是否已存在
        LambdaQueryWrapper<DeviceTask> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DeviceTask::getDeviceId, deviceTask.getDeviceId())
                .eq(DeviceTask::getStageKey, deviceTask.getStageKey())
                .eq(DeviceTask::getTaskKey, deviceTask.getTaskKey());
        if (this.count(wrapper) > 0) {
            throw new RuntimeException("该设备任务已存在");
        }
        return this.save(deviceTask);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateDeviceTaskProgress(Long id, DeviceTaskUpdateDTO updateDTO) {
        DeviceTask deviceTask = this.getById(id);
        if (deviceTask == null) {
            throw new RuntimeException("任务不存在");
        }

        Boolean oldCompleted = deviceTask.getCompleted();

        // 更新完成状态
        if (updateDTO.getCompleted() != null) {
            deviceTask.setCompleted(updateDTO.getCompleted());

            // 标记为完成时自动设置实际完成日期
            if (updateDTO.getCompleted() && !Boolean.TRUE.equals(oldCompleted)) {
                if (deviceTask.getActualEndDate() == null) {
                    deviceTask.setActualEndDate(LocalDate.now());
                }
            }

            // 取消完成时清空实际完成日期
            if (!updateDTO.getCompleted()) {
                deviceTask.setActualEndDate(null);
            }
        }

        // 开始执行时自动记录实际开始日期（首次标记为完成时视为开始执行）
        if (updateDTO.getCompleted() != null && updateDTO.getCompleted()
            && !Boolean.TRUE.equals(oldCompleted)
            && deviceTask.getActualStartDate() == null) {
            deviceTask.setActualStartDate(LocalDate.now());
        }

        // 手动设置计划开始日期
        if (updateDTO.getStartDate() != null) {
            deviceTask.setStartDate(updateDTO.getStartDate().atStartOfDay());
        }

        // 手动设置实际开始日期
        if (updateDTO.getActualStartDate() != null) {
            deviceTask.setActualStartDate(updateDTO.getActualStartDate());
        }

        // 手动设置实际完成日期
        if (updateDTO.getActualEndDate() != null) {
            deviceTask.setActualEndDate(updateDTO.getActualEndDate());
        }

        // 更新备注
        if (updateDTO.getRemark() != null) {
            deviceTask.setRemark(updateDTO.getRemark());
        }

        // 更新任务资料
        if (updateDTO.getMaterials() != null) {
            try {
                deviceTask.setMaterials(objectMapper.writeValueAsString(updateDTO.getMaterials()));
            } catch (Exception e) {
                throw new RuntimeException("资料数据转换失败", e);
            }
        }

        return this.updateById(deviceTask);
    }

    @Override
    public boolean deleteDeviceTask(Long id) {
        return this.removeById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean batchDeleteDeviceTasks(List<Long> ids) {
        return this.removeByIds(ids);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean initializeDeviceTasks(Long deviceId, Long projectId) {
        // 获取所有阶段配置
        List<Stage> stages = stageService.getAllStages();

        for (Stage stage : stages) {
            // 只处理按设备推进的阶段
            if ("by_device".equals(stage.getProgressMode()) && stage.getTaskTemplates() != null) {
                for (StageTaskTemplate template : stage.getTaskTemplates()) {
                    // 检查任务是否已存在
                    LambdaQueryWrapper<DeviceTask> wrapper = new LambdaQueryWrapper<>();
                    wrapper.eq(DeviceTask::getDeviceId, deviceId)
                            .eq(DeviceTask::getStageKey, stage.getKey())
                            .eq(DeviceTask::getTaskKey, template.getKey());
                    if (this.count(wrapper) == 0) {
                        // 创建新任务
                        DeviceTask deviceTask = new DeviceTask();
                        deviceTask.setDeviceId(deviceId);
                        deviceTask.setProjectId(projectId);
                        deviceTask.setStageKey(stage.getKey());
                        deviceTask.setTaskKey(template.getKey());
                        deviceTask.setTaskName(template.getName());
                        deviceTask.setCompleted(false);
                        this.save(deviceTask);
                    }
                }
            }
        }
        return true;
    }
}
