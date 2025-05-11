-- Notifications schema for Nexus Checkout System

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  category TEXT NOT NULL CHECK (category IN ('order', 'product', 'system', 'promotion', 'payment', 'account', 'general')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  link TEXT,
  icon TEXT,
  image TEXT,
  actions JSONB,
  auto_delete BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  group_id TEXT,
  metadata JSONB
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_notifications_group_id ON notifications(group_id);

-- Create a composite index for common queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created ON notifications(user_id, read, created_at DESC);

-- Create a function to clean up expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS VOID AS $$
BEGIN
  DELETE FROM notifications
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
  
  -- Also delete auto-delete notifications that have been read
  DELETE FROM notifications
  WHERE auto_delete = true AND read = true;
END;
$$ LANGUAGE plpgsql;

-- Create a function to add a notification
CREATE OR REPLACE FUNCTION add_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_category TEXT DEFAULT 'general',
  p_priority TEXT DEFAULT 'medium',
  p_link TEXT DEFAULT NULL,
  p_icon TEXT DEFAULT NULL,
  p_image TEXT DEFAULT NULL,
  p_actions JSONB DEFAULT NULL,
  p_auto_delete BOOLEAN DEFAULT false,
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_group_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  -- Generate a new UUID
  notification_id := gen_random_uuid();
  
  -- Insert the notification
  INSERT INTO notifications (
    id, user_id, title, message, type, category, priority,
    link, icon, image, actions, auto_delete, expires_at, group_id, metadata
  ) VALUES (
    notification_id, p_user_id, p_title, p_message, p_type, p_category, p_priority,
    p_link, p_icon, p_image, p_actions, p_auto_delete, p_expires_at, p_group_id, p_metadata
  );
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Create a function to mark a notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(
  p_user_id UUID,
  p_notification_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  rows_affected INTEGER;
BEGIN
  UPDATE notifications
  SET read = true
  WHERE id = p_notification_id AND user_id = p_user_id;
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  
  RETURN rows_affected > 0;
END;
$$ LANGUAGE plpgsql;

-- Create a function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read(
  p_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET read = true
  WHERE user_id = p_user_id AND read = false;
END;
$$ LANGUAGE plpgsql;

-- Create a function to delete a notification
CREATE OR REPLACE FUNCTION delete_notification(
  p_user_id UUID,
  p_notification_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  rows_affected INTEGER;
BEGIN
  DELETE FROM notifications
  WHERE id = p_notification_id AND user_id = p_user_id;
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  
  RETURN rows_affected > 0;
END;
$$ LANGUAGE plpgsql;

-- Create a function to delete all notifications for a user
CREATE OR REPLACE FUNCTION delete_all_notifications(
  p_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  DELETE FROM notifications
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(
  p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO unread_count
  FROM notifications
  WHERE user_id = p_user_id AND read = false;
  
  RETURN unread_count;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to notify clients when a new notification is added
CREATE OR REPLACE FUNCTION notify_new_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify the channel with the user ID and notification ID
  PERFORM pg_notify(
    'new_notification',
    json_build_object(
      'user_id', NEW.user_id,
      'notification_id', NEW.id
    )::text
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS notify_new_notification_trigger ON notifications;
CREATE TRIGGER notify_new_notification_trigger
AFTER INSERT ON notifications
FOR EACH ROW
EXECUTE FUNCTION notify_new_notification();

-- Create a scheduled job to clean up expired notifications
-- This would typically be done with a cron job or pg_cron extension
-- For now, we'll just create the function that can be called manually
CREATE OR REPLACE FUNCTION schedule_notification_cleanup()
RETURNS VOID AS $$
BEGIN
  -- Call the cleanup function
  PERFORM cleanup_expired_notifications();
END;
$$ LANGUAGE plpgsql;
