import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth, AuthHook } from '@/hooks/useAuth';

// Create context with default values
const AuthContext = createContext<AuthHook | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider component that wraps the app and makes auth object available
 * to any child component that calls useAuthContext().
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

/**
 * Hook for components to get the current auth object and re-render when it changes.
 */
export const useAuthContext = (): AuthHook => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
};
