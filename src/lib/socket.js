import { io } from "socket.io-client";
import { API_BASE_URL } from "./api";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    // If API_BASE_URL is relative/empty in production, default to window.location.origin
    const socketUrl = API_BASE_URL || window.location.origin;
    socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });
  }
  return socket;
};
