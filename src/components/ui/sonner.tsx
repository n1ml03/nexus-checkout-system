import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right" // Position at the top right of the screen
      expand={false} // Keep compact size
      closeButton={true} // Always show close button
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:max-w-[320px]",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:text-xs",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:text-xs",
          closeButton:
            "group-[.toast]:opacity-100 group-[.toast]:text-foreground group-[.toast]:bg-muted/20 group-[.toast]:hover:bg-muted/50 group-[.toast]:p-1 group-[.toast]:rounded-md",
          error:
            "group-[.toaster]:border-destructive group-[.toaster]:bg-destructive/10 group-[.toaster]:text-destructive-foreground",
        },
      }}
      {...props}
    />
  )
}

// Custom toast with enhanced error display
const enhancedToast = {
  ...toast,
  error: (title: string, options?: Parameters<typeof toast.error>[1]) => {
    return toast.error(title, {
      ...options,
      position: "top-right", // Force error toasts to top right
      duration: 5000, // Shorter duration
      className: "error-toast", // Add custom class for styling
    });
  }
};

export { Toaster, enhancedToast as toast }
