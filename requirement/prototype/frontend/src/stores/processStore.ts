import { create } from 'zustand';
import { Process } from '../types/process';

interface ProcessState {
  processes: Process[];
  currentProcess: Process | null;
  loading: boolean;

  // Actions
  setProcesses: (processes: Process[]) => void;
  setCurrentProcess: (process: Process | null) => void;
  getProcessesByProject: (projectId: string) => Process[];
  addProcess: (process: Process) => void;
  updateProcess: (id: string, data: Partial<Process>) => void;
  deleteProcess: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useProcessStore = create<ProcessState>((set, get) => ({
  processes: [],
  currentProcess: null,
  loading: false,

  setProcesses: (processes) => set({ processes }),
  setCurrentProcess: (process) => set({ currentProcess: process }),

  getProcessesByProject: (projectId: string) => {
    const state = get();
    return state.processes
      .filter(p => p.projectId === projectId)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  },

  addProcess: (process) => set((state) => ({
    processes: [...state.processes, process],
  })),

  updateProcess: (id, data) =>
    set((state) => ({
      processes: state.processes.map((p) =>
        p.id === id ? { ...p, ...data, updateTime: new Date().toISOString() } : p
      ),
      currentProcess: state.currentProcess?.id === id
        ? { ...state.currentProcess, ...data, updateTime: new Date().toISOString() }
        : state.currentProcess,
    })),

  deleteProcess: (id) =>
    set((state) => ({
      processes: state.processes.filter((p) => p.id !== id),
      currentProcess: state.currentProcess?.id === id ? null : state.currentProcess,
    })),

  setLoading: (loading) => set({ loading }),
}));
