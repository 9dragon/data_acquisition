import { create } from 'zustand';
import { User } from '../types/common';
import { mockUsers } from '../services/mockData';

interface UserState {
  currentUser: User | null;
  users: User[];
  setCurrentUser: (user: User | null) => void;
  updateUserProfile: (id: string, data: Partial<User>) => void;
  changePassword: (userId: string, oldPassword: string, newPassword: string) => boolean;
  getUserById: (id: string) => User | undefined;
}

export const useUserStore = create<UserState>((set, get) => ({
  currentUser: mockUsers[0], // 默认当前用户为张经理
  users: mockUsers,

  setCurrentUser: (user) => set({ currentUser: user }),

  updateUserProfile: (id, data) =>
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, ...data } : u)),
      currentUser: state.currentUser?.id === id
        ? { ...state.currentUser, ...data }
        : state.currentUser,
    })),

  changePassword: (userId, oldPassword, newPassword) => {
    // 简化版本，实际应验证旧密码
    if (oldPassword === newPassword) {
      return false;
    }
    return true;
  },

  getUserById: (id) => {
    return get().users.find((u) => u.id === id);
  },
}));
