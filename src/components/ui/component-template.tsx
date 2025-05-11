/**
 * Component Template
 * 
 * This file provides a template for creating new UI components.
 * Follow this pattern when creating new components to maintain consistency.
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Define variants using Class Variance Authority (CVA)
 * This allows for consistent variant patterns across components
 */
const componentVariants = cva(
  // Base styles that apply to all variants
  "relative rounded-md transition-all",
  {
    variants: {
      // Define different visual variants
      variant: {
        default: "bg-background text-foreground border border-input",
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-transparent",
        ghost: "bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
      // Define different sizes
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 py-1 text-sm",
        lg: "h-12 px-6 py-3 text-lg",
      },
    },
    // Set default variants
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

/**
 * Define the component props
 * Extend HTML attributes and include variant props
 */
export interface ComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {
  // Add any additional props specific to this component
  asChild?: boolean;
}

/**
 * Component implementation
 * Use React.forwardRef to allow ref forwarding
 */
const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  (
    { className, variant, size, asChild = false, ...props },
    ref
  ) => {
    // Use Slot from Radix UI if asChild is true
    const Comp = asChild ? React.Fragment : "div";
    
    return (
      <Comp
        ref={ref}
        className={cn(componentVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);

// Set display name for better debugging
Component.displayName = "Component";

/**
 * Export the component and its variants
 * This allows for reuse of the variants in other components
 */
export { Component, componentVariants };

/**
 * Usage example:
 * 
 * import { Component } from "@/components/ui/component-template";
 * 
 * const MyComponent = () => {
 *   return (
 *     <Component variant="primary" size="lg">
 *       Content
 *     </Component>
 *   );
 * };
 */
