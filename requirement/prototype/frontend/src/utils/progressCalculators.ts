import { StageTaskProgress, StageDeviceProgress, ProjectStageConfig, StageDefinition, DeviceTaskProgress, StageTaskTemplate, MaterialRequirement, TaskMaterial, MaterialFileType } from '../types/project';
import { Device } from '../types/device';
import { MediaAttachment } from '../types/device';

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

// ==================== 任务级进度计算相关函数 ====================

/**
 * 计算单个设备的任务完成进度
 * @param taskProgress 设备的任务进度列表
 * @param taskTemplates 任务模板列表
 * @returns 设备任务完成率 (0-100)
 */
export function calculateDeviceTaskProgress(
  taskProgress: DeviceTaskProgress[],
  taskTemplates: StageTaskTemplate[]
): number {
  if (!taskProgress || taskProgress.length === 0 || !taskTemplates || taskTemplates.length === 0) {
    return 0;
  }

  // 检查每个任务是否完成（包含资料验证）
  const completedCount = taskProgress.filter(task => {
    if (!task.completed) return false;
    // 如果有资料要求，验证资料是否完整
    if (task.materials && task.materials.length > 0) {
      return task.materials.every(m => m.completed);
    }
    return true;
  }).length;

  return Math.round((completedCount / taskTemplates.length) * 100);
}

/**
 * 判断设备是否全部完成
 * @param taskProgress 设备的任务进度列表
 * @param taskTemplates 任务模板列表
 * @returns 是否全部完成
 */
export function isDeviceFullyCompleted(
  taskProgress: DeviceTaskProgress[],
  taskTemplates: StageTaskTemplate[]
): boolean {
  if (!taskProgress || taskProgress.length === 0) {
    return false;
  }

  return taskProgress.every(task => {
    if (!task.completed) return false;
    // 如果有资料要求，验证资料是否完整
    if (task.materials && task.materials.length > 0) {
      return task.materials.every(m => m.completed);
    }
    return true;
  });
}

/**
 * 计算按设备推进的阶段进度（支持任务级）
 * @param deviceProgress 设备进度列表
 * @param taskTemplates 任务模板列表
 * @param totalDeviceCount 项目总设备数
 * @returns 阶段进度 (0-100)
 */
export function calculateByDeviceStageProgressWithTasks(
  deviceProgress: StageDeviceProgress[],
  taskTemplates: StageTaskTemplate[],
  totalDeviceCount: number
): number {
  if (!deviceProgress || deviceProgress.length === 0 || totalDeviceCount === 0) {
    return 0;
  }

  // 如果没有任务模板，使用旧的计算方式
  if (!taskTemplates || taskTemplates.length === 0) {
    const completedCount = deviceProgress.filter(device => device.completed).length;
    return Math.round((completedCount / totalDeviceCount) * 100);
  }

  // 计算每个设备的完成率，然后求平均
  const deviceCompletionRates = deviceProgress.map(device => {
    // 如果设备有任务级进度，使用任务级计算
    if (device.taskProgress && device.taskProgress.length > 0) {
      return calculateDeviceTaskProgress(device.taskProgress, taskTemplates);
    }
    // 否则使用设备的完成状态
    return device.completed ? 100 : 0;
  });

  const totalRate = deviceCompletionRates.reduce((sum, rate) => sum + rate, 0);
  return Math.round(totalRate / deviceProgress.length);
}

/**
 * 验证单个资料需求是否满足
 * @param requirement 资料需求
 * @param files 已上传的文件列表
 * @returns 是否满足要求
 */
export function validateMaterialRequirement(
  requirement: MaterialRequirement,
  files: MediaAttachment[]
): boolean {
  const fileCount = files.length;

  // 检查数量范围
  if (requirement.minCount !== undefined && fileCount < requirement.minCount) {
    return false;
  }
  if (requirement.maxCount !== undefined && fileCount > requirement.maxCount) {
    return false;
  }

  // 必填项至少需要一个文件
  if (requirement.required && fileCount === 0) {
    return false;
  }

  // 检查文件类型（如果指定了acceptTypes）
  if (requirement.acceptTypes && requirement.acceptTypes.length > 0) {
    const allTypesMatch = files.every(file => {
      // 从文件名推断MIME类型（简化处理）
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      return requirement.acceptTypes!.some(type => type.includes(fileExtension));
    });
    if (!allTypesMatch) {
      return false;
    }
  }

  return true;
}

/**
 * 验证任务资料完整性
 * @param task 任务进度（设备任务或阶段任务）
 * @param taskTemplate 任务模板
 * @returns 验证结果
 */
export function validateTaskMaterials(
  task: DeviceTaskProgress | StageTaskProgress,
  taskTemplate: StageTaskTemplate
): { valid: boolean; missingRequirements: string[] } {
  if (!task.materials || task.materials.length === 0) {
    // 如果任务模板没有资料要求，默认通过
    if (taskTemplate.materialRequirements.length === 0) {
      return { valid: true, missingRequirements: [] };
    }
    // 有资料要求但没有上传资料
    const missingRequired = taskTemplate.materialRequirements
      .filter(req => req.required)
      .map(req => req.name);
    return {
      valid: !missingRequired.length,
      missingRequirements: missingRequired
    };
  }

  const missingRequirements: string[] = [];

  for (const requirement of taskTemplate.materialRequirements) {
    const material = task.materials.find(m => m.requirementKey === requirement.key);
    const files = material?.files || [];

    if (!validateMaterialRequirement(requirement, files)) {
      missingRequirements.push(requirement.name);
    }
  }

  return {
    valid: missingRequirements.length === 0,
    missingRequirements
  };
}

/**
 * 更新任务资料的完成状态
 * @param materials 任务资料列表
 * @param requirements 资料需求列表
 * @returns 更新后的任务资料列表
 */
export function updateMaterialCompletionStatus(
  materials: TaskMaterial[],
  requirements: MaterialRequirement[]
): TaskMaterial[] {
  return materials.map(material => {
    const requirement = requirements.find(r => r.key === material.requirementKey);
    if (!requirement) {
      return material;
    }

    const completed = validateMaterialRequirement(requirement, material.files);

    return {
      ...material,
      completed,
      completedDate: completed && !material.completedDate ? new Date().toISOString().split('T')[0] : material.completedDate,
    };
  });
}

/**
 * 根据文件类型获取对应的MIME类型列表
 * @param fileType 文件类型枚举
 * @returns MIME类型数组
 */
export function getAcceptTypes(fileType: MaterialFileType): string[] {
  const typeMap: Record<MaterialFileType, string[]> = {
    [MaterialFileType.IMAGE]: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'],
    [MaterialFileType.VIDEO]: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'],
    [MaterialFileType.DOCUMENT]: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    [MaterialFileType.SPREADSHEET]: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'],
    [MaterialFileType.CAD]: ['application/dwg', 'image/vnd.dxf', 'application/acad'],
    [MaterialFileType.OTHER]: ['*/*'],
  };

  return typeMap[fileType] || ['*/*'];
}

/**
 * 获取文件类型的显示名称
 * @param fileType 文件类型枚举
 * @returns 显示名称
 */
export function getFileTypeName(fileType: MaterialFileType): string {
  const nameMap: Record<MaterialFileType, string> = {
    [MaterialFileType.IMAGE]: '图片',
    [MaterialFileType.VIDEO]: '视频',
    [MaterialFileType.DOCUMENT]: '文档',
    [MaterialFileType.SPREADSHEET]: '表格',
    [MaterialFileType.CAD]: 'CAD图纸',
    [MaterialFileType.OTHER]: '其他',
  };

  return nameMap[fileType] || '未知';
}
