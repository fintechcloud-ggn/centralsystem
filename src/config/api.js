const DEFAULT_PRODUCTION_API_BASE_URL = "https://centralsystem-tau.vercel.app";

const rawApiBaseUrl = process.env.REACT_APP_API_BASE_URL
  ? process.env.REACT_APP_API_BASE_URL.trim()
  : "";

export const API_BASE_URL = rawApiBaseUrl
  ? rawApiBaseUrl.replace(/\/+$/, "")
  : process.env.NODE_ENV === "development"
    ? "http://localhost:5001"
    : DEFAULT_PRODUCTION_API_BASE_URL;

export const buildApiUrl = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const fetchJson = async (path, init) => {
  const response = await fetch(buildApiUrl(path), init);

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new Error("Expected JSON response but received non-JSON content.");
  }

  return response.json();
};
