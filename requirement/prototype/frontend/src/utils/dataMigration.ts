import { StageDefinition, StageDeviceProgress, ProjectStageConfig, StageTaskTemplate, DeviceTaskProgress, StageTaskProgress } from '../types/project';
import { Device } from '../types/device';

/**
 * 兼容处理：将旧数据结构迁移到新结构
 * @param oldDeviceProgress 旧格式的设备进度
 * @param taskTemplates 任务模板列表
 * @returns 新格式的设备进度
 */
export function migrateDeviceProgress(
  oldDeviceProgress: StageDeviceProgress,
  taskTemplates: StageTaskTemplate[]
): StageDeviceProgress {
  // 如果已经有 taskProgress，说明已经是新格式，直接返回
  if (oldDeviceProgress.taskProgress && oldDeviceProgress.taskProgress.length > 0) {
    return oldDeviceProgress;
  }

  // 如果没有任务模板，返回原数据（保持兼容）
  if (!taskTemplates || taskTemplates.length === 0) {
    return oldDeviceProgress;
  }

  // 为每个设备初始化任务级进度
  const newTaskProgress: DeviceTaskProgress[] = taskTemplates.map((template) => ({
    deviceId: oldDeviceProgress.deviceId,
    deviceName: oldDeviceProgress.deviceName,
    taskId: template.id,
    taskKey: template.key,
    taskName: template.name,
    completed: false,
    materials: template.materialRequirements.map((req) => ({
      requirementKey: req.key,
      requirementName: req.name,
      files: [],
      completed: false,
    })),
  }));

  return {
    ...oldDeviceProgress,
    taskProgress: newTaskProgress,
  };
}

/**
 * 批量迁移设备进度
 * @param deviceProgressList 设备进度列表
 * @param taskTemplates 任务模板列表
 * @returns 迁移后的设备进度列表
 */
export function migrateDeviceProgressList(
  deviceProgressList: StageDeviceProgress[],
  taskTemplates: StageTaskTemplate[]
): StageDeviceProgress[] {
  return deviceProgressList.map((deviceProgress) =>
    migrateDeviceProgress(deviceProgress, taskTemplates)
  );
}

/**
 * 兼容处理：迁移任务进度（添加资料收集字段）
 * @param oldTaskProgress 旧格式的任务进度
 * @param taskTemplates 任务模板列表
 * @returns 新格式的任务进度
 */
export function migrateTaskProgress(
  oldTaskProgress: StageTaskProgress,
  taskTemplates: StageTaskTemplate[]
): StageTaskProgress {
  // 如果已经有 materials，说明已经是新格式，直接返回
  if (oldTaskProgress.materials) {
    return oldTaskProgress;
  }

  // 查找对应的任务模板
  const template = taskTemplates.find((t) => t.id === oldTaskProgress.taskId || t.key === oldTaskProgress.taskKey);

  if (!template || template.materialRequirements.length === 0) {
    return oldTaskProgress;
  }

  // 初始化资料收集
  const materials = template.materialRequirements.map((req) => ({
    requirementKey: req.key,
    requirementName: req.name,
    files: [],
    completed: false,
  }));

  return {
    ...oldTaskProgress,
    materials,
  };
}

/**
 * 批量迁移任务进度
 * @param taskProgressList 任务进度列表
 * @param taskTemplates 任务模板列表
 * @returns 迁移后的任务进度列表
 */
export function migrateTaskProgressList(
  taskProgressList: StageTaskProgress[],
  taskTemplates: StageTaskTemplate[]
): StageTaskProgress[] {
  return taskProgressList.map((taskProgress) =>
    migrateTaskProgress(taskProgress, taskTemplates)
  );
}

/**
 * 初始化阶段进度时适配新旧数据
 * @param stageDefinition 阶段定义
 * @param projectDevices 项目设备列表
 * @returns 初始化的阶段配置
 */
export function initializeStageProgress(
  stageDefinition: StageDefinition,
  projectDevices: Device[]
): Partial<ProjectStageConfig> {
  const stageConfig: Partial<ProjectStageConfig> = {
    stageKey: stageDefinition.key,
    status: 'not_started' as const,
    actualProgress: 0,
    weight: stageDefinition.defaultWeight || 0,
  };

  // 根据推进方式初始化不同的进度数据
  if (stageDefinition.progressMode === 'by_task') {
    // 优先使用新格式的任务模板
    if (stageDefinition.taskTemplates && stageDefinition.taskTemplates.length > 0) {
      stageConfig.taskProgress = stageDefinition.taskTemplates.map((template) => ({
        taskId: template.id,
        taskKey: template.key,
        taskName: template.name,
        completed: false,
        materials: template.materialRequirements.map((req) => ({
          requirementKey: req.key,
          requirementName: req.name,
          files: [],
          completed: false,
        })),
      }));
    } else if (stageDefinition.defaultTasks && stageDefinition.defaultTasks.length > 0) {
      // 兼容旧格式
      stageConfig.taskProgress = stageDefinition.defaultTasks.map((taskName, index) => ({
        taskId: `task-${Date.now()}-${index}`,
        taskName,
        completed: false,
      }));
    }
  } else if (stageDefinition.progressMode === 'by_device') {
    // 按设备推进
    stageConfig.deviceProgress = projectDevices.map((device) => {
      const deviceProgress: StageDeviceProgress = {
        deviceId: device.id,
        deviceName: device.name,
        completed: false,
      };

      // 如果有任务模板，初始化任务级进度
      if (stageDefinition.taskTemplates && stageDefinition.taskTemplates.length > 0) {
        deviceProgress.taskProgress = stageDefinition.taskTemplates.map((template) => ({
          deviceId: device.id,
          deviceName: device.name,
          taskId: template.id,
          taskKey: template.key,
          taskName: template.name,
          completed: false,
          materials: template.materialRequirements.map((req) => ({
            requirementKey: req.key,
            requirementName: req.name,
            files: [],
            completed: false,
          })),
        }));
      }

      return deviceProgress;
    });
  }

  return stageConfig;
}

/**
 * 检查是否需要迁移到任务级填报
 * @param stageDefinition 阶段定义
 * @returns 是否需要任务级填报
 */
export function needsTaskLevelReporting(stageDefinition: StageDefinition): boolean {
  return (
    stageDefinition.progressMode === 'by_device' &&
    !!stageDefinition.taskTemplates &&
    stageDefinition.taskTemplates.length > 0
  );
}

/**
 * 获取阶段的所有任务模板（兼容旧格式）
 * @param stageDefinition 阶段定义
 * @returns 任务模板列表
 */
export function getStageTaskTemplates(stageDefinition: StageDefinition): StageTaskTemplate[] {
  // 优先使用新格式的任务模板
  if (stageDefinition.taskTemplates && stageDefinition.taskTemplates.length > 0) {
    return stageDefinition.taskTemplates;
  }

  // 兼容旧格式：将 defaultTasks 转换为任务模板
  if (stageDefinition.defaultTasks && stageDefinition.defaultTasks.length > 0) {
    return stageDefinition.defaultTasks.map((taskName, index) => ({
      id: `task-${stageDefinition.key}-${index}`,
      key: `task_${index}`,
      name: taskName,
      materialRequirements: [],
    }));
  }

  return [];
}
