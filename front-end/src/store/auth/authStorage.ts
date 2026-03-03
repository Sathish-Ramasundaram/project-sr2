export type SessionUser = {
  id: string;
  name: string;
  email: string;
};

const CURRENT_CUSTOMER_KEY = "sr-store-current-customer";
const SESSION_USER_KEY = "sr-store-session-user";
const AUTH_TOKEN_KEY = "sr-store-auth-token";

const isClient = typeof window !== "undefined";

const parseJson = <T,>(value: string | null, fallback: T): T => {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const setCurrentCustomerEmail = (email: string) => {
  if (!isClient) {
    return;
  }

  localStorage.setItem(CURRENT_CUSTOMER_KEY, email);
};

export const setSessionUser = (user: SessionUser) => {
  if (!isClient) {
    return;
  }

  localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
};

export const setAuthToken = (token: string) => {
  if (!isClient) {
    return;
  }

  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const getAuthToken = (): string | null => {
  if (!isClient) {
    return null;
  }

  return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const clearCurrentCustomerEmail = () => {
  if (!isClient) {
    return;
  }

  localStorage.removeItem(CURRENT_CUSTOMER_KEY);
  localStorage.removeItem(SESSION_USER_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

export const getSessionUser = (): SessionUser | null => {
  if (!isClient) {
    return null;
  }

  const user = parseJson<SessionUser | null>(localStorage.getItem(SESSION_USER_KEY), null);
  if (!user?.id || !user.email || !user.name) {
    return null;
  }

  return user;
};
