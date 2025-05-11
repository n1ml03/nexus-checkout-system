# UI Component Library

This document outlines the UI Component Library for the Nexus Checkout System, which is built on top of Shadcn UI.

## Overview

The UI Component Library provides a set of reusable, accessible, and composable components that follow consistent design patterns. These components are built using:

- [Shadcn UI](https://ui.shadcn.com/) - A collection of re-usable components built with Radix UI and Tailwind CSS
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components for building high-quality design systems
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Class Variance Authority (CVA)](https://cva.style/docs) - For creating variant-based components

## Component Structure

All UI components are located in the `src/components/ui` directory. Each component is a separate file that exports one or more React components.

```
src/components/ui/
├── accordion.tsx     # Expandable accordion component
├── alert-dialog.tsx  # Alert dialog for important messages
├── alert.tsx         # Alert component for notifications
├── avatar.tsx        # User avatar component
├── badge.tsx         # Badge/tag component
├── button.tsx        # Button component with variants
├── calendar.tsx      # Date picker calendar
├── card.tsx          # Card container component
├── checkbox.tsx      # Checkbox input component
├── dialog.tsx        # Modal dialog component
├── dropdown-menu.tsx # Dropdown menu component
├── form.tsx          # Form components with validation
├── input.tsx         # Text input component
├── label.tsx         # Form label component
├── select.tsx        # Select dropdown component
├── skeleton.tsx      # Loading skeleton component
├── table.tsx         # Data table component
├── tabs.tsx          # Tabbed interface component
├── toast.tsx         # Toast notification component
└── tooltip.tsx       # Tooltip component
```

## Usage Guidelines

### 1. Importing Components

Always import components from the `@/components/ui` path:

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
```

### 2. Component Variants

Many components support variants through the `variant` prop. Use these consistently:

```tsx
// Primary button (default)
<Button>Primary</Button>

// Secondary button
<Button variant="secondary">Secondary</Button>

// Outline button
<Button variant="outline">Outline</Button>

// Destructive button
<Button variant="destructive">Delete</Button>

// Ghost button
<Button variant="ghost">Ghost</Button>

// Link button
<Button variant="link">Link</Button>
```

### 3. Component Sizes

Many components support different sizes through the `size` prop:

```tsx
// Default size
<Button>Default</Button>

// Small size
<Button size="sm">Small</Button>

// Large size
<Button size="lg">Large</Button>

// Icon button
<Button size="icon"><PlusIcon /></Button>
```

### 4. Composition Pattern

Many components follow a composition pattern, where a parent component has multiple child components:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>
    Card Content
  </CardContent>
  <CardFooter>
    Card Footer
  </CardFooter>
</Card>
```

### 5. Form Components

Form components should be used with React Hook Form and Zod for validation:

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Define form schema with Zod
const formSchema = z.object({
  username: z.string().min(2).max(50),
  email: z.string().email(),
});

const MyForm = () => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
    },
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};
```

### 6. Dialog and Modal Components

Use the Dialog component for modal dialogs:

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const MyDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog Description</DialogDescription>
        </DialogHeader>
        <div>Dialog Content</div>
      </DialogContent>
    </Dialog>
  );
};
```

### 7. Toast Notifications

Use the toast function from sonner for notifications:

```tsx
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const MyComponent = () => {
  return (
    <Button
      onClick={() => {
        toast.success("Operation successful!");
      }}
    >
      Show Toast
    </Button>
  );
};
```

### 8. Loading States

Use the Skeleton component for loading states:

```tsx
import { Skeleton } from "@/components/ui/skeleton";

const LoadingState = () => {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
      <Skeleton className="h-4 w-[150px]" />
    </div>
  );
};
```

## Extending Components

When you need to create a new component that isn't provided by the UI library, follow these guidelines:

1. **Use Existing Components**: Build on top of existing UI components when possible
2. **Follow the Same Pattern**: Use the same patterns as the existing components
3. **Use Tailwind CSS**: Use Tailwind CSS for styling
4. **Use CVA for Variants**: Use Class Variance Authority for creating variants

Example of extending a component:

```tsx
// src/components/ui/metric-card.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const metricCardVariants = cva("", {
  variants: {
    trend: {
      up: "text-green-500",
      down: "text-red-500",
      neutral: "text-gray-500",
    },
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    },
  },
  defaultVariants: {
    trend: "neutral",
    size: "md",
  },
});

interface MetricCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof metricCardVariants> {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string | number;
}

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  (
    {
      className,
      title,
      value,
      icon,
      trend = "neutral",
      trendValue,
      size,
      ...props
    },
    ref
  ) => {
    return (
      <Card ref={ref} className={cn(className)} {...props}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {trendValue && (
            <p className={cn(metricCardVariants({ trend, size }))}>
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }
);
MetricCard.displayName = "MetricCard";

export { MetricCard, metricCardVariants };
```

## Theme Customization

The UI components use CSS variables for theming. These are defined in the `tailwind.config.js` file.

To customize the theme, modify the CSS variables in your global CSS file:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 224.3 76.3% 48%;
}
```

## Accessibility

All components are built with accessibility in mind. They use Radix UI primitives which provide:

- Keyboard navigation
- ARIA attributes
- Focus management
- Screen reader support

Always maintain these accessibility features when using or extending components.
