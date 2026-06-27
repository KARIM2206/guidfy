'use client';

import { createContext, useContext, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { API_URL } from '../../lib/apiClient.js';
import apiClient from '../../lib/apiClient.js';
import { useAuthStore } from '../../lib/stores/authStore';

const AuthContext = createContext(null);

// ─────────────────────────────────────────────
// Fetch Current User
// ─────────────────────────────────────────────
// ✅ FIX: Use plain axios (NOT apiClient) to bypass the response interceptor.
//         apiClient's interceptor would try to refresh on 401, causing a
//         redirect loop on the login page. Here we just want to know if
//         the user is logged in — a 401 is a valid "not logged in" answer.
async function fetchCurrentUser() {
  try {
    const response = await axios.get(`${API_URL}/auth/me`, {
      withCredentials: true,
    });
    return response.data?.data ?? null;
  } catch (error) {
    if (error.response?.status === 401) {
      return null; // ✅ Not an error — user is simply not authenticated
    }
    throw error; // 🔴 Re-throw unexpected errors (500, network, etc.)
  }
}

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────
export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const store = useAuthStore();

  const { setUser, setLoading, clearAuth } = store;

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchCurrentUser,

    // ✅ Prevents unnecessary refetches that cause flickering
    staleTime: Infinity,

    retry: false,
    refetchOnWindowFocus: false,
  });

  // ─────────────────────────────────────────────
  // Sync Zustand safely (NO LOOP)
  // ─────────────────────────────────────────────
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    if (user) {
      setUser(user);
    } else if (user === null) {
      // ✅ FIX: user === null means the query returned explicitly (not authenticated)
      clearAuth();
    }
  }, [user, setUser, clearAuth]);


  useEffect(() => {
    // ✅ FIX: Check for error existence only — don't rely on error.response.status
    //         because the interceptor reshapes the error object before it reaches here
    if (error) {
      clearAuth();
    }
  }, [error, clearAuth]);

  // ─────────────────────────────────────────────
  // Provider
  // ─────────────────────────────────────────────
 
  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (_) {}
    finally {
      clearAuth();
      // ✅ امسح الـ cache عشان لما يرجع يعمل fetch جديد
      queryClient.removeQueries({ queryKey: ['auth', 'me'] });
      window.location.href = '/login';
    }
  };

  // ✅ expose دي عشان login page يستخدمها
  const handleLoginSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
  };

  return (
    <AuthContext.Provider value={{ ...store, handleLogout, handleLoginSuccess }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────────
// useAuth Hook
// ─────────────────────────────────────────────
export function useAuth() {
  return useContext(AuthContext);
}