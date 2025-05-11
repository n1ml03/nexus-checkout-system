import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ChartSkeletonProps {
  className?: string;
  type?: 'bar' | 'line' | 'area' | 'pie' | 'table';
  height?: number | string;
}

/**
 * A skeleton loader specifically designed for chart components
 */
const ChartSkeleton: React.FC<ChartSkeletonProps> = ({
  className,
  type = 'bar',
  height = 300
}) => {
  const renderBarSkeleton = () => (
    <div className="flex items-end justify-between h-full w-full gap-2 pt-8 pb-4 px-2">
      {Array.from({ length: 12 }).map((_, i) => {
        // Random height between 20% and 90%
        const h = Math.floor(Math.random() * 70) + 20;
        return (
          <Skeleton 
            key={i} 
            className={`w-full rounded-t-md`} 
            style={{ height: `${h}%` }} 
          />
        );
      })}
    </div>
  );

  const renderLineSkeleton = () => (
    <div className="relative h-full w-full pt-8 pb-4 px-2">
      <Skeleton className="absolute bottom-0 left-0 w-full h-[1px]" />
      <Skeleton className="absolute top-0 bottom-0 left-0 w-[1px] h-full" />
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <Skeleton 
          component="path" 
          d="M0,80 Q20,70 40,75 T80,60 T100,40" 
          className="stroke-muted-foreground/30 stroke-2 fill-none" 
        />
      </svg>
      <div className="absolute bottom-0 w-full flex justify-between px-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-8" />
        ))}
      </div>
    </div>
  );

  const renderPieSkeleton = () => (
    <div className="flex items-center justify-center h-full w-full">
      <div className="relative">
        <Skeleton className="h-40 w-40 rounded-full" />
        <Skeleton className="absolute top-1/2 left-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background" />
      </div>
      <div className="ml-4 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-20" />
        ))}
      </div>
    </div>
  );

  const renderTableSkeleton = () => (
    <div className="w-full space-y-2">
      <div className="flex gap-2 w-full">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 flex-1" />
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-2 w-full">
          {Array.from({ length: 4 }).map((_, j) => (
            <Skeleton key={j} className="h-6 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'bar':
        return renderBarSkeleton();
      case 'line':
      case 'area':
        return renderLineSkeleton();
      case 'pie':
        return renderPieSkeleton();
      case 'table':
        return renderTableSkeleton();
      default:
        return renderBarSkeleton();
    }
  };

  return (
    <div 
      className={cn("w-full overflow-hidden", className)} 
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      {renderSkeleton()}
    </div>
  );
};

// Allow using Skeleton as a component prop
Skeleton.component = ({ d, ...props }: React.SVGProps<SVGPathElement>) => (
  <path {...props} d={d} />
);

export default ChartSkeleton;
