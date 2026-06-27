'use client';

import { useSocket } from "@/app/hooks/useSocket";
import { useAuth } from "@/app/CONTEXT/AuthProvider";

export default function NotificationListener() {
  const { user, token } = useAuth();
  console.log("NotificationListener RENDERING! token:", !!token, "user:", user);

  // Initiates the unified Socket.IO connection and attaches global listeners
  useSocket();

  return null;
}