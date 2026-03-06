import { StageTaskProgress, StageDeviceProgress, ProjectStageConfig, StageDefinition } from '../types/project';
import { Device } from '../types/device';

/**
 * 按任务推进的阶段计算进度
 * @param taskProgress 任务完成情况列表
 * @returns 阶段进度 (0-100)
 */
export function calculateByTaskStageProgress(taskProgress: StageTaskProgress[]): number {
  if (!taskProgress || taskProgress.length === 0) {
    return 0;
  }

  const completedCount = taskProgress.filter(task => task.completed).length;
  return Math.round((completedCount / taskProgress.length) * 100);
}

/**
 * 按设备推进的阶段计算进度
 * @param deviceProgress 设备完成情况列表
 * @param totalDeviceCount 项目总设备数
 * @returns 阶段进度 (0-100)
 */
export function calculateByDeviceStageProgress(
  deviceProgress: StageDeviceProgress[],
  totalDeviceCount: number
): number {
  if (!deviceProgress || deviceProgress.length === 0 || totalDeviceCount === 0) {
    return 0;
  }

  const completedCount = deviceProgress.filter(device => device.completed).length;
  return Math.round((completedCount / totalDeviceCount) * 100);
}

/**
 * 自动计算总体进度
 * @param stageConfigs 阶段配置列表
 * @returns 总体进度 (0-100)
 */
export function calculateOverallProgress(stageConfigs: ProjectStageConfig[]): number {
  if (!stageConfigs || stageConfigs.length === 0) {
    return 0;
  }

  let totalWeight = 0;
  let weightedProgress = 0;

  stageConfigs.forEach(stage => {
    const stageProgress = stage.actualProgress || 0;
    const weight = stage.weight || 0;
    weightedProgress += stageProgress * weight;
    totalWeight += weight;
  });

  if (totalWeight === 0) {
    return 0;
  }

  return Math.round(weightedProgress / totalWeight);
}

/**
 * 根据进度更新阶段状态
 * @param progress 阶段进度 (0-100)
 * @returns 阶段状态
 */
export function updateStageStatus(progress: number): 'not_started' | 'in_progress' | 'completed' {
  if (progress === 0) {
    return 'not_started';
  } else if (progress === 100) {
    return 'completed';
  } else {
    return 'in_progress';
  }
}

/**
 * 初始化阶段进度数据
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
    status: 'not_started',
    actualProgress: 0,
    weight: stageDefinition.defaultWeight || 0,
  };

  // 根据推进方式初始化不同的进度数据
  if (stageDefinition.progressMode === 'by_task' && stageDefinition.defaultTasks) {
    // 按任务推进：初始化任务列表
    stageConfig.taskProgress = stageDefinition.defaultTasks.map((taskName, index) => ({
      taskId: `task-${Date.now()}-${index}`,
      taskName,
      completed: false,
    }));
  } else if (stageDefinition.progressMode === 'by_device') {
    // 按设备推进：初始化设备列表
    stageConfig.deviceProgress = projectDevices.map(device => ({
      deviceId: device.id,
      deviceName: device.name,
      completed: false,
    }));
  }

  return stageConfig;
}

/**
 * 更新阶段进度并自动计算状态
 * @param stageConfig 阶段配置
 * @param updates 更新数据
 * @returns 更新后的阶段配置
 */
export function updateStageProgress(
  stageConfig: ProjectStageConfig,
  updates: Partial<ProjectStageConfig>
): ProjectStageConfig {
  const updated = { ...stageConfig, ...updates };

  // 如果有任务进度或设备进度更新，重新计算阶段进度
  if (updates.taskProgress && updated.taskProgress) {
    updated.actualProgress = calculateByTaskStageProgress(updated.taskProgress);
  } else if (updates.deviceProgress && updated.deviceProgress) {
    // 对于设备推进，需要知道项目总设备数
    // 这里暂时使用 deviceProgress 的长度作为总数
    // 实际使用时应该从项目数据中获取
    updated.actualProgress = calculateByDeviceStageProgress(
      updated.deviceProgress,
      updated.deviceProgress.length
    );
  }

  // 根据进度自动更新状态
  if (updated.actualProgress !== undefined) {
    updated.status = updateStageStatus(updated.actualProgress);
  }

  // 更新填报时间
  updated.lastReportDate = new Date().toISOString();

  return updated;
}

/**
 * 格式化填报日期
 * @param dateString ISO日期字符串
 * @returns 格式化的日期字符串 (YYYY-MM-DD HH:mm)
 */
export function formatReportDate(dateString?: string): string {
  if (!dateString) {
    return '-';
  }

  try {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return '-';
  }
}

/**
 * 获取阶段状态文本
 * @param status 阶段状态
 * @returns 状态文本
 */
export function getStageStatusText(status: 'not_started' | 'in_progress' | 'completed'): string {
  const statusMap = {
    not_started: '未开始',
    in_progress: '进行中',
    completed: '已完成',
  };
  return statusMap[status] || status;
}

/**
 * 获取阶段状态颜色
 * @param status 阶段状态
 * @returns 状态颜色
 */
export function getStageStatusColor(status: 'not_started' | 'in_progress' | 'completed'): string {
  const colorMap = {
    not_started: '#d9d9d9',
    in_progress: '#1890ff',
    completed: '#52c41a',
  };
  return colorMap[status] || '#d9d9d9';
}
