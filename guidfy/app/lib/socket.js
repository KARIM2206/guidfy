// socket.js
import { io } from "socket.io-client";

let socket = null;

export const initSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  console.log("CREATING SOCKET");
  socket = io("http://localhost:8000", {
    withCredentials: true,
  });

  return socket;
};

export const connectSocket = (userId) => {
  if (!socket) return;

  socket.off("connect");
  socket.off("disconnect");

  socket.connect();

  socket.on("connect", () => {
    console.log("SOCKET CONNECTED", socket.id);
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

export const getSocket = () => socket;