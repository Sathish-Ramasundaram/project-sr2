const ADMIN_SESSION_KEY = "isAdminLoggedIn";

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
