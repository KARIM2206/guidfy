'use client';

import { useEffect } from "react";
import { useNotifications } from "@/app/CONTEXT/NotificationContext";
import { useAuth } from "@/app/CONTEXT/AuthProvider"; // ← import الـ auth context

export default function NotificationListener() {
  const { initializeSocket, cleanupSocket } = useNotifications();
  const { token, user } = useAuth(); // ← اجيب token و user من الـ context

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (token && user?.id) {
      // ✅ كل ما الـ token أو الـ user يتغير → يعيد تهيئة الـ socket
      initializeSocket(token, user.id);
    } else {
      // ✅ لو logout → ينظف الـ socket
      cleanupSocket();
    }

    return () => {
      cleanupSocket();
    };
  }, [token, user?.id]); // ← الـ dependency array هنا هو السر

  return null;
}