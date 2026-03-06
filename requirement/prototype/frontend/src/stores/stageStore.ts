import { create } from 'zustand';
import { StageDefinition } from '../types/project';

interface StageState {
  stageDefinitions: StageDefinition[];
  loading: boolean;

  // Actions
  setStageDefinitions: (definitions: StageDefinition[]) => void;
  addStageDefinition: (definition: Omit<StageDefinition, 'id' | 'createTime' | 'updateTime'>) => void;
  updateStageDefinition: (id: string, data: Partial<StageDefinition>) => void;
  deleteStageDefinition: (id: string) => void;
  getStageByKey: (key: string) => StageDefinition | undefined;
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
}));
