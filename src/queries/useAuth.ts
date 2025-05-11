/**
 * Auth Query Hooks
 * 
 * This file provides React Query hooks for authentication-related operations.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as authApi from '@/api/authApi';
import { User, LoginCredentials, RegisterData, ProfileUpdateData } from '@/types';
import { toast } from 'sonner';

/**
 * Query keys for authentication
 */
export const authQueryKeys = {
  all: ['auth'] as const,
  user: () => [...authQueryKeys.all, 'user'] as const,
};

/**
 * Hook to fetch the current user
 * @param {Object} options - Additional React Query options
 * @returns {Object} React Query result
 */
export const useCurrentUser = (options = {}) => {
  return useQuery<User, Error>({
    queryKey: authQueryKeys.user(),
    queryFn: authApi.getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to login a user
 * @returns {Object} React Query mutation result
 */
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation<{user: User, tokens: {accessToken: string, refreshToken: string}}, Error, LoginCredentials>({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Store tokens in localStorage or secure cookie
      localStorage.setItem('accessToken', data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.tokens.refreshToken);
      
      // Update user data in the cache
      queryClient.setQueryData(authQueryKeys.user(), data.user);
      
      // Show success toast
      toast.success('Logged in successfully');
    },
    onError: (error) => {
      // Show error toast
      toast.error(`Login failed: ${error.message}`);
    },
  });
};

/**
 * Hook to register a new user
 * @returns {Object} React Query mutation result
 */
export const useRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation<{user: User, tokens: {accessToken: string, refreshToken: string}}, Error, RegisterData>({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      // Store tokens in localStorage or secure cookie
      localStorage.setItem('accessToken', data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.tokens.refreshToken);
      
      // Update user data in the cache
      queryClient.setQueryData(authQueryKeys.user(), data.user);
      
      // Show success toast
      toast.success('Registered successfully');
    },
    onError: (error) => {
      // Show error toast
      toast.error(`Registration failed: ${error.message}`);
    },
  });
};

/**
 * Hook to logout a user
 * @returns {Object} React Query mutation result
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, void>({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Remove tokens from localStorage or secure cookie
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Clear user data from the cache
      queryClient.setQueryData(authQueryKeys.user(), null);
      
      // Show success toast
      toast.success('Logged out successfully');
    },
    onError: (error) => {
      // Show error toast
      toast.error(`Logout failed: ${error.message}`);
    },
  });
};

/**
 * Hook to update user profile
 * @returns {Object} React Query mutation result
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation<User, Error, ProfileUpdateData>({
    mutationFn: authApi.updateProfile,
    onSuccess: (updatedUser) => {
      // Update user data in the cache
      queryClient.setQueryData(authQueryKeys.user(), updatedUser);
      
      // Show success toast
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      // Show error toast
      toast.error(`Profile update failed: ${error.message}`);
    },
  });
};

/**
 * Hook to change password
 * @returns {Object} React Query mutation result
 */
export const useChangePassword = () => {
  return useMutation<void, Error, { currentPassword: string; newPassword: string }>({
    mutationFn: ({ currentPassword, newPassword }) => authApi.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      // Show success toast
      toast.success('Password changed successfully');
    },
    onError: (error) => {
      // Show error toast
      toast.error(`Password change failed: ${error.message}`);
    },
  });
};
