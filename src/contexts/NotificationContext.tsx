import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

// Define notification types
export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationCategory = 'order' | 'product' | 'system' | 'promotion' | 'payment' | 'account' | 'general';

export interface NotificationAction {
  label: string;
  action: 'link' | 'function';
  url?: string;
  functionName?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  read: boolean;
  timestamp: Date;
  link?: string;
  icon?: string;
  image?: string;
  actions?: NotificationAction[];
  autoDelete?: boolean;
  expiresAt?: Date;
  groupId?: string;
}

// Sound effects for notifications
const NOTIFICATION_SOUNDS = {
  default: new Audio('/sounds/notification.mp3'),
  success: new Audio('/sounds/success.mp3'),
  warning: new Audio('/sounds/warning.mp3'),
  error: new Audio('/sounds/error.mp3'),
  urgent: new Audio('/sounds/urgent.mp3')
};

// Notification preferences interface
interface NotificationPreferences {
  enableSound: boolean;
  enableDesktopNotifications: boolean;
  mutedUntil: Date | null;
  categories: {
    [key in NotificationCategory]: boolean;
  };
  priorities: {
    [key in NotificationPriority]: boolean;
  };
}

// Default notification preferences
const DEFAULT_PREFERENCES: NotificationPreferences = {
  enableSound: true,
  enableDesktopNotifications: true,
  mutedUntil: null,
  categories: {
    order: true,
    product: true,
    system: true,
    promotion: true,
    payment: true,
    account: true,
    general: true
  },
  priorities: {
    low: true,
    medium: true,
    high: true,
    urgent: true
  }
};

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  addNotification: (
    title: string,
    message: string,
    options?: {
      type?: NotificationType;
      category?: NotificationCategory;
      priority?: NotificationPriority;
      link?: string;
      icon?: string;
      image?: string;
      actions?: NotificationAction[];
      autoDelete?: boolean;
      expiresAt?: Date;
      groupId?: string;
    }
  ) => string;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
  getNotificationsByCategory: (category: NotificationCategory) => AppNotification[];
  getUnreadCountByCategory: (category: NotificationCategory) => number;
  muteNotifications: (minutes: number) => void;
  unmuteNotifications: () => void;
  isMuted: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);

  // Load notifications and preferences from localStorage on mount
  useEffect(() => {
    const loadLocalData = () => {
      // Load preferences from localStorage
      const savedPreferences = localStorage.getItem('notificationPreferences');
      if (savedPreferences) {
        try {
          const parsedPreferences = JSON.parse(savedPreferences);
          setPreferences({
            ...parsedPreferences,
            mutedUntil: parsedPreferences.mutedUntil ? new Date(parsedPreferences.mutedUntil) : null
          });
        } catch (error) {
          console.error('Failed to parse saved notification preferences:', error);
        }
      }

      // Load notifications from localStorage
      const savedNotifications = localStorage.getItem('notifications');
      if (savedNotifications) {
        try {
          const parsedNotifications = JSON.parse(savedNotifications);
          // Convert string timestamps back to Date objects
          const formattedNotifications = parsedNotifications.map((notification: any) => ({
            ...notification,
            timestamp: new Date(notification.timestamp),
            expiresAt: notification.expiresAt ? new Date(notification.expiresAt) : undefined
          }));
          setNotifications(formattedNotifications);
        } catch (error) {
          console.error('Failed to parse saved notifications:', error);
        }
      }
    };

    loadLocalData();
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
  }, [preferences]);

  // Clean up expired notifications
  useEffect(() => {
    const now = new Date();
    setNotifications(prev =>
      prev.filter(notification =>
        !notification.expiresAt || new Date(notification.expiresAt) > now
      )
    );

    // Set up interval to check for expired notifications
    const interval = setInterval(() => {
      const now = new Date();
      setNotifications(prev =>
        prev.filter(notification =>
          !notification.expiresAt || new Date(notification.expiresAt) > now
        )
      );
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Check if notifications are currently muted
  const isMuted = useMemo(() => {
    if (!preferences.mutedUntil) return false;
    return new Date() < new Date(preferences.mutedUntil);
  }, [preferences.mutedUntil]);

  // Calculate unread count
  const unreadCount = useMemo(() => {
    return notifications.filter(notification => !notification.read).length;
  }, [notifications]);

  // Group notifications by category
  const getNotificationsByCategory = useCallback((category: NotificationCategory): AppNotification[] => {
    return notifications.filter(notification => notification.category === category);
  }, [notifications]);

  // Get unread count by category
  const getUnreadCountByCategory = useCallback((category: NotificationCategory) => {
    return notifications.filter(notification =>
      notification.category === category && !notification.read
    ).length;
  }, [notifications]);

  // Play notification sound based on type and priority
  const playNotificationSound = useCallback((type: NotificationType, priority: NotificationPriority) => {
    if (!preferences.enableSound || isMuted) return;

    if (priority === 'urgent') {
      NOTIFICATION_SOUNDS.urgent.play().catch(() => {});
    } else if (type === 'success') {
      NOTIFICATION_SOUNDS.success.play().catch(() => {});
    } else if (type === 'warning') {
      NOTIFICATION_SOUNDS.warning.play().catch(() => {});
    } else if (type === 'error') {
      NOTIFICATION_SOUNDS.error.play().catch(() => {});
    } else {
      NOTIFICATION_SOUNDS.default.play().catch(() => {});
    }
  }, [preferences.enableSound, isMuted]);

  // Show desktop notification
  const showDesktopNotification = useCallback((title: string, message: string) => {
    if (!preferences.enableDesktopNotifications || isMuted) return;

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: message });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body: message });
        }
      });
    }
  }, [preferences.enableDesktopNotifications, isMuted]);

  // Show toast notification
  const showToastNotification = useCallback((notification: AppNotification) => {
    const { title, message, type, actions } = notification;

    if (actions && actions.length > 0) {
      toast[type](title, {
        description: message,
        duration: 8000,
        action: {
          label: actions[0].label,
          onClick: () => {
            if (actions[0].action === 'link' && actions[0].url) {
              window.open(actions[0].url, '_blank');
            } else if (actions[0].action === 'function' && actions[0].functionName) {
              // Handle function calls if needed
              console.log('Function call:', actions[0].functionName);
            }
          }
        }
      });
    } else {
      toast[type](title, {
        description: message,
        duration: 5000,
      });
    }
  }, []);

  // Add a new notification
  const addNotification = useCallback((
    title: string,
    message: string,
    options?: {
      type?: NotificationType;
      category?: NotificationCategory;
      priority?: NotificationPriority;
      link?: string;
      icon?: string;
      image?: string;
      actions?: NotificationAction[];
      autoDelete?: boolean;
      expiresAt?: Date;
      groupId?: string;
    }
  ) => {
    const type = options?.type || 'info';
    const category = options?.category || 'general';
    const priority = options?.priority || 'medium';

    // Check if notifications for this category are enabled
    if (!preferences.categories[category]) return '';

    // Check if notifications for this priority are enabled
    if (!preferences.priorities[priority]) return '';

    const newNotification: AppNotification = {
      id: uuidv4(),
      title,
      message,
      type,
      category,
      priority,
      read: false,
      timestamp: new Date(),
      link: options?.link,
      icon: options?.icon,
      image: options?.image,
      actions: options?.actions,
      autoDelete: options?.autoDelete,
      expiresAt: options?.expiresAt,
      groupId: options?.groupId
    };

    // Add to local state
    setNotifications(prev => [newNotification, ...prev]);

    // Play sound notification
    playNotificationSound(type, priority);

    // Show desktop notification
    showDesktopNotification(title, message);

    // Show toast notification
    showToastNotification(newNotification);

    return newNotification.id;
  }, [preferences, playNotificationSound, showDesktopNotification, showToastNotification]);

  // Mark a notification as read
  const markAsRead = useCallback((id: string) => {
    // Update local state
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    // Update local state
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  // Clear a notification
  const clearNotification = useCallback((id: string) => {
    // Update local state
    setNotifications(prev =>
      prev.filter(notification => notification.id !== id)
    );
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    // Update local state
    setNotifications([]);
  }, []);

  // Update notification preferences
  const updatePreferences = useCallback((newPreferences: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({
      ...prev,
      ...newPreferences
    }));
  }, []);

  // Mute notifications for a specified time
  const muteNotifications = useCallback((minutes: number) => {
    const mutedUntil = new Date();
    mutedUntil.setMinutes(mutedUntil.getMinutes() + minutes);
    
    setPreferences(prev => ({
      ...prev,
      mutedUntil
    }));
  }, []);

  // Unmute notifications
  const unmuteNotifications = useCallback(() => {
    setPreferences(prev => ({
      ...prev,
      mutedUntil: null
    }));
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    notifications,
    unreadCount,
    preferences,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    updatePreferences,
    getNotificationsByCategory,
    getUnreadCountByCategory,
    muteNotifications,
    unmuteNotifications,
    isMuted
  }), [
    notifications,
    unreadCount,
    preferences,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    updatePreferences,
    getNotificationsByCategory,
    getUnreadCountByCategory,
    muteNotifications,
    unmuteNotifications,
    isMuted
  ]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};
