import { create } from 'zustand';
import { Workshop } from '../types/workshop';

interface WorkshopState {
  workshops: Workshop[];
  currentWorkshop: Workshop | null;
  loading: boolean;

  setWorkshops: (workshops: Workshop[]) => void;
  setCurrentWorkshop: (workshop: Workshop | null) => void;
  getWorkshopsByProject: (projectId: string) => Workshop[];
  addWorkshop: (workshop: Workshop) => void;
  updateWorkshop: (id: string, data: Partial<Workshop>) => void;
  deleteWorkshop: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useWorkshopStore = create<WorkshopState>((set, get) => ({
  workshops: [],
  currentWorkshop: null,
  loading: false,

  setWorkshops: (workshops) => set({ workshops }),
  setCurrentWorkshop: (workshop) => set({ currentWorkshop: workshop }),

  getWorkshopsByProject: (projectId: string) => {
    const state = get();
    return state.workshops.filter(w => w.projectId === projectId);
  },

  addWorkshop: (workshop) => set((state) => ({
    workshops: [...state.workshops, workshop],
  })),

  updateWorkshop: (id, data) =>
    set((state) => ({
      workshops: state.workshops.map((w) =>
        w.id === id ? { ...w, ...data, updateTime: new Date().toISOString() } : w
      ),
      currentWorkshop: state.currentWorkshop?.id === id
        ? { ...state.currentWorkshop, ...data, updateTime: new Date().toISOString() }
        : state.currentWorkshop,
    })),

  deleteWorkshop: (id) =>
    set((state) => ({
      workshops: state.workshops.filter((w) => w.id !== id),
      currentWorkshop: state.currentWorkshop?.id === id ? null : state.currentWorkshop,
    })),

  setLoading: (loading) => set({ loading }),
}));
