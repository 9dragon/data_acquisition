import { create } from 'zustand';
import { Issue, IssueComment, IssueStatusHistory, IssueStats } from '../types/issue';

interface IssueState {
  issues: Issue[];
  currentIssue: Issue | null;
  comments: IssueComment[];
  statusHistory: IssueStatusHistory[];
  stats: IssueStats | null;
  loading: boolean;

  // Actions
  setIssues: (issues: Issue[]) => void;
  setCurrentIssue: (issue: Issue | null) => void;
  addIssue: (issue: Issue) => void;
  updateIssue: (id: string, data: Partial<Issue>) => void;
  deleteIssue: (id: string) => void;
  setComments: (comments: IssueComment[]) => void;
  addComment: (comment: IssueComment) => void;
  setStatusHistory: (history: IssueStatusHistory[]) => void;
  setStats: (stats: IssueStats) => void;
  setLoading: (loading: boolean) => void;
}

export const useIssueStore = create<IssueState>((set) => ({
  issues: [],
  currentIssue: null,
  comments: [],
  statusHistory: [],
  stats: null,
  loading: false,

  setIssues: (issues) => set({ issues }),
  setCurrentIssue: (issue) => set({ currentIssue: issue }),
  addIssue: (issue) => set((state) => ({ issues: [...state.issues, issue] })),
  updateIssue: (id, data) =>
    set((state) => ({
      issues: state.issues.map((i) => (i.id === id ? { ...i, ...data } : i)),
      currentIssue: state.currentIssue?.id === id ? { ...state.currentIssue, ...data } : state.currentIssue,
    })),
  deleteIssue: (id) =>
    set((state) => ({
      issues: state.issues.filter((i) => i.id !== id),
      currentIssue: state.currentIssue?.id === id ? null : state.currentIssue,
    })),
  setComments: (comments) => set({ comments }),
  addComment: (comment) => set((state) => ({ comments: [...state.comments, comment] })),
  setStatusHistory: (history) => set({ statusHistory: history }),
  setStats: (stats) => set({ stats }),
  setLoading: (loading) => set({ loading }),
}));
