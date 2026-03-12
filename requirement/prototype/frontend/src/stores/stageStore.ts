import { create } from 'zustand';
import { StageDefinition, StageTaskTemplate } from '../types/project';

interface StageState {
  stageDefinitions: StageDefinition[];
  loading: boolean;

  // Actions
  setStageDefinitions: (definitions: StageDefinition[]) => void;
  addStageDefinition: (definition: Omit<StageDefinition, 'id' | 'createTime' | 'updateTime'>) => void;
  updateStageDefinition: (id: string, data: Partial<StageDefinition>) => void;
  deleteStageDefinition: (id: string) => void;
  getStageByKey: (key: string) => StageDefinition | undefined;

  // 新增：任务模板相关操作
  addTaskTemplate: (stageId: string, template: Omit<StageTaskTemplate, 'id'>) => void;
  updateTaskTemplate: (stageId: string, taskId: string, data: Partial<StageTaskTemplate>) => void;
  deleteTaskTemplate: (stageId: string, taskId: string) => void;
  getTaskTemplates: (stageKey: string) => StageTaskTemplate[];
}

export const useStageStore = create<StageState>((set, get) => ({
  stageDefinitions: [],
  loading: false,

  setStageDefinitions: (definitions) => set({ stageDefinitions: definitions }),

  addStageDefinition: (definition) => {
    const newDefinition: StageDefinition = {
      ...definition,
      id: `stage-${Date.now()}`,
      createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      updateTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
    };
    set((state) => ({
      stageDefinitions: [...state.stageDefinitions, newDefinition],
    }));
  },

  updateStageDefinition: (id, data) => {
    set((state) => ({
      stageDefinitions: state.stageDefinitions.map((def) =>
        def.id === id
          ? { ...def, ...data, updateTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-') }
          : def
      ),
    }));
  },

  deleteStageDefinition: (id) => {
    set((state) => ({
      stageDefinitions: state.stageDefinitions.filter((def) => def.id !== id),
    }));
  },

  getStageByKey: (key) => {
    return get().stageDefinitions.find((def) => def.key === key);
  },

  // 添加任务模板到阶段
  addTaskTemplate: (stageId, template) => {
    set((state) => ({
      stageDefinitions: state.stageDefinitions.map((def) => {
        if (def.id === stageId) {
          const newTemplate: StageTaskTemplate = {
            ...template,
            id: `task-${Date.now()}`,
          };
          return {
            ...def,
            taskTemplates: [...(def.taskTemplates || []), newTemplate],
            updateTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
          };
        }
        return def;
      }),
    }));
  },

  // 更新任务模板
  updateTaskTemplate: (stageId, taskId, data) => {
    set((state) => ({
      stageDefinitions: state.stageDefinitions.map((def) => {
        if (def.id === stageId && def.taskTemplates) {
          return {
            ...def,
            taskTemplates: def.taskTemplates.map((template) =>
              template.id === taskId ? { ...template, ...data } : template
            ),
            updateTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
          };
        }
        return def;
      }),
    }));
  },

  // 删除任务模板
  deleteTaskTemplate: (stageId, taskId) => {
    set((state) => ({
      stageDefinitions: state.stageDefinitions.map((def) => {
        if (def.id === stageId && def.taskTemplates) {
          return {
            ...def,
            taskTemplates: def.taskTemplates.filter((template) => template.id !== taskId),
            updateTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
          };
        }
        return def;
      }),
    }));
  },

  // 获取阶段的任务模板
  getTaskTemplates: (stageKey) => {
    const stage = get().stageDefinitions.find((def) => def.key === stageKey);
    return stage?.taskTemplates || [];
  },
}));
