const ADMIN_SESSION_KEY = "sr-store-admin-session";

export const ADMIN_EMAIL = "admin@admin.com";
export const ADMIN_PASSWORD = "1234";

const isClient = typeof window !== "undefined";

export const getAdminSession = (): boolean => {
  if (!isClient) {
    return false;
  }

  return localStorage.getItem(ADMIN_SESSION_KEY) === "true";
};

export const setAdminSession = () => {
  if (!isClient) {
    return;
  }

  localStorage.setItem(ADMIN_SESSION_KEY, "true");
};

export const clearAdminSession = () => {
  if (!isClient) {
    return;
  }

  localStorage.removeItem(ADMIN_SESSION_KEY);
};

