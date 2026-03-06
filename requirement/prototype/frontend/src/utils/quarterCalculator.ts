import { ProjectStageConfig } from '../types/project';

interface QuarterlyProgress {
  quarter: string;
  progress: number;
  completedDevices: number;
  totalDevices: number;
}

/**
 * 计算季度进度（从stageConfigs的日期推断）
 * 这是一个简化版本，实际项目中需要根据真实的阶段开始/结束日期计算
 */
export function calculateQuarterlyProgress(
  project: any
): QuarterlyProgress[] {
  const quarters: QuarterlyProgress[] = [];

  if (!project.startDate || !project.deviceCount) {
    return quarters;
  }

  const startYear = new Date(project.startDate).getFullYear();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const currentQuarter = Math.ceil(currentMonth / 3);

  // 生成从项目开始到未来的4个季度
  let year = startYear;
  let quarter = 1; // Q1

  // 计算项目开始的季度
  const startMonth = new Date(project.startDate).getMonth() + 1;
  const startQuarter = Math.ceil(startMonth / 3);

  quarter = startQuarter;

  for (let i = 0; i < 4; i++) {
    // 计算季度进度（简化版本）
    let progress = 0;
    let completedDevices = 0;

    // 检查是否是过去的季度
    const isPastQuarter = year < currentYear || (year === currentYear && quarter < currentQuarter);
    const isCurrentQuarter = year === currentYear && quarter === currentQuarter;
    const isFutureQuarter = year > currentYear || (year === currentYear && quarter > currentQuarter);

    if (isPastQuarter) {
      // 过去的季度显示100%（简化）
      progress = Math.min(100, project.progress || 0);
      completedDevices = Math.min(project.completedDeviceCount || 0, project.deviceCount);
    } else if (isCurrentQuarter) {
      // 当前季度显示实际进度
      progress = project.progress || 0;
      completedDevices = project.completedDeviceCount || 0;
    } else {
      // 未来季度显示0
      progress = 0;
      completedDevices = 0;
    }

    quarters.push({
      quarter: `${year}-Q${quarter}`,
      progress,
      completedDevices: Math.min(completedDevices, project.deviceCount),
      totalDevices: project.deviceCount,
    });

    // 移动到下一个季度
    quarter++;
    if (quarter > 4) {
      quarter = 1;
      year++;
    }
  }

  return quarters;
}

/**
 * 根据阶段配置计算季度进度（更精确的版本）
 * 这个版本使用stageConfigs中的startDate和endDate来计算
 */
export function calculateQuarterlyProgressFromStages(
  project: any,
  stageConfigs: ProjectStageConfig[]
): QuarterlyProgress[] {
  const quarters: QuarterlyProgress[] = [];

  if (!stageConfigs || stageConfigs.length === 0 || !project.startDate) {
    return calculateQuarterlyProgress(project); // 回退到简化版本
  }

  const startYear = new Date(project.startDate).getFullYear();
  const startMonth = new Date(project.startDate).getMonth() + 1;
  const startQuarter = Math.ceil(startMonth / 3);

  let year = startYear;
  let quarter = startQuarter;

  // 生成4个季度
  for (let i = 0; i < 4; i++) {
    const quarterStart = `${year}-${String((quarter - 1) * 3 + 1).padStart(2, '0')}-01`;
    const quarterEnd = `${year}-${String(quarter * 3).padStart(2, '0')}-30`;

    // 找出该季度内的阶段
    const stagesInQuarter = stageConfigs.filter(config => {
      if (!config.startDate) return false;
      const stageStart = new Date(config.startDate);
      const stageEnd = config.endDate ? new Date(config.endDate) : new Date();
      const qStart = new Date(quarterStart);
      const qEnd = new Date(quarterEnd);
      return stageStart <= qEnd && stageEnd >= qStart;
    });

    // 计算该季度的进度（使用阶段权重和进度）
    let quarterProgress = 0;
    let totalWeightInQuarter = 0;

    stagesInQuarter.forEach(config => {
      const stageProgress = config.actualProgress || 0;
      const weight = config.weight || 0;
      quarterProgress += stageProgress * weight;
      totalWeightInQuarter += weight;
    });

    const progress = totalWeightInQuarter > 0
      ? Math.round(quarterProgress / totalWeightInQuarter)
      : 0;

    // 计算该季度完成设备数（简化）
    const completedDevices = Math.round(
      ((project.completedDeviceCount || 0) * (i + 1)) / 4
    );

    quarters.push({
      quarter: `${year}-Q${quarter}`,
      progress,
      completedDevices: Math.min(completedDevices, project.deviceCount),
      totalDevices: project.deviceCount,
    });

    // 移动到下一个季度
    quarter++;
    if (quarter > 4) {
      quarter = 1;
      year++;
    }
  }

  return quarters;
}

/**
 * 格式化季度显示
 */
export function formatQuarter(quarter: string): string {
  return quarter.replace('-', '年 ');
}
