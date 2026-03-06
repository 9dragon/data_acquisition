import { create } from 'zustand';
import { Notification } from '../types/common';

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createTime'>) => void;
  updateNotification: (id: string, data: Partial<Notification>) => void;
  deleteNotification: (id: string) => void;
  getUnreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [
    {
      id: '1',
      title: '关于系统维护的通知',
      content: '系统将于本周六晚上22:00进行维护，预计2小时',
      type: 'info',
      read: false,
      createTime: '2024-02-04 10:00',
    },
    {
      id: '2',
      title: '数采项目进度汇报会议',
      content: '请各项目负责人准备进度汇报材料',
      type: 'warning',
      read: false,
      createTime: '2024-02-03 14:00',
    },
  ],

  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          ...notification,
          id: `notif-${Date.now()}`,
          createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
        },
      ],
    })),

  updateNotification: (id, data) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, ...data } : n
      ),
    })),

  deleteNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  getUnreadCount: () => {
    return get().notifications.filter((n) => !n.read).length;
  },
}));
