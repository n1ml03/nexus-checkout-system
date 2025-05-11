/**
 * useFormValidation Hook
 *
 * A custom hook for form validation that integrates with React Hook Form and Zod.
 * Provides a consistent way to handle form validation across the application.
 */

import React, { useState, useEffect } from 'react';
import { useForm, UseFormProps, UseFormReturn, FieldValues, SubmitHandler, SubmitErrorHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

interface UseFormValidationProps<TFormValues extends FieldValues> extends UseFormProps<TFormValues> {
  schema: z.ZodType<TFormValues>;
  onSubmit: SubmitHandler<TFormValues>;
  onError?: SubmitErrorHandler<TFormValues>;
  showSuccessToast?: boolean;
  successMessage?: string;
  showErrorToast?: boolean;
  errorMessage?: string;
}

interface UseFormValidationReturn<TFormValues extends FieldValues> extends Omit<UseFormReturn<TFormValues>, 'handleSubmit' | 'reset'> {
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
  isSubmitSuccessful: boolean;
  submitError: Error | null;
  reset: (values?: Partial<TFormValues>) => void;
}

/**
 * useFormValidation hook
 *
 * @param {Object} options - Configuration options
 * @param {ZodType} options.schema - Zod schema for validation
 * @param {Function} options.onSubmit - Submit handler
 * @param {Function} options.onError - Error handler
 * @param {boolean} options.showSuccessToast - Whether to show success toast
 * @param {string} options.successMessage - Success toast message
 * @param {boolean} options.showErrorToast - Whether to show error toast
 * @param {string} options.errorMessage - Error toast message
 * @returns {Object} Form methods and handlers
 */
export function useFormValidation<TFormValues extends FieldValues>({
  schema,
  onSubmit,
  onError,
  showSuccessToast = true,
  successMessage = 'Form submitted successfully',
  showErrorToast = true,
  errorMessage = 'Form submission failed',
  ...formOptions
}: UseFormValidationProps<TFormValues>): UseFormValidationReturn<TFormValues> {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);
  const [submitError, setSubmitError] = useState<Error | null>(null);

  // Initialize form with Zod resolver
  const form = useForm<TFormValues>({
    ...formOptions,
    resolver: zodResolver(schema),
  });

  // Reset success and error states when form values change
  useEffect(() => {
    if (isSubmitSuccessful || submitError) {
      setIsSubmitSuccessful(false);
      setSubmitError(null);
    }
  }, [form.formState.isDirty, isSubmitSuccessful, submitError]);

  // Custom submit handler
  const handleSubmit = async (e?: React.BaseSyntheticEvent) => {
    if (e) {
      e.preventDefault();
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await form.handleSubmit(async (data) => {
        try {
          await onSubmit(data);
          setIsSubmitSuccessful(true);
          if (showSuccessToast) {
            toast.success(successMessage);
          }
        } catch (error) {
          setSubmitError(error instanceof Error ? error : new Error(String(error)));
          if (showErrorToast) {
            toast.error(errorMessage);
          }
          throw error;
        }
      }, onError)(e);
    } catch (error) {
      // This catch block handles validation errors
      console.error('Form validation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom reset function
  const reset = (values?: Partial<TFormValues>) => {
    // Use the correct type for reset
    form.reset(values as any);
    setIsSubmitSuccessful(false);
    setSubmitError(null);
  };

  return {
    ...form,
    handleSubmit,
    isSubmitting,
    isSubmitSuccessful,
    submitError,
    reset,
  };
}