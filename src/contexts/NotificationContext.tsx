import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Notification, NotificationContextType } from '../types';
import { useAuth } from './AuthContext';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Загрузка уведомлений при инициализации или смене пользователя
  useEffect(() => {
    if (currentUser) {
      loadNotifications();
    } else {
      setNotifications([]);
    }
  }, [currentUser]);

  // Загрузка уведомлений пользователя
  const loadNotifications = () => {
    if (!currentUser) return;

    try {
      const storedNotifications = localStorage.getItem(`notifications_${currentUser.id}`);
      if (storedNotifications) {
        const parsedNotifications = JSON.parse(storedNotifications);
        setNotifications(parsedNotifications);
      }
    } catch (error) {
      console.error('Ошибка при загрузке уведомлений:', error);
    }
  };

  // Сохранение уведомлений
  const saveNotifications = (newNotifications: Notification[]) => {
    if (!currentUser) return;
    localStorage.setItem(`notifications_${currentUser.id}`, JSON.stringify(newNotifications));
    setNotifications(newNotifications);
  };

  // Добавление нового уведомления
  const addNotification = (notificationData: Omit<Notification, 'id'>) => {
    if (!currentUser) return;

    const newNotification: Notification = {
      id: uuidv4(),
      ...notificationData
    };

    const newNotifications = [...notifications, newNotification];
    saveNotifications(newNotifications);
  };

  // Отметка уведомления как прочитанного
  const markAsRead = (id: string) => {
    if (!currentUser) return;

    const updatedNotifications = notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    );

    saveNotifications(updatedNotifications);
  };

  // Удаление уведомления
  const deleteNotification = (id: string) => {
    if (!currentUser) return;

    const updatedNotifications = notifications.filter(notification => notification.id !== id);
    saveNotifications(updatedNotifications);
  };

  // Получение количества непрочитанных уведомлений
  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.read).length;
  };

  const value: NotificationContextType = {
    notifications,
    addNotification,
    markAsRead,
    deleteNotification,
    getUnreadCount,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};