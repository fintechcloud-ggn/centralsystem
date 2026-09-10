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
  let base = (API_BASE_URL || "").trim().replace(/\/+$/, "");
  let p = path.startsWith("/") ? path : `/${path}`;

  // Prevent double /api duplication (e.g. base = "/api" or base ending with "/api" and p = "/api/...")
  if (base.endsWith("/api") && p.startsWith("/api/")) {
    p = p.substring(4);
  } else if ((base === "api" || base === "/api") && p.startsWith("/api/")) {
    base = "";
  }

  return `${base}${p}`;
};


