'use client';

import { getMe, login } from "@/services/auth";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNotifications } from "./NotificationContext";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const router = useRouter();
//   const { cleanupSocket } = useNotifications();
  // ✅ لا مشاكل SSR — بنجيب الـ token بعد الـ mount بس
  const [token, setToken] = useState(null);
  const [user,  setUser]  = useState(null);
  const [loading, setLoading] = useState(false);

  // ─── تهيئة الـ token من localStorage بعد الـ mount ─────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("token");
    if (saved) setToken(saved);
  }, []);

  // ─── جلب بيانات المستخدم كل ما الـ token يتغيّر ─────────────────────────
  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token]);

  // ═══════════════════════════════════════════════════════════════════════
  //  FETCH USER
  // ═══════════════════════════════════════════════════════════════════════
  const fetchUser = async () => {
    try {
      const response = await getMe(token);
      if (response.success) {
        setUser(response.data);
        // ✅ حفظ userId عشان NotificationListener يلاقيه
        localStorage.setItem("userId", response.data.id);
      }
      return response;
    } catch (error) {
      console.error("fetchUser error:", error);
      // لو الـ token انتهى صلاحيته → logout تلقائي
      if (error?.response?.status === 401) {
        handleLogout();
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  //  LOGIN
  // ═══════════════════════════════════════════════════════════════════════
  const fetchLogin = async (email, password) => {
    if (loading) return;

    // ─── Validation ──────────────────────────────────────────────────────
    if (!email || !password) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    // ─── API Call ─────────────────────────────────────────────────────────
    setLoading(true);
    try {
      const response = await login({ email, password });

      if (response.success) {
        const { token: newToken, data: userData } = response;

        // حفظ في localStorage
        localStorage.setItem("token",  newToken);
        localStorage.setItem("userId", userData.id);

        // تحديث الـ state
        // ✅ setToken هيشغّل useEffect اللي فيه fetchUser تلقائياً
        // ✅ NotificationListener شايف token فهيشغّل initializeSocket تلقائياً
        setToken(newToken);
        setUser(userData);

        toast.success(response.message || "Login successful!");
        router.push("/");
      } else {
        toast.error(response.message || "Login failed. Please try again.");
      }

      return response;
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error?.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  //  LOGOUT
  // ═══════════════════════════════════════════════════════════════════════
  const handleLogout = () => {
    // cleanupSocket();
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setToken(null);
    setUser(null);
    router.push("/login");
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        loading,
        fetchLogin,
        fetchUser,
        handleLogout,
        loadingForLogin: loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};