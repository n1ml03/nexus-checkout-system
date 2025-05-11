import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  BellOff,
  Check,
  Clock,
  Settings,
  X,
  ShoppingBag,
  Package,
  CreditCard,
  AlertTriangle,
  Info,
  CheckCircle,
  AlertCircle,
  User,
  Gift,
  Megaphone
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { vi, enUS, Locale } from 'date-fns/locale';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, AnimatedTabsContent } from '@/components/ui/tabs-with-animation';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNotifications } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';
import { AppNotification, NotificationCategory, NotificationPriority } from '@/types/index';
import { toast } from 'sonner';

const NotificationBell: React.FC = () => {
  const { t, i18n } = useTranslation();
  const {
    notifications,
    unreadCount,
    preferences,
    isLoading,
    hasMore,
    totalCount,
    isWebSocketConnected,
    markAsRead,
    markAllAsRead,
    markCategoryAsRead,
    clearNotification,
    clearAllNotifications,
    clearCategoryNotifications,
    updatePreferences,
    getNotificationsByCategory,
    getUnreadCountByCategory,
    muteNotifications,
    unmuteNotifications,
    loadMoreNotifications,
    isMuted
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NotificationCategory | 'all'>('all');
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const prevUnreadCount = useRef(unreadCount);
  const bellRef = useRef<HTMLButtonElement>(null);

  // Detect new notifications and trigger animation
  useEffect(() => {
    if (unreadCount > prevUnreadCount.current) {
      setHasNewNotification(true);

      // Reset animation after it completes
      const timer = setTimeout(() => {
        setHasNewNotification(false);
      }, 1000);

      return () => clearTimeout(timer);
    }

    prevUnreadCount.current = unreadCount;
  }, [unreadCount]);

  // Get the current locale for date formatting
  const getLocale = () => {
    return i18n.language === 'vi' ? vi : enUS;
  };

  // Handle notification click
  const handleNotificationClick = (id: string, link?: string) => {
    markAsRead(id);

    // If there's a link, let the Link component handle navigation
    if (!link) {
      // Close dropdown if no link
      setOpen(false);
    }
  };

  // Handle notification delete
  const handleNotificationDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    clearNotification(id);
  };

  // Get filtered notifications based on active tab
  const getFilteredNotifications = () => {
    if (activeTab === 'all') {
      return notifications;
    }
    return notifications.filter(notification => notification.category === activeTab);
  };

  // Get unread count for a specific tab
  const getTabUnreadCount = (tab: NotificationCategory | 'all') => {
    if (tab === 'all') {
      return unreadCount;
    }
    return getUnreadCountByCategory(tab as NotificationCategory);
  };

  // Handle mute notifications
  const handleMuteNotifications = (minutes: number) => {
    muteNotifications(minutes);
    toast.success(
      t('ui.notifications_muted', { minutes }),
      { description: t('ui.notifications_muted_desc') }
    );
  };

  // Group notifications by date
  const groupNotificationsByDate = (notifications: AppNotification[]) => {
    const groups: { [key: string]: AppNotification[] } = {};

    notifications.forEach(notification => {
      const date = new Date(notification.timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let groupKey: string;

      if (date.toDateString() === today.toDateString()) {
        groupKey = t('ui.today');
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = t('ui.yesterday');
      } else {
        groupKey = format(date, 'MMMM d, yyyy', { locale: getLocale() });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }

      groups[groupKey].push(notification);
    });

    return groups;
  };

  // Get notification icon based on category and type
  const getNotificationIcon = (notification: AppNotification) => {
    // First check if notification has a custom icon
    if (notification.icon) {
      return notification.icon;
    }

    // Otherwise determine icon based on category and type
    const { category, type } = notification;

    switch (category) {
      case 'order':
        return <ShoppingBag className="h-5 w-5 text-blue-500" />;
      case 'product':
        return <Package className="h-5 w-5 text-indigo-500" />;
      case 'payment':
        return <CreditCard className="h-5 w-5 text-green-500" />;
      case 'account':
        return <User className="h-5 w-5 text-purple-500" />;
      case 'promotion':
        return <Gift className="h-5 w-5 text-pink-500" />;
      case 'system':
        return <Settings className="h-5 w-5 text-gray-500" />;
      default:
        // For general category, use type-based icons
        switch (type) {
          case 'success':
            return <CheckCircle className="h-5 w-5 text-green-500" />;
          case 'error':
            return <AlertCircle className="h-5 w-5 text-red-500" />;
          case 'warning':
            return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
          case 'info':
          default:
            return <Info className="h-5 w-5 text-blue-500" />;
        }
    }
  };

  // Get priority badge color
  const getPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'high':
        return <Badge variant="destructive" className="bg-orange-500">High</Badge>;
      case 'medium':
        return <Badge variant="outline">Medium</Badge>;
      case 'low':
      default:
        return null;
    }
  };

  // Get category label
  const getCategoryLabel = (category: NotificationCategory) => {
    switch (category) {
      case 'order':
        return t('ui.category_order');
      case 'product':
        return t('ui.category_product');
      case 'payment':
        return t('ui.category_payment');
      case 'account':
        return t('ui.category_account');
      case 'promotion':
        return t('ui.category_promotion');
      case 'system':
        return t('ui.category_system');
      case 'general':
      default:
        return t('ui.category_general');
    }
  };

  // Get category icon
  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'order':
        return <ShoppingBag className="h-4 w-4" />;
      case 'product':
        return <Package className="h-4 w-4" />;
      case 'payment':
        return <CreditCard className="h-4 w-4" />;
      case 'account':
        return <User className="h-4 w-4" />;
      case 'promotion':
        return <Gift className="h-4 w-4" />;
      case 'system':
        return <Settings className="h-4 w-4" />;
      case 'general':
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  // Animation variants for the bell
  const bellAnimationVariants = {
    ring: {
      rotate: [0, 15, -15, 10, -10, 5, -5, 0],
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      }
    },
    normal: {
      rotate: 0
    }
  };

  // Filtered notifications based on active tab
  const filteredNotifications = getFilteredNotifications();
  const groupedNotifications = groupNotificationsByDate(filteredNotifications);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                ref={bellRef}
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 sm:h-10 sm:w-10"
              >
                <motion.div
                  animate={hasNewNotification ? "ring" : "normal"}
                  variants={bellAnimationVariants}
                >
                  {isMuted ? (
                    <BellOff className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  ) : (
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </motion.div>
                <AnimatePresence>
                  {unreadCount > 0 && !isMuted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1"
                    >
                      <Badge
                        variant="destructive"
                        className="h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 text-[10px] sm:text-xs font-semibold"
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {isMuted ? t('ui.notifications_muted_tooltip') : t('ui.notifications')}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent align="end" className="w-[95vw] sm:w-96 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium text-lg">{t('ui.notifications')}</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs h-8"
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                {t('ui.mark_all_read')}
              </Button>
            )}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Settings className="h-4 w-4 mr-1" />
                <span className="sr-only">{t('ui.notification_settings')}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-56">
                  <DropdownMenuLabel>{t('ui.notification_settings')}</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <div className="p-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">{t('ui.enable_sound')}</span>
                      <Switch
                        checked={preferences.enableSound}
                        onCheckedChange={(checked) =>
                          updatePreferences({ enableSound: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm">{t('ui.enable_desktop')}</span>
                      <Switch
                        checked={preferences.enableDesktopNotifications}
                        onCheckedChange={(checked) =>
                          updatePreferences({ enableDesktopNotifications: checked })
                        }
                      />
                    </div>
                  </div>

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>{t('ui.mute_notifications')}</DropdownMenuLabel>

                  <DropdownMenuItem onClick={() => handleMuteNotifications(30)}>
                    <Clock className="h-4 w-4 mr-2" />
                    {t('ui.mute_for_30min')}
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => handleMuteNotifications(60)}>
                    <Clock className="h-4 w-4 mr-2" />
                    {t('ui.mute_for_1hour')}
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => handleMuteNotifications(480)}>
                    <Clock className="h-4 w-4 mr-2" />
                    {t('ui.mute_for_8hours')}
                  </DropdownMenuItem>

                  {isMuted && (
                    <DropdownMenuItem onClick={unmuteNotifications}>
                      <Bell className="h-4 w-4 mr-2" />
                      {t('ui.unmute')}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setActiveTab(value as any)}>
          <div className="px-4 pt-2">
            <TabsList className="w-full grid grid-cols-4 h-10 sm:h-auto">
              <TabsTrigger value="all" className="relative text-xs sm:text-sm px-1 sm:px-2">
                {t('ui.all')}
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 sm:h-5 px-1 text-[10px] sm:text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="order" className="relative text-xs sm:text-sm px-1 sm:px-2">
                {getCategoryIcon('order')}
                <span className="sr-only">{getCategoryLabel('order')}</span>
                {getTabUnreadCount('order') > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 sm:h-5 px-1 text-[10px] sm:text-xs">
                    {getTabUnreadCount('order')}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="payment" className="relative text-xs sm:text-sm px-1 sm:px-2">
                {getCategoryIcon('payment')}
                <span className="sr-only">{getCategoryLabel('payment')}</span>
                {getTabUnreadCount('payment') > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 sm:h-5 px-1 text-[10px] sm:text-xs">
                    {getTabUnreadCount('payment')}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="system" className="relative text-xs sm:text-sm px-1 sm:px-2">
                {getCategoryIcon('system')}
                <span className="sr-only">{getCategoryLabel('system')}</span>
                {getTabUnreadCount('system') > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 sm:h-5 px-1 text-[10px] sm:text-xs">
                    {getTabUnreadCount('system')}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <AnimatedTabsContent value={activeTab} className="mt-0 overflow-hidden">
            <ScrollArea
              className="h-[400px]"
              onScrollCapture={(e) => {
                // Check if scrolled to bottom to load more
                const target = e.currentTarget;
                const scrollContainer = target.querySelector('[data-radix-scroll-area-viewport]');
                if (scrollContainer) {
                  const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
                  // If scrolled to bottom (with a small threshold) and has more items to load
                  if (scrollHeight - scrollTop - clientHeight < 50 && hasMore && !isLoading) {
                    loadMoreNotifications();
                  }
                }
              }}
            >
              {filteredNotifications.length > 0 ? (
                <div>
                  {/* WebSocket connection indicator */}
                  {isWebSocketConnected && (
                    <div className="px-4 py-1 flex items-center justify-end">
                      <div className="flex items-center text-xs text-green-500">
                        <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                        {t('ui.realtime_connected')}
                      </div>
                    </div>
                  )}

                  {/* Notification groups by date */}
                  {Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
                    <div key={date} className="mb-2">
                      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 px-4 py-2 text-xs font-medium text-muted-foreground">
                        {date}
                      </div>

                      {dateNotifications.map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className={cn(
                            "flex flex-col items-start p-4 cursor-pointer border-b border-border/50 last:border-0",
                            !notification.read && "bg-muted/30"
                          )}
                          onSelect={(e) => e.preventDefault()}
                        >
                          {notification.link ? (
                            <Link
                              to={notification.link}
                              className="w-full"
                              onClick={() => handleNotificationClick(notification.id, notification.link)}
                            >
                              <NotificationItem
                                notification={notification}
                                icon={getNotificationIcon(notification)}
                                priorityBadge={getPriorityBadge(notification.priority)}
                                categoryLabel={getCategoryLabel(notification.category)}
                                onDelete={(e) => handleNotificationDelete(e, notification.id)}
                                locale={getLocale()}
                              />
                            </Link>
                          ) : (
                            <div
                              className="w-full"
                              onClick={() => handleNotificationClick(notification.id)}
                            >
                              <NotificationItem
                                notification={notification}
                                icon={getNotificationIcon(notification)}
                                priorityBadge={getPriorityBadge(notification.priority)}
                                categoryLabel={getCategoryLabel(notification.category)}
                                onDelete={(e) => handleNotificationDelete(e, notification.id)}
                                locale={getLocale()}
                              />
                            </div>
                          )}
                        </DropdownMenuItem>
                      ))}
                    </div>
                  ))}

                  {/* Loading indicator for pagination */}
                  {isLoading && (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  )}

                  {/* End of list indicator */}
                  {!hasMore && filteredNotifications.length > 0 && (
                    <div className="text-center py-4 text-xs text-muted-foreground">
                      {t('ui.end_of_notifications')}
                    </div>
                  )}

                  {/* Total count indicator */}
                  {totalCount > 0 && (
                    <div className="text-center py-2 text-xs text-muted-foreground">
                      {t('ui.total_notifications', { count: totalCount })}
                    </div>
                  )}
                </div>
              ) : isLoading ? (
                <div className="flex flex-col items-center justify-center h-[300px] p-4">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mb-4"></div>
                  <p className="text-sm text-muted-foreground">{t('ui.loading_notifications')}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] p-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Bell className="h-8 w-8 text-muted-foreground opacity-50" />
                  </div>
                  <h3 className="font-medium mb-1">{t('ui.no_notifications')}</h3>
                  <p className="text-sm text-muted-foreground max-w-[250px]">
                    {t('ui.no_notifications_desc')}
                  </p>
                </div>
              )}
            </ScrollArea>
          </AnimatedTabsContent>
        </Tabs>

        {filteredNotifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => activeTab === 'all' ? clearAllNotifications() : clearCategoryNotifications(activeTab as NotificationCategory)}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                {activeTab === 'all' ? t('ui.clear_all') : t('ui.clear_category', { category: getCategoryLabel(activeTab as NotificationCategory) })}
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Notification item component
interface NotificationItemProps {
  notification: AppNotification;
  icon: React.ReactNode;
  priorityBadge: React.ReactNode;
  categoryLabel: string;
  onDelete: (e: React.MouseEvent) => void;
  locale: Locale;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  icon,
  priorityBadge,
  categoryLabel,
  onDelete,
  locale
}) => {
  const { t } = useTranslation();

  // Format the time as relative (e.g., "2 hours ago") or absolute if older than 1 day
  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const dayInMs = 24 * 60 * 60 * 1000;

    if (diff < dayInMs) {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale
      });
    } else {
      return format(new Date(timestamp), 'MMM d, h:mm a', { locale });
    }
  };

  return (
    <div className="flex w-full gap-3">
      <div className="flex-shrink-0 mt-1">
        {icon}
      </div>
      <div className="flex flex-col gap-1 flex-grow">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm">{notification.title}</h4>
              {priorityBadge}
            </div>
            <span className="text-xs text-muted-foreground">
              {categoryLabel}
            </span>
          </div>
          <button
            onClick={onDelete}
            className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            <span className="sr-only">{t('ui.delete_notification')}</span>
          </button>
        </div>

        <p className="text-sm text-foreground/90 mt-1">{notification.message}</p>

        {notification.image && (
          <div className="mt-2 rounded-md overflow-hidden">
            <img
              src={notification.image}
              alt={notification.title}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {notification.actions && notification.actions.length > 0 && (
          <div className="flex gap-2 mt-2">
            {notification.actions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                asChild={action.action === 'link'}
                onClick={(e) => {
                  if (action.action === 'dismiss') {
                    e.stopPropagation();
                    e.preventDefault();
                    onDelete(e);
                  }
                }}
              >
                {action.action === 'link' && action.url ? (
                  <Link to={action.url}>{action.label}</Link>
                ) : (
                  <span>{action.label}</span>
                )}
              </Button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            {formatTime(notification.timestamp)}
          </span>

          {!notification.read && (
            <span className="inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationBell;
