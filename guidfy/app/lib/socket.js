// socket.js
import { io } from "socket.io-client";

let socket = null;

export const initSocket = (token) => {
  // لو في socket قديم، نمسحه الأول
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io("http://localhost:8000", {
    auth: { token },
    autoConnect: false,
    withCredentials: true,
  });

  return socket;
};

export const connectSocket = (userId) => {
  if (!socket) return;

  // امسح listeners القديمة قبل ما تضيف جديدة
  socket.off("connect");
  socket.off("disconnect");

  socket.connect();

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
    socket.emit("register", userId);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.off(); // امسح كل الـ listeners
    socket.disconnect();
    socket = null;
  }
};