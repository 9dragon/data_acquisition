import { create } from 'zustand';
import { Project, ProjectPlan, ProjectTask, ProjectStats, PaginationParams, ProjectStageConfig } from '../types/project';
import { PaginationResponse } from '../types/common';
import { mockProjectPlans } from '../services/mockData';
import { calculateOverallProgress, updateStageProgress } from '../utils/progressCalculators';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  projectPlans: ProjectPlan[];
  stats: ProjectStats | null;
  loading: boolean;

  // Actions
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setProjectPlans: (plans: ProjectPlan[]) => void;
  setStats: (stats: ProjectStats) => void;
  setLoading: (loading: boolean) => void;

  // 计划管理
  getProjectPlan: (planId: string) => ProjectPlan | undefined;
  createProjectPlan: (plan: Omit<ProjectPlan, 'id' | 'createTime' | 'updateTime'>) => void;
  updateProjectPlan: (planId: string, data: Partial<ProjectPlan>) => void;
  deleteProjectPlan: (planId: string) => void;

  // 任务管理
  addTask: (projectId: string, task: ProjectTask) => void;
  updateTask: (projectId: string, taskId: string, data: Partial<ProjectTask>) => void;
  deleteTask: (projectId: string, taskId: string) => void;
  getTasksByProject: (projectId: string) => ProjectTask[];

  // 进度管理
  updateProjectProgress: (projectId: string, progressData: ProgressReportData) => void;
  calculateAndUpdateOverallProgress: (projectId: string) => void;
  updateStageProgress: (
    projectId: string,
    stageKey: string,
    stageProgress: Partial<ProjectStageConfig>
  ) => void;
}

// 进度填报数据接口
export interface ProgressReportData {
  stageConfigs: ProjectStageConfig[];
  overallRemark?: string;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,
  projectPlans: mockProjectPlans, // Initialize with mock data
  stats: null,
  loading: false,

  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
  updateProject: (id, data) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...data } : p)),
      currentProject: state.currentProject?.id === id ? { ...state.currentProject, ...data } : state.currentProject,
    })),
  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
    })),
  setProjectPlans: (plans) => set({ projectPlans: plans }),
  setStats: (stats) => set({ stats }),
  setLoading: (loading) => set({ loading }),

  // 计划管理方法
  getProjectPlan: (planId) => {
    return useProjectStore.getState().projectPlans.find(p => p.id === planId);
  },
  createProjectPlan: (plan) =>
    set((state) => {
      const newPlan: ProjectPlan = {
        ...plan,
        id: `plan-${Date.now()}`,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
      };
      return { projectPlans: [...state.projectPlans, newPlan] };
    }),
  updateProjectPlan: (planId, data) =>
    set((state) => ({
      projectPlans: state.projectPlans.map(p =>
        p.id === planId
          ? { ...p, ...data, updateTime: new Date().toISOString() }
          : p
      ),
    })),
  deleteProjectPlan: (planId) =>
    set((state) => ({
      projectPlans: state.projectPlans.filter(p => p.id !== planId),
    })),

  // 任务管理方法
  addTask: (projectId, task) =>
    set((state) => {
      const existingPlan = state.projectPlans.find(p => p.projectId === projectId);
      if (existingPlan) {
        return {
          projectPlans: state.projectPlans.map(p =>
            p.projectId === projectId
              ? { ...p, tasks: [...p.tasks, task] }
              : p
          )
        };
      } else {
        // 如果项目计划不存在，创建一个新的（使用新的数据结构）
        const newPlan: ProjectPlan = {
          id: `plan-${Date.now()}`,
          projectId,
          name: `${projectId}项目计划`,
          startDate: task.startDate,
          endDate: task.endDate,
          stages: [],
          tasks: [task],
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString(),
        };
        return { projectPlans: [...state.projectPlans, newPlan] };
      }
    }),
  updateTask: (projectId, taskId, data) =>
    set((state) => ({
      projectPlans: state.projectPlans.map(p =>
        p.projectId === projectId
          ? {
              ...p,
              tasks: p.tasks.map(t =>
                t.id === taskId ? { ...t, ...data } : t
              ),
              updateTime: new Date().toISOString(),
            }
          : p
      )
    })),
  deleteTask: (projectId, taskId) =>
    set((state) => ({
      projectPlans: state.projectPlans.map(p =>
        p.projectId === projectId
          ? { ...p, tasks: p.tasks.filter(t => t.id !== taskId) }
          : p
      )
    })),
  getTasksByProject: (projectId) => {
    const plans = useProjectStore.getState().projectPlans.filter(p => p.projectId === projectId);
    return plans.flatMap(p => p.tasks);
  },

  // 进度管理方法
  updateProjectProgress: (projectId, progressData) =>
    set((state) => {
      const project = state.projects.find(p => p.id === projectId);
      if (!project) return state;

      // 计算总体进度
      const overallProgress = calculateOverallProgress(progressData.stageConfigs);

      // 更新项目的阶段配置和总体进度
      return {
        projects: state.projects.map(p =>
          p.id === projectId
            ? {
                ...p,
                stageConfigs: progressData.stageConfigs,
                progress: overallProgress,
                updateTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
              }
            : p
        ),
        currentProject: state.currentProject?.id === projectId
          ? {
              ...state.currentProject,
              stageConfigs: progressData.stageConfigs,
              progress: overallProgress,
              updateTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
            }
          : state.currentProject,
      };
    }),

  calculateAndUpdateOverallProgress: (projectId) =>
    set((state) => {
      const project = state.projects.find(p => p.id === projectId);
      if (!project || !project.stageConfigs) return state;

      // 计算总体进度
      const overallProgress = calculateOverallProgress(project.stageConfigs);

      return {
        projects: state.projects.map(p =>
          p.id === projectId
            ? { ...p, progress: overallProgress }
            : p
        ),
        currentProject: state.currentProject?.id === projectId
          ? { ...state.currentProject, progress: overallProgress }
          : state.currentProject,
      };
    }),

  updateStageProgress: (projectId, stageKey, stageProgress) =>
    set((state) => {
      const project = state.projects.find(p => p.id === projectId);
      if (!project || !project.stageConfigs) return state;

      // 查找并更新指定的阶段配置
      const updatedStageConfigs = project.stageConfigs.map(config => {
        if (config.stageKey === stageKey) {
          return updateStageProgress(config, stageProgress);
        }
        return config;
      });

      // 计算新的总体进度
      const overallProgress = calculateOverallProgress(updatedStageConfigs);

      return {
        projects: state.projects.map(p =>
          p.id === projectId
            ? {
                ...p,
                stageConfigs: updatedStageConfigs,
                progress: overallProgress,
                updateTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
              }
            : p
        ),
        currentProject: state.currentProject?.id === projectId
          ? {
              ...state.currentProject,
              stageConfigs: updatedStageConfigs,
              progress: overallProgress,
              updateTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
            }
          : state.currentProject,
      };
    }),
}));
