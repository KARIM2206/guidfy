'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  fetchUserProfile,
  updateProfile,
  uploadAvatar,
  uploadCover,
  markNotificationsRead,
} from '../../services/profile'; // عدّل الـ path حسب هيكل مشروعك
import { useAuth } from './AuthProvider';
import { getStudentContent } from '@/services/student/student';

// ─── Context ────────────────────────────────────────────────
const ProfileContext = createContext(null);

// ─── Provider ───────────────────────────────────────────────
export function ProfileProvider({  children }) {
  const [userData, setUserData]   = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);
  const [isSaving, setIsSaving]   = useState(false);
 const {user}=useAuth()
 const username=user?.name
  // ── Fetch Profile ─────────────────────────────────────────
  const loadProfile = useCallback(async () => {
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchUserProfile();
     
      
      setUserData(data);
    } catch (err) {
      console.error('ProfileContext - loadProfile error:', err);
      setError(err?.response?.data?.error || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ── Update Profile Fields ─────────────────────────────────
  const handleUpdateProfile = useCallback(async (fields) => {
    setIsSaving(true);
    try {
      const updated = await updateProfile(fields);
      setUserData((prev) => ({ ...prev, ...updated }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err?.response?.data?.error || 'Update failed' };
    } finally {
      setIsSaving(false);
    }
  }, []);
 const fetchUserContent = useCallback(async (targetType,page,limit) => {
    try {
      const data = await getStudentContent(targetType,page,limit);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err?.response?.data?.error || 'Failed to fetch content' };
    }
  }, []);
  // ── Upload Avatar ─────────────────────────────────────────
  const handleUploadAvatar = useCallback(async (file) => {
    setIsSaving(true);
    try {
      const result = await uploadAvatar(file);
      setUserData((prev) => ({ ...prev, avatar: result.avatar }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err?.response?.data?.error || 'Upload failed' };
    } finally {
      setIsSaving(false);
    }
  }, []);

  // ── Upload Cover ──────────────────────────────────────────
  const handleUploadCover = useCallback(async (file) => {
    setIsSaving(true);
    try {
      const result = await uploadCover(file);
      setUserData((prev) => ({ ...prev, cover: result.cover }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err?.response?.data?.error || 'Upload failed' };
    } finally {
      setIsSaving(false);
    }
  }, []);

  // ── Mark Notifications Read ───────────────────────────────
  const handleMarkNotificationsRead = useCallback(async () => {
    try {
      await markNotificationsRead();
      setUserData((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) => ({ ...n, unread: false })),
      }));
    } catch (err) {
      console.error('Mark notifications read error:', err);
    }
  }, []);

  // ── Optimistic local update (للـ UI السريع) ──────────────
  const updateLocalField = useCallback((field, value) => {
    setUserData((prev) => (prev ? { ...prev, [field]: value } : prev));
  }, []);

  const value = {
    userData,
    isLoading,
    isSaving,
    error,
    refetch: loadProfile,
    updateProfile: handleUpdateProfile,
    uploadAvatar: handleUploadAvatar,
    uploadCover: handleUploadCover,
    markNotificationsRead: handleMarkNotificationsRead,
    updateLocalField,
    fetchUserContent,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────
export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile must be used inside <ProfileProvider>');
  }
  return ctx;
}