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

export const fetchJson = async (path, init = {}) => {
  const headers = new Headers(init.headers || {});
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const timeoutMs = init.timeoutMs || 15000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  if (init.signal) {
    if (init.signal.aborted) {
      controller.abort();
    } else {
      init.signal.addEventListener("abort", () => controller.abort(), { once: true });
    }
  }

  let response;
  try {
    response = await fetch(buildApiUrl(path), {
      ...init,
      cache: init.cache || "no-store",
      headers,
      signal: controller.signal
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    let details = "";

    try {
      if (contentType.toLowerCase().includes("application/json")) {
        const json = await response.json();
        details = json?.details || json?.error || JSON.stringify(json);
      } else {
        details = (await response.text()).replace(/\s+/g, " ").trim().slice(0, 200);
      }
    } catch (parseError) {
      details = "Unable to parse error response body.";
    }

    throw new Error(
      `Request failed (${response.status})` +
      (details ? `: ${details}` : "")
    );
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    const bodyPreview = (await response.text()).replace(/\s+/g, " ").trim().slice(0, 200);
    throw new Error(
      `Expected JSON response but received non-JSON content. ` +
      `status=${response.status}, content-type="${contentType}", preview="${bodyPreview}"`
    );
  }

  return response.json();
};
