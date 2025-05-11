import React from 'react';
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

/**
 * A reusable loading state component
 */
const LoadingState: React.FC<LoadingStateProps> = ({
  message,
  className = "",
  size = 'md',
  fullPage = false
}) => {
  const { t } = useTranslation();
  const sizeClasses = {
    sm: {
      container: "gap-2",
      icon: "h-4 w-4",
      text: "text-sm"
    },
    md: {
      container: "gap-3",
      icon: "h-8 w-8",
      text: "text-base"
    },
    lg: {
      container: "gap-4",
      icon: "h-12 w-12",
      text: "text-lg"
    }
  };

  const containerClasses = cn(
    "flex flex-col items-center justify-center text-center",
    sizeClasses[size].container,
    fullPage ? "h-[70vh]" : "",
    className
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={containerClasses}
    >
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size].icon)} />
      <p className={cn("text-muted-foreground", sizeClasses[size].text)}>
        {message || t("ui.loading")}
      </p>
    </motion.div>
  );
};

export default LoadingState;
