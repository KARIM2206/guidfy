/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AUTH MUTATIONS CUSTOM HOOK
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This hook provides mutations for:
 * - Login
 * - Register
 * - Logout
 * - Change password
 * 
 * All auth state is managed via Zustand (useAuthStore).
 * The server sets HttpOnly cookies automatically.
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { useAuthStore } from '@/lib/stores/authStore';

// ─────────────────────────────────────────────────────────────────────────
// API Functions
// ─────────────────────────────────────────────────────────────────────────

async function loginUser(credentials) {
  const response = await apiClient.post('/auth/login', credentials);
  // Server automatically sets HttpOnly cookie
  return response.data;
}

async function registerUser(userData) {
  const response = await apiClient.post('/auth/register', userData);
  // Server automatically sets HttpOnly cookie
  return response.data;
}

async function logoutUser() {
  const response = await apiClient.post('/auth/logout');
  // Server automatically clears HttpOnly cookie
  return response.data;
}

async function changePassword(passwords) {
  const response = await apiClient.post('/auth/change-password', passwords);
  return response.data;
}

// ─────────────────────────────────────────────────────────────────────────
// Custom Hooks
// ─────────────────────────────────────────────────────────────────────────

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setUser, setError } = useAuthStore();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // Update auth store with user data
      setUser(data.user);

      // Invalidate auth query to refetch user
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });

      // Redirect to home
      router.push('/');
    },
    onError: (error) => {
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      console.error('Login error:', error);
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setUser, setError } = useAuthStore();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      // Update auth store with user data
      setUser(data.user);

      // Invalidate auth query to refetch user
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });

      // Redirect to home
      router.push('/');
    },
    onError: (error) => {
      const errorMessage = error.message || 'Registration failed';
      setError(errorMessage);
      console.error('Register error:', error);
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      // Clear auth store
      clearAuth();

      // Clear all queries
      queryClient.clear();

      // Redirect to login
      router.push('/login');
    },
    onError: (error) => {
      console.error('Logout error:', error);
      // Still clear auth even if logout fails
      clearAuth();
      router.push('/login');
    },
  });
}

export function useChangePassword() {
  const { setError } = useAuthStore();

  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      console.log('Password changed successfully');
    },
    onError: (error) => {
      const errorMessage = error.message || 'Failed to change password';
      setError(errorMessage);
      console.error('Change password error:', error);
    },
  });
}
