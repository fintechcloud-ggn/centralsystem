export const ADMIN_TOKEN_KEY = "adminToken";
export const ADMIN_ROLE_KEY = "adminRole";

export const getAdminToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);

export const setAdminToken = (token, admin) => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);

  if (admin?.role) {
    localStorage.setItem(ADMIN_ROLE_KEY, admin.role);
  }
};

export const clearAdminToken = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_ROLE_KEY);
};

export const setAdminRole = (role) => {
  if (role) {
    localStorage.setItem(ADMIN_ROLE_KEY, role);
  }
};

export const getAdminPayload = () => {
  const token = getAdminToken();
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload =
      normalizedPayload + "=".repeat((4 - (normalizedPayload.length % 4)) % 4);
    const decodedPayload = atob(paddedPayload);
    return JSON.parse(decodedPayload);
  } catch (error) {
    return null;
  }
};

export const getAdminRole = () =>
  localStorage.getItem(ADMIN_ROLE_KEY) || getAdminPayload()?.role || "admin";

export const isSuperUser = () => getAdminRole() === "super_user";

export const isAdminAuthenticated = () => Boolean(getAdminToken());
