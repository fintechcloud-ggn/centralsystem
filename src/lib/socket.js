import { io } from "socket.io-client";
import { API_BASE_URL } from "./api";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    // Determine socket target URL
    const envUrl = process.env.REACT_APP_API_BASE_URL?.trim();
    const socketUrl = envUrl || API_BASE_URL || window.location.origin;

    socket = io(socketUrl, {
      // Prioritize polling first for maximum compatibility across reverse proxies (Nginx, Cloudflare)
      transports: ["polling", "websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000
    });
  }
  return socket;
};
