import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'card' | 'minimal';
}

/**
 * A reusable empty state component with illustration
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
  size = 'md',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: {
      container: "py-4 gap-2",
      icon: "h-10 w-10",
      title: "text-base font-medium",
      description: "text-xs"
    },
    md: {
      container: "py-8 gap-4",
      icon: "h-16 w-16",
      title: "text-xl font-semibold",
      description: "text-sm"
    },
    lg: {
      container: "py-12 gap-6",
      icon: "h-24 w-24",
      title: "text-2xl font-bold",
      description: "text-base"
    }
  };

  const variantClasses = {
    default: "bg-background",
    card: "bg-card rounded-lg border shadow-sm p-6",
    minimal: ""
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        sizeClasses[size].container,
        variantClasses[variant],
        className
      )}
    >
      <div className="rounded-full bg-muted flex items-center justify-center">
        <Icon className={cn("text-muted-foreground", sizeClasses[size].icon)} />
      </div>
      <div className="space-y-1">
        <h3 className={sizeClasses[size].title}>{title}</h3>
        {description && (
          <p className={cn("text-muted-foreground", sizeClasses[size].description)}>
            {description}
          </p>
        )}
      </div>
      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          size={size === 'sm' ? 'sm' : 'default'}
          className="mt-2"
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
};

export default EmptyState;
