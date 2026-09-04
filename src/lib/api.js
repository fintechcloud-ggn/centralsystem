const localApiBaseUrl = "http://localhost:5001";

export const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? localApiBaseUrl
    : "";

export const apiUrl = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
