import { ProjectStageConfig } from '../types/project';

/**
 * 生成准备阶段的进度数据（按任务推进）
 */
export function generatePlanningStageProgress(): ProjectStageConfig {
  return {
    stageKey: 'planning',
    weight: 20,
    status: 'completed',
    actualProgress: 100,
    taskProgress: [
      { taskId: 't1', taskName: '人员配置', completed: true, completedDate: '2024-01-20', remark: '已配置项目经理和工程师团队' },
      { taskId: 't2', taskName: '设备采购', completed: true, completedDate: '2024-01-25', remark: '采购完成' },
      { taskId: 't3', taskName: '工具准备', completed: true, completedDate: '2024-02-01', remark: '工具齐全' },
      { taskId: 't4', taskName: '技术方案确认', completed: true, completedDate: '2024-02-10', remark: '方案已确认' },
    ],
    remark: '准备阶段已完成',
    lastReportDate: '2024-02-10T10:00:00.000Z',
  };
}

/**
 * 生成施工阶段的进度数据（按设备推进）
 */
export function generateConstructionStageProgress(projectId: string, completedDevices: string[], totalDevices: number): ProjectStageConfig {
  // 根据项目ID生成设备进度数据
  const projectDevices: Record<string, Array<{ id: string; name: string }>> = {
    '1': [
      { id: '1', name: '注塑机-01' },
      { id: '2', name: '注塑机-02' },
      { id: '3', name: '装配机器人-01' },
      { id: '4', name: '装配机器人-02' },
    ],
    '2': [
      { id: '6', name: '装配线PLC-01' },
      { id: '8', name: '温控设备-01' },
      { id: '9', name: '传感器组-01' },
    ],
    '4': [
      { id: '4', name: 'CNC加工中心-01' },
      { id: '5', name: 'CNC加工中心-02' },
      { id: '9', name: 'CNC加工中心-03' },
      { id: '10', name: 'CNC加工中心-04' },
    ],
  };

  const devices = projectDevices[projectId] || [];
  const progress = completedDevices.length > 0
    ? Math.round((completedDevices.length / devices.length) * 100)
    : 0;

  return {
    stageKey: 'construction',
    weight: 40,
    status: progress === 0 ? 'not_started' : progress === 100 ? 'completed' : 'in_progress',
    actualProgress: progress,
    deviceProgress: devices.map(device => ({
      deviceId: device.id,
      deviceName: device.name,
      completed: completedDevices.includes(device.id),
      completedDate: completedDevices.includes(device.id) ? '2024-02-01' : undefined,
    })),
    remark: progress > 0 ? '设备安装进行中' : '',
    lastReportDate: progress > 0 ? '2024-02-05T14:30:00.000Z' : undefined,
  };
}

/**
 * 生成配置阶段的进度数据（按设备推进）
 */
export function generateConfigurationStageProgress(progress: number): ProjectStageConfig {
  return {
    stageKey: 'configuration',
    weight: 25,
    status: progress === 0 ? 'not_started' : progress === 100 ? 'completed' : 'in_progress',
    actualProgress: progress,
    deviceProgress: [],
    remark: progress > 0 ? '配置进行中' : '',
  };
}

/**
 * 生成核对阶段的进度数据（按任务推进）
 */
export function generateVerificationStageProgress(progress: number): ProjectStageConfig {
  return {
    stageKey: 'verification',
    weight: 15,
    status: progress === 0 ? 'not_started' : progress === 100 ? 'completed' : 'in_progress',
    actualProgress: progress,
    taskProgress: [
      { taskId: 'v1', taskName: '数据核对', completed: progress >= 33, completedDate: progress >= 33 ? '2024-02-01' : undefined },
      { taskId: 'v2', taskName: '准确性验证', completed: progress >= 66, completedDate: progress >= 66 ? '2024-02-03' : undefined },
      { taskId: 'v3', taskName: '完整性检查', completed: progress === 100, completedDate: progress === 100 ? '2024-02-05' : undefined },
    ],
    remark: progress > 0 ? '数据验证进行中' : '',
  };
}

/**
 * 生成空的阶段进度数据
 */
export function generateEmptyStageProgress(stageKey: string, weight: number): ProjectStageConfig {
  return {
    stageKey,
    weight,
    status: 'not_started',
    actualProgress: 0,
    taskProgress: [],
    deviceProgress: [],
    remark: '',
  };
}
