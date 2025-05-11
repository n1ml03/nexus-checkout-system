import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { InfoIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  iconClassName?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

/**
 * A tooltip component specifically designed for explaining metrics
 */
const MetricTooltip: React.FC<MetricTooltipProps> = ({
  content,
  children,
  className,
  iconClassName,
  side = 'top',
  align = 'center'
}) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <div className={cn("inline-flex items-center gap-1", className)}>
          {children}
          <TooltipTrigger asChild>
            <InfoIcon className={cn("h-3.5 w-3.5 text-muted-foreground cursor-help", iconClassName)} />
          </TooltipTrigger>
        </div>
        <TooltipContent side={side} align={align} className="max-w-xs">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MetricTooltip;
