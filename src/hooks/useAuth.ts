import { useState, useEffect } from 'react';
import { useLogin, useRegister, useLogout, useCurrentUser, useUpdateProfile } from '@/queries/useAuth';
import * as authApi from '@/api/authApi';
import { User, ProfileUpdateData } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
}

export interface AuthHook extends AuthState {
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: ProfileUpdateData) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

/**
 * Hook for authentication state and methods
 */
export const useAuth = (): AuthHook => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // Use React Query hooks
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();
  const updateProfileMutation = useUpdateProfile();
  const { refetch: refetchUser } = useCurrentUser({
    enabled: false,
    onSuccess: (user: User) => {
      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
    },
    onError: (error: Error) => {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: error,
      });
    }
  });

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        setState({ ...state, isLoading: true, error: null });

        // Check if we have a token in localStorage
        const token = localStorage.getItem('accessToken');

        if (token) {
          // Fetch the current user
          await refetchUser();
        } else {
          setState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,
          });
        }
      } catch (error) {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: error as Error,
        });
      }
    };

    checkSession();
  }, []);

  // Refresh user data
  const refreshUser = async () => {
    try {
      setState({ ...state, isLoading: true, error: null });
      await refetchUser();
    } catch (error) {
      setState({
        ...state,
        isLoading: false,
        error: error as Error,
      });
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      setState({ ...state, isLoading: true, error: null });

      // Store the rememberMe preference in localStorage
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }

      await loginMutation.mutateAsync({ email, password });

      // The mutation will handle updating the state through the onSuccess callback
    } catch (error) {
      setState({
        ...state,
        isLoading: false,
        error: error as Error,
      });
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, name: string) => {
    try {
      setState({ ...state, isLoading: true, error: null });

      await registerMutation.mutateAsync({ email, password, name });

      // The mutation will handle updating the state through the onSuccess callback
    } catch (error) {
      setState({
        ...state,
        isLoading: false,
        error: error as Error,
      });
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setState({ ...state, isLoading: true, error: null });

      await logoutMutation.mutateAsync();

      // The mutation will handle updating the state through the onSuccess callback
    } catch (error) {
      setState({
        ...state,
        isLoading: false,
        error: error as Error,
      });
    }
  };

  // Reset password
  const resetPassword = async (_userEmail: string) => {
    try {
      setState({ ...state, isLoading: true, error: null });

      // Not implemented yet
      throw new Error('Password reset not implemented yet');
    } catch (error) {
      setState({
        ...state,
        isLoading: false,
        error: error as Error,
      });
    }
  };

  // Update user profile
  const updateProfile = async (data: ProfileUpdateData) => {
    try {
      setState({ ...state, isLoading: true, error: null });

      await updateProfileMutation.mutateAsync(data);

      // The mutation will handle updating the state through the onSuccess callback
    } catch (error) {
      setState({
        ...state,
        isLoading: false,
        error: error as Error,
      });
    }
  };

  // Update password
  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setState({ ...state, isLoading: true, error: null });

      // Call the API directly since we can't use hooks inside functions
      await authApi.changePassword(currentPassword, newPassword);

      setState({
        ...state,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState({
        ...state,
        isLoading: false,
        error: error as Error,
      });
    }
  };

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    updatePassword,
    refreshUser,
  };
};

// For development/testing, create a mock user
export const useMockAuth = (): AuthHook => {
  const mockUser: User = {
    id: 'mock-user-id',
    email: 'user@example.com',
    name: 'Test User',
    created_at: new Date(),
    avatar_url: 'https://example.com/avatar.jpg',
    phone: '+1234567890',
    address: '123 Main St, City, Country',
  };

  const [state, setState] = useState<AuthState>({
    user: mockUser,
    isLoading: false,
    isAuthenticated: true,
    error: null,
  });

  const signIn = async () => {
    setState({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      error: null,
    });
  };

  const signUp = async () => {
    setState({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      error: null,
    });
  };

  const signOut = async () => {
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    });
  };

  const resetPassword = async () => {
    // Do nothing
  };

  const updateProfile = async () => {
    // Do nothing
  };

  const updatePassword = async () => {
    // Do nothing
  };

  const refreshUser = async () => {
    // Do nothing
  };

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    updatePassword,
    refreshUser,
  };
};

// Export the mock auth hook for development
export default process.env.NODE_ENV === 'development' ? useMockAuth : useAuth;
