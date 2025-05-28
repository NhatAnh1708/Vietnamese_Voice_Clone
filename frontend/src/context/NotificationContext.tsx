"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
  hasUnreadNotifications: boolean;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  addNotification: () => {},
  markAsRead: () => {},
  clearNotifications: () => {},
  hasUnreadNotifications: false
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { translations } = useLanguage();
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  
  // Check for unread notifications
  useEffect(() => {
    setHasUnreadNotifications(notifications.some(notification => !notification.read));
  }, [notifications]);

  // Add a new notification
  const addNotification = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      read: false,
      timestamp: new Date()
    };
    
    // Remove old notifications if there are more than 5
    setNotifications(prevNotifications => {
      const updatedNotifications = [newNotification, ...prevNotifications];
      if (updatedNotifications.length > 5) {
        return updatedNotifications.slice(0, 5);
      }
      return updatedNotifications;
    });

    // Auto-mark as read after 5 seconds
    setTimeout(() => {
      markAsRead(newNotification.id);
    }, 5000);
  };

  // Mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        clearNotifications,
        hasUnreadNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
} 