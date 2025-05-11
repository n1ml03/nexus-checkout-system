import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from "sonner"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string to a localized date format
 * @param dateString The date string to format
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

/**
 * Format a number as currency
 * @param amount The amount to format
 * @param currency The currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Handle Supabase API errors consistently
 * @param error The error object from Supabase
 * @param defaultMessage Default message to show if error doesn't have a message
 * @returns The error for further handling if needed
 */
export function handleApiError(error: any, defaultMessage: string = "An error occurred"): Error {
  // Log the error for debugging
  console.error("API Error:", error);

  // Extract the error message
  const errorMessage = error?.message || defaultMessage;

  // Check for specific error types
  if (error?.code === "PGRST116") {
    // Not found error
    toast.error("Resource not found");
  } else if (error?.message?.includes("apikey")) {
    // API key error
    toast.error("Authentication error. Please refresh the page and try again.");
    console.error("API Key Error: Make sure the Supabase API key is correctly configured");
  } else {
    // Generic error
    toast.error(errorMessage);
  }

  return new Error(errorMessage);
}
