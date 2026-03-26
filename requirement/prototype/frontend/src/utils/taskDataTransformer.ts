import { Project, ProjectStageConfig, StageDeviceProgress, DeviceTaskProgress } from '../types/project';
import { StageDefinition } from '../types/project';
import { TaskCardData, ProjectDeviceGroup, DeviceTaskItem, TaskStatistics, DeviceTaskListItem, ProjectTaskListItem } from '../types/task';

/**
 * 将项目数据转换为任务列表数据
 * 按任务类型聚合所有项目中相同任务的进度
 */
export function transformProjectsToTaskCards(
  projects: Project[],
  stageDefinitions: StageDefinition[]
): TaskCardData[] {
  const taskMap = new Map<string, TaskCardData>();

  // 遍历所有项目
  projects.forEach(project => {
    // 遍历项目的所有阶段配置
    project.stageConfigs.forEach(stageConfig => {
      // 找到对应的阶段定义
      const stageDef = stageDefinitions.find(def => def.key === stageConfig.stageKey);
      if (!stageDef || !stageDef.taskTemplates || stageDef.taskTemplates.length === 0) {
        return; // 跳过没有任务模板的阶段
      }

      // 只处理按设备推进的阶段
      if (stageDef.progressMode !== 'by_device') {
        return;
      }

      // 遍历每个任务模板
      stageDef.taskTemplates.forEach(taskTemplate => {
        const taskKey = taskTemplate.key;
        const taskName = taskTemplate.name;

        // 初始化任务卡片数据
        if (!taskMap.has(taskKey)) {
          taskMap.set(taskKey, {
            taskKey,
            taskName,
            totalDeviceCount: 0,
            completedDeviceCount: 0,
            progress: 0,
            projectGroups: [],
            materialRequirements: taskTemplate.materialRequirements,
          });
        }

        const taskCard = taskMap.get(taskKey)!;

        // 查找或创建项目分组
        let projectGroup = taskCard.projectGroups.find(pg => pg.projectId === project.id);
        if (!projectGroup) {
          projectGroup = {
            projectId: project.id,
            projectName: project.name,
            projectCode: project.code,
            stageKey: stageConfig.stageKey,
            stageName: stageDef.name,
            devices: [],
          };
          taskCard.projectGroups.push(projectGroup);
        }

        // 处理设备进度数据
        if (stageConfig.deviceProgress) {
          stageConfig.deviceProgress.forEach(deviceProgress => {
            // 查找该设备的任务进度
            const deviceTaskProgress = deviceProgress.taskProgress?.find(
              tp => tp.taskKey === taskKey
            );

            // 跳过已添加的设备（同一设备在不同阶段可能有相同任务）
            const existingDevice = projectGroup.devices.find(d => d.deviceId === deviceProgress.deviceId);
            if (existingDevice) {
              return;
            }

            const deviceItem: DeviceTaskItem = {
              deviceId: deviceProgress.deviceId,
              deviceName: deviceProgress.deviceName,
              completed: deviceTaskProgress?.completed || false,
              completedDate: deviceTaskProgress?.completedDate,
              remark: deviceTaskProgress?.remark,
              materials: deviceTaskProgress?.materials,
              taskId: deviceTaskProgress?.taskId || taskTemplate.id,
            };

            projectGroup.devices.push(deviceItem);

            // 更新统计
            taskCard.totalDeviceCount++;
            if (deviceItem.completed) {
              taskCard.completedDeviceCount++;
            }
          });
        }
      });
    });
  });

  // 计算每个任务的进度
  const taskCards = Array.from(taskMap.values());
  taskCards.forEach(card => {
    if (card.totalDeviceCount > 0) {
      card.progress = Math.round((card.completedDeviceCount / card.totalDeviceCount) * 100);
    }
  });

  return taskCards;
}

/**
 * 计算任务统计概览
 */
export function calculateTaskStatistics(taskCards: TaskCardData[]): TaskStatistics {
  const totalTasks = taskCards.length;
  const totalDevices = taskCards.reduce((sum, card) => sum + card.totalDeviceCount, 0);
  const completedDevices = taskCards.reduce((sum, card) => sum + card.completedDeviceCount, 0);

  const pendingTasks = taskCards.filter(card => card.progress === 0).length;
  const completedTasks = taskCards.filter(card => card.progress === 100).length;
  const inProgressTasks = totalTasks - pendingTasks - completedTasks;

  return {
    totalTasks,
    totalDevices,
    completedDevices,
    pendingTasks,
    inProgressTasks,
    completedTasks,
  };
}

/**
 * 根据筛选条件过滤任务卡片
 */
export function filterTaskCards(
  taskCards: TaskCardData[],
  filter: {
    searchText?: string;
    projectIds?: string[];
    status?: 'all' | 'pending' | 'in_progress' | 'completed';
  }
): TaskCardData[] {
  let filtered = [...taskCards];

  // 按状态筛选
  if (filter.status && filter.status !== 'all') {
    filtered = filtered.filter(card => {
      switch (filter.status) {
        case 'pending':
          return card.progress === 0;
        case 'in_progress':
          return card.progress > 0 && card.progress < 100;
        case 'completed':
          return card.progress === 100;
        default:
          return true;
      }
    });
  }

  // 按项目筛选
  if (filter.projectIds && filter.projectIds.length > 0) {
    filtered = filtered.filter(card =>
      card.projectGroups.some(pg => filter.projectIds!.includes(pg.projectId))
    );
  }

  // 按设备名称搜索
  if (filter.searchText && filter.searchText.trim()) {
    const searchLower = filter.searchText.toLowerCase().trim();
    filtered = filtered.filter(card =>
      card.projectGroups.some(pg =>
        pg.devices.some(d => d.deviceName.toLowerCase().includes(searchLower))
      )
    );
  }

  return filtered;
}

/**
 * 获取任务状态标签
 */
export function getTaskStatusTag(progress: number): { text: string; color: string } {
  if (progress === 0) {
    return { text: '待处理', color: 'default' };
  } else if (progress === 100) {
    return { text: '已完成', color: 'success' };
  } else {
    return { text: '进行中', color: 'processing' };
  }
}

/**
 * 格式化日期显示
 */
export function formatTaskDate(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return '-';
  }
}

/**
 * 将项目数据转换为设备任务列表
 * 按 项目→阶段→设备→任务 扁平化为列表，每行代表一个设备的一个任务
 */
export function transformProjectsToDeviceTaskList(
  projects: Project[],
  stageDefinitions: StageDefinition[]
): DeviceTaskListItem[] {
  const deviceTaskList: DeviceTaskListItem[] = [];

  // 遍历所有项目
  projects.forEach(project => {
    // 遍历项目的所有阶段配置
    project.stageConfigs.forEach(stageConfig => {
      // 找到对应的阶段定义
      const stageDef = stageDefinitions.find(def => def.key === stageConfig.stageKey);
      if (!stageDef || !stageDef.taskTemplates || stageDef.taskTemplates.length === 0) {
        return; // 跳过没有任务模板的阶段
      }

      // 只处理按设备推进的阶段
      if (stageDef.progressMode !== 'by_device') {
        return;
      }

      // 处理设备进度数据
      if (stageConfig.deviceProgress) {
        stageConfig.deviceProgress.forEach(deviceProgress => {
          // 遍历每个任务模板
          stageDef.taskTemplates?.forEach(taskTemplate => {
            const taskKey = taskTemplate.key;
            const taskName = taskTemplate.name;

            // 查找该设备的任务进度
            const deviceTaskProgress = deviceProgress.taskProgress?.find(
              tp => tp.taskKey === taskKey
            );

            // 生成唯一标识
            const key = `${project.id}-${stageConfig.stageKey}-${deviceProgress.deviceId}-${taskKey}`;

            const listItem: DeviceTaskListItem = {
              key,
              projectId: project.id,
              projectCode: project.code,
              projectName: project.name,
              stageKey: stageConfig.stageKey,
              stageName: stageDef.name,
              deviceId: deviceProgress.deviceId,
              deviceName: deviceProgress.deviceName,
              taskKey,
              taskName,
              completed: deviceTaskProgress?.completed || false,
              completedDate: deviceTaskProgress?.completedDate,
              remark: deviceTaskProgress?.remark,
              taskId: deviceTaskProgress?.taskId || taskTemplate.id,
              materialRequirements: taskTemplate.materialRequirements,
            };

            deviceTaskList.push(listItem);
          });
        });
      }
    });
  });

  return deviceTaskList;
}

/**
 * 根据筛选条件过滤设备任务列表
 */
export function filterDeviceTaskList(
  deviceTaskList: DeviceTaskListItem[],
  filter: {
    searchText?: string;
    projectIds?: string[];
    status?: 'all' | 'pending' | 'in_progress' | 'completed';
  }
): DeviceTaskListItem[] {
  let filtered = [...deviceTaskList];

  // 按状态筛选
  if (filter.status && filter.status !== 'all') {
    filtered = filtered.filter(item => {
      switch (filter.status) {
        case 'pending':
          return !item.completed;
        case 'in_progress':
          // 进行中需要判断是否有部分完成的数据，这里简化为未完成
          // 实际场景中可能需要更复杂的逻辑
          return !item.completed;
        case 'completed':
          return item.completed;
        default:
          return true;
      }
    });
  }

  // 按项目筛选
  if (filter.projectIds && filter.projectIds.length > 0) {
    filtered = filtered.filter(item => filter.projectIds!.includes(item.projectId));
  }

  // 按设备名称搜索
  if (filter.searchText && filter.searchText.trim()) {
    const searchLower = filter.searchText.toLowerCase().trim();
    filtered = filtered.filter(item =>
      item.deviceName.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
}

/**
 * 从设备任务列表计算任务统计概览
 */
export function calculateStatisticsFromDeviceList(deviceTaskList: DeviceTaskListItem[]): TaskStatistics {
  // 统计任务类型数量（去重）
  const uniqueTaskKeys = new Set(deviceTaskList.map(item => item.taskKey));
  const totalTasks = uniqueTaskKeys.size;

  // 统计设备总数（去重）
  const uniqueDeviceIds = new Set(deviceTaskList.map(item => item.deviceId));
  const totalDevices = uniqueDeviceIds.size;

  // 统计已完成设备（所有任务都完成的设备）
  const deviceCompletionMap = new Map<string, { total: number; completed: number }>();
  deviceTaskList.forEach(item => {
    if (!deviceCompletionMap.has(item.deviceId)) {
      deviceCompletionMap.set(item.deviceId, { total: 0, completed: 0 });
    }
    const stats = deviceCompletionMap.get(item.deviceId)!;
    stats.total++;
    if (item.completed) {
      stats.completed++;
    }
  });

  const completedDevices = Array.from(deviceCompletionMap.values())
    .filter(stats => stats.total === stats.completed)
    .length;

  // 统计待处理和已完成任务
  const completedTasks = deviceTaskList.filter(item => item.completed).length;
  const pendingTasks = totalTasks === 0 ? 0 : Array.from(uniqueTaskKeys)
    .filter(taskKey => !deviceTaskList.some(item => item.taskKey === taskKey && item.completed))
    .length;
  const inProgressTasks = totalTasks - pendingTasks - (completedTasks > 0 ? 1 : 0);

  return {
    totalTasks,
    totalDevices,
    completedDevices,
    pendingTasks: Math.max(0, pendingTasks),
    inProgressTasks: Math.max(0, inProgressTasks),
    completedTasks: Math.max(0, completedTasks),
  };
}

/**
 * 将项目数据转换为项目级任务列表
 * 按 项目→阶段→任务 扁平化为列表，每行代表一个项目的一个任务
 * 只处理 progressMode === 'by_task' 的阶段
 */
export function transformProjectsToProjectTaskList(
  projects: Project[],
  stageDefinitions: StageDefinition[]
): ProjectTaskListItem[] {
  const projectTaskList: ProjectTaskListItem[] = [];

  // 遍历所有项目
  projects.forEach(project => {
    // 遍历项目的所有阶段配置
    project.stageConfigs.forEach(stageConfig => {
      // 找到对应的阶段定义
      const stageDef = stageDefinitions.find(def => def.key === stageConfig.stageKey);
      if (!stageDef || !stageDef.taskTemplates || stageDef.taskTemplates.length === 0) {
        return; // 跳过没有任务模板的阶段
      }

      // 只处理按任务推进的阶段
      if (stageDef.progressMode !== 'by_task') {
        return;
      }

      // 遍历每个任务模板
      stageDef.taskTemplates.forEach(taskTemplate => {
        const taskKey = taskTemplate.key;
        const taskName = taskTemplate.name;

        // 查找该任务的进度数据
        const taskProgress = stageConfig.taskProgress?.find(
          tp => tp.taskKey === taskKey
        );

        // 生成唯一标识
        const key = `${project.id}-${stageConfig.stageKey}-${taskKey}`;

        const listItem: ProjectTaskListItem = {
          key,
          projectId: project.id,
          projectCode: project.code,
          projectName: project.name,
          stageKey: stageConfig.stageKey,
          stageName: stageDef.name,
          taskId: taskTemplate.id,
          taskKey,
          taskName,
          completed: taskProgress?.completed || false,
          completedDate: taskProgress?.completedDate,
          remark: taskProgress?.remark,
          materials: taskProgress?.materials,
          materialRequirements: taskTemplate.materialRequirements,
        };

        projectTaskList.push(listItem);
      });
    });
  });

  return projectTaskList;
}

/**
 * 从项目级任务列表计算统计概览
 */
export function calculateStatisticsFromProjectTaskList(projectTaskList: ProjectTaskListItem[]): TaskStatistics {
  // 统计任务类型数量（去重）
  const uniqueTaskKeys = new Set(projectTaskList.map(item => item.taskKey));
  const totalTasks = uniqueTaskKeys.size;

  // 统计项目总数（去重）
  const uniqueProjectIds = new Set(projectTaskList.map(item => item.projectId));
  const totalProjects = uniqueProjectIds.size;

  // 统计已完成任务数
  const completedTasks = projectTaskList.filter(item => item.completed).length;

  // 统计待处理任务数（唯一任务键中未完成的）
  const pendingTasks = Array.from(uniqueTaskKeys).filter(taskKey =>
    !projectTaskList.some(item => item.taskKey === taskKey && item.completed)
  ).length;

  // 进行中任务 = 总任务数 - 待处理 - 已完成（这里简化处理）
  const inProgressTasks = totalTasks - pendingTasks;

  return {
    totalTasks,
    totalDevices: totalProjects, // 复用字段表示项目数
    completedDevices: completedTasks, // 复用字段表示已完成任务数
    pendingTasks: Math.max(0, pendingTasks),
    inProgressTasks: Math.max(0, inProgressTasks),
    completedTasks: Math.max(0, completedTasks),
  };
}

/**
 * 根据筛选条件过滤项目级任务列表
 */
export function filterProjectTaskList(
  projectTaskList: ProjectTaskListItem[],
  filter: {
    searchText?: string;
    projectIds?: string[];
    status?: 'all' | 'pending' | 'in_progress' | 'completed';
  }
): ProjectTaskListItem[] {
  let filtered = [...projectTaskList];

  // 按状态筛选
  if (filter.status && filter.status !== 'all') {
    filtered = filtered.filter(item => {
      switch (filter.status) {
        case 'pending':
          return !item.completed;
        case 'in_progress':
          // 项目级任务没有中间状态，这里返回未完成的
          return !item.completed;
        case 'completed':
          return item.completed;
        default:
          return true;
      }
    });
  }

  // 按项目筛选
  if (filter.projectIds && filter.projectIds.length > 0) {
    filtered = filtered.filter(item => filter.projectIds!.includes(item.projectId));
  }

  // 按任务名称搜索
  if (filter.searchText && filter.searchText.trim()) {
    const searchLower = filter.searchText.toLowerCase().trim();
    filtered = filtered.filter(item =>
      item.taskName.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
}
