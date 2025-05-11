/**
 * Data Card Component
 * 
 * A versatile card component for displaying data with various layouts.
 * Extends the base Card component with additional features.
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Define variants using Class Variance Authority (CVA)
 */
const dataCardVariants = cva("", {
  variants: {
    // Define different visual styles
    variant: {
      default: "",
      bordered: "border-2",
      elevated: "shadow-lg",
      flat: "shadow-none border-0",
    },
    // Define different color schemes
    colorScheme: {
      default: "",
      primary: "border-primary",
      secondary: "border-secondary",
      success: "border-green-500 dark:border-green-600",
      warning: "border-yellow-500 dark:border-yellow-600",
      danger: "border-destructive",
      info: "border-blue-500 dark:border-blue-600",
    },
    // Define different padding sizes
    padding: {
      default: "",
      compact: "p-2",
      comfortable: "p-6",
      none: "p-0",
    },
  },
  // Set default variants
  defaultVariants: {
    variant: "default",
    colorScheme: "default",
    padding: "default",
  },
});

/**
 * Define the component props
 */
export interface DataCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dataCardVariants> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  isLoading?: boolean;
  loadingRows?: number;
  action?: React.ReactNode;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
}

/**
 * DataCard component implementation
 */
const DataCard = React.forwardRef<HTMLDivElement, DataCardProps>(
  (
    {
      className,
      variant,
      colorScheme,
      padding,
      title,
      description,
      icon,
      footer,
      isLoading = false,
      loadingRows = 3,
      action,
      children,
      headerClassName,
      contentClassName,
      footerClassName,
      ...props
    },
    ref
  ) => {
    return (
      <Card
        ref={ref}
        className={cn(dataCardVariants({ variant, colorScheme, padding }), className)}
        {...props}
      >
        {(title || description || icon || action) && (
          <CardHeader className={cn("flex flex-row items-center justify-between gap-4", headerClassName)}>
            <div className="flex flex-row items-center gap-2">
              {icon && <div className="text-muted-foreground">{icon}</div>}
              <div>
                {title && (
                  <CardTitle className={cn(typeof title === "string" && "text-lg")}>
                    {isLoading ? <Skeleton className="h-6 w-32" /> : title}
                  </CardTitle>
                )}
                {description && (
                  <CardDescription>
                    {isLoading ? <Skeleton className="mt-2 h-4 w-48" /> : description}
                  </CardDescription>
                )}
              </div>
            </div>
            {action && <div>{action}</div>}
          </CardHeader>
        )}
        <CardContent className={cn(contentClassName)}>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: loadingRows }).map((_, i) => (
                <Skeleton key={i} className={`h-4 w-[${100 - i * 10}%]`} />
              ))}
            </div>
          ) : (
            children
          )}
        </CardContent>
        {footer && (
          <CardFooter className={cn(footerClassName)}>
            {isLoading ? <Skeleton className="h-4 w-full" /> : footer}
          </CardFooter>
        )}
      </Card>
    );
  }
);

// Set display name for better debugging
DataCard.displayName = "DataCard";

/**
 * Export the component and its variants
 */
export { DataCard, dataCardVariants };

/**
 * Usage example:
 * 
 * import { DataCard } from "@/components/ui/data-card";
 * import { BarChart } from "lucide-react";
 * 
 * const MyDataCard = () => {
 *   return (
 *     <DataCard
 *       title="Sales Overview"
 *       description="Monthly sales performance"
 *       icon={<BarChart className="h-5 w-5" />}
 *       variant="bordered"
 *       colorScheme="primary"
 *       footer="Last updated: Today"
 *       isLoading={false}
 *     >
 *       <div>Card content goes here</div>
 *     </DataCard>
 *   );
 * };
 */
