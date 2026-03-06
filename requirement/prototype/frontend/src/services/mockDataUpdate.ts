// This file contains updated mock data with stage progress information
// Import this to replace or supplement the existing mockData.ts

import { Project } from '../types/project';
import { generatePlanningStageProgress, generateConstructionStageProgress, generateConfigurationStageProgress, generateVerificationStageProgress } from '../utils/mockDataHelpers';

/**
 * 更新项目的阶段配置，添加详细的进度数据
 */
export function updateProjectWithStageProgress(project: Project): Project {
  const stageConfigs: Project['stageConfigs'] = [];

  // 根据项目状态添加阶段进度数据
  if (project.stage === 'planning' || project.stage === 'construction' ||
      project.stage === 'configuration' || project.stage === 'verification') {

    // 准备阶段（按任务）
    if (project.progress > 0) {
      stageConfigs.push({
        ...generatePlanningStageProgress(),
        status: project.progress >= 20 ? 'completed' : 'in_progress',
        actualProgress: project.progress >= 20 ? 100 : Math.round((project.progress / 20) * 100),
      });
    } else {
      stageConfigs.push(generatePlanningStageProgress());
    }

    // 施工阶段（按设备）
    const constructionProgress = Math.max(0, Math.min(100, project.progress - 20));
    if (project.progress > 20) {
      stageConfigs.push({
        ...generateConstructionStageProgress(
          project.id,
          project.progress >= 60 ? ['1', '2', '3', '4'].slice(0, Math.floor((project.progress - 20) / 10)) : ['1', '2'],
          project.deviceCount
        ),
        status: constructionProgress >= 40 ? 'completed' : constructionProgress > 0 ? 'in_progress' : 'not_started',
        actualProgress: Math.round((constructionProgress / 40) * 100),
      });
    } else {
      stageConfigs.push(generateConstructionStageProgress(project.id, [], project.deviceCount));
    }

    // 配置阶段（按设备）
    const configProgress = Math.max(0, Math.min(100, project.progress - 60));
    stageConfigs.push({
      ...generateConfigurationStageProgress(configProgress > 0 ? Math.round((configProgress / 25) * 100) : 0),
      status: configProgress >= 25 ? 'completed' : configProgress > 0 ? 'in_progress' : 'not_started',
    });

    // 核对阶段（按任务）
    const verificationProgress = Math.max(0, project.progress - 85);
    stageConfigs.push({
      ...generateVerificationStageProgress(verificationProgress > 0 ? Math.round((verificationProgress / 15) * 100) : 0),
      status: verificationProgress >= 15 ? 'completed' : verificationProgress > 0 ? 'in_progress' : 'not_started',
    });
  }

  return {
    ...project,
    stageConfigs,
  };
}

/**
 * 示例：为项目 "PRJ-2024-001" 添加详细的阶段进度数据
 */
export const exampleProjectWithStageProgress: Partial<Project> = {
  id: '1',
  stageConfigs: [
    {
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
    },
    {
      stageKey: 'construction',
      weight: 40,
      status: 'in_progress',
      actualProgress: 50,
      deviceProgress: [
        { deviceId: '1', deviceName: '注塑机-01', completed: true, completedDate: '2024-02-01' },
        { deviceId: '2', deviceName: '注塑机-02', completed: true, completedDate: '2024-02-01' },
        { deviceId: '3', deviceName: '装配机器人-01', completed: false },
        { deviceId: '4', deviceName: '装配机器人-02', completed: false },
      ],
      remark: '设备安装进行中，已完成2台设备',
      lastReportDate: '2024-02-05T14:30:00.000Z',
    },
    {
      stageKey: 'configuration',
      weight: 25,
      status: 'not_started',
      actualProgress: 0,
      deviceProgress: [],
      remark: '',
    },
    {
      stageKey: 'verification',
      weight: 15,
      status: 'not_started',
      actualProgress: 0,
      taskProgress: [
        { taskId: 'v1', taskName: '数据核对', completed: false },
        { taskId: 'v2', taskName: '准确性验证', completed: false },
        { taskId: 'v3', taskName: '完整性检查', completed: false },
      ],
      remark: '',
    },
  ],
};
