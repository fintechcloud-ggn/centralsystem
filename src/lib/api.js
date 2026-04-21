const localApiBaseUrl = "http://localhost:5001";
const envApiBaseUrl = process.env.REACT_APP_API_BASE_URL?.trim() || "";
const isLocalApiBaseUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(
  envApiBaseUrl
);

export const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? envApiBaseUrl || localApiBaseUrl
    : isLocalApiBaseUrl
      ? ""
      : envApiBaseUrl.replace(/\/$/, "");

export const apiUrl = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
