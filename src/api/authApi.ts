/**
 * Auth API
 * 
 * This file provides API functions for authentication-related operations.
 */

import { User, LoginCredentials, RegisterData, ProfileUpdateData } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Login user
 * @param {LoginCredentials} credentials - Login credentials
 * @returns {Promise<{user: User, tokens: {accessToken: string, refreshToken: string}}>} User data and tokens
 */
export const login = async (credentials: LoginCredentials): Promise<{user: User, tokens: {accessToken: string, refreshToken: string}}> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to login' }));
    throw new Error(errorData.error?.message || 'Failed to login');
  }
  
  const result = await response.json();
  return result.data;
};

/**
 * Register a new user
 * @param {RegisterData} userData - User registration data
 * @returns {Promise<{user: User, tokens: {accessToken: string, refreshToken: string}}>} User data and tokens
 */
export const register = async (userData: RegisterData): Promise<{user: User, tokens: {accessToken: string, refreshToken: string}}> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to register' }));
    throw new Error(errorData.error?.message || 'Failed to register');
  }
  
  const result = await response.json();
  return result.data;
};

/**
 * Refresh access token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<{accessToken: string}>} New access token
 */
export const refreshToken = async (refreshToken: string): Promise<{accessToken: string}> => {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to refresh token' }));
    throw new Error(errorData.error?.message || 'Failed to refresh token');
  }
  
  const result = await response.json();
  return result.data;
};

/**
 * Logout user
 * @returns {Promise<void>}
 */
export const logout = async (): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to logout' }));
    throw new Error(errorData.error?.message || 'Failed to logout');
  }
};

/**
 * Get current user
 * @returns {Promise<User>} User data
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/auth/me`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to get current user' }));
    throw new Error(errorData.error?.message || 'Failed to get current user');
  }
  
  const result = await response.json();
  return result.data;
};

/**
 * Update user profile
 * @param {ProfileUpdateData} profileData - Profile data
 * @returns {Promise<User>} Updated user data
 */
export const updateProfile = async (profileData: ProfileUpdateData): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to update profile' }));
    throw new Error(errorData.error?.message || 'Failed to update profile');
  }
  
  const result = await response.json();
  return result.data;
};

/**
 * Change password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<void>}
 */
export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to change password' }));
    throw new Error(errorData.error?.message || 'Failed to change password');
  }
};
