import { create } from 'zustand';
import { Project, ProjectPlan, ProjectTask, ProjectStats, PaginationParams } from '../types/project';
import { PaginationResponse } from '../types/common';

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
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,
  projectPlans: [],
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
}));
