import { StageDeviceProgress, ProjectStageConfig } from '../types/project';
import { useStageStore } from '../stores/stageStore';

/**
 * 获取设备当前所处阶段名称
 */
export function getDeviceCurrentStage(
  deviceId: string,
  stageConfigs: ProjectStageConfig[]
): string {
  if (!stageConfigs || stageConfigs.length === 0) {
    return '未开始';
  }

  // 从后往前遍历阶段，找到设备最后完成的阶段
  for (let i = stageConfigs.length - 1; i >= 0; i--) {
    const config = stageConfigs[i];
    if (config.deviceProgress) {
      const deviceCompleted = config.deviceProgress.some(
        d => d.deviceId === deviceId && d.completed
      );
      if (deviceCompleted) {
        const stageDef = useStageStore.getState().getStageByKey(config.stageKey);
        return stageDef?.name || config.stageKey;
      }
    }
  }

  // 如果没有找到已完成的阶段，返回第一个未开始的阶段
  const firstNotStarted = stageConfigs.find(c => c.status === 'not_started');
  if (firstNotStarted) {
    const stageDef = useStageStore.getState().getStageByKey(firstNotStarted.stageKey);
    return stageDef?.name || firstNotStarted.stageKey;
  }

  // 如果所有阶段都已完成，返回最后一个阶段
  const lastStage = stageConfigs[stageConfigs.length - 1];
  const stageDef = useStageStore.getState().getStageByKey(lastStage.stageKey);
  return stageDef?.name || lastStage.stageKey;
}

/**
 * 获取设备在所有阶段中的完成情况
 */
export function getDeviceStageProgress(
  deviceId: string,
  stageConfigs: ProjectStageConfig[]
): Array<{ stageKey: string; stageName: string; completed: boolean }> {
  if (!stageConfigs || stageConfigs.length === 0) {
    return [];
  }

  return stageConfigs.map(config => {
    const stageDef = useStageStore.getState().getStageByKey(config.stageKey);
    const completed = config.deviceProgress?.some(
      d => d.deviceId === deviceId && d.completed
    ) || false;

    return {
      stageKey: config.stageKey,
      stageName: stageDef?.name || config.stageKey,
      completed,
    };
  });
}

/**
 * 检查设备是否已完成特定阶段
 */
export function isDeviceCompletedStage(
  deviceId: string,
  stageKey: string,
  stageConfigs: ProjectStageConfig[]
): boolean {
  if (!stageConfigs || stageConfigs.length === 0) {
    return false;
  }

  const config = stageConfigs.find(c => c.stageKey === stageKey);
  if (!config || !config.deviceProgress) {
    return false;
  }

  return config.deviceProgress.some(d => d.deviceId === deviceId && d.completed);
}
