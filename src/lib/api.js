const getLocalApiBaseUrl = () => {
  if (typeof window !== "undefined" && window.location) {
    const host = window.location.hostname || "localhost";
    return `http://${host}:5001`;
  }
  return "http://localhost:5001";
};

export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL?.trim() ||
  (process.env.NODE_ENV === "development" ? getLocalApiBaseUrl() : "");

export const apiUrl = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

