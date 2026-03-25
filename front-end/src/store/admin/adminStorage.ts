const ADMIN_SESSION_KEY = "isAdminLoggedIn";
const ADMIN_TOKEN_KEY = "adminAuthToken";

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

export const setAdminToken = (token: string) => {
  if (!isClient) {
    return;
  }

  localStorage.setItem(ADMIN_TOKEN_KEY, token);
};

export const getAdminToken = (): string | null => {
  if (!isClient) {
    return null;
  }

  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

export const clearAdminSession = () => {
  if (!isClient) {
    return;
  }

  localStorage.removeItem(ADMIN_SESSION_KEY);
  localStorage.removeItem(ADMIN_TOKEN_KEY);
};
