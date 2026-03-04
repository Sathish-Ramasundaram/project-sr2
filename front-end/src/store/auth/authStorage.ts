export type SessionUser = {
  id: string;
  name: string;
  email: string;
};

const CURRENT_CUSTOMER_KEY = "sr-store-current-customer";
const SESSION_USER_KEY = "sr-store-session-user";
const AUTH_TOKEN_KEY = "sr-store-auth-token";
const TAB_ID_KEY = "sr-store-tab-id";
const ACTIVE_CUSTOMER_SESSIONS_KEY = "sr-store-active-customer-sessions";
const ACTIVE_SESSION_TTL_MS = 1000 * 60 * 60 * 24;

const isClient = typeof window !== "undefined";
let hasRegisteredUnloadHandler = false;

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

const getTabId = (): string => {
  const existingTabId = sessionStorage.getItem(TAB_ID_KEY);
  if (existingTabId) {
    return existingTabId;
  }

  const generatedTabId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  sessionStorage.setItem(TAB_ID_KEY, generatedTabId);
  return generatedTabId;
};

type ActiveCustomerSessions = Record<string, Record<string, number>>;

const readActiveCustomerSessions = (): ActiveCustomerSessions => {
  const parsed = parseJson<ActiveCustomerSessions>(
    localStorage.getItem(ACTIVE_CUSTOMER_SESSIONS_KEY),
    {}
  );

  const now = Date.now();
  const cleaned: ActiveCustomerSessions = {};

  Object.entries(parsed).forEach(([email, tabMap]) => {
    if (!tabMap || typeof tabMap !== "object") {
      return;
    }

    const validEntries = Object.entries(tabMap).filter(
      ([, timestamp]) =>
        typeof timestamp === "number" && now - timestamp <= ACTIVE_SESSION_TTL_MS
    );

    if (validEntries.length > 0) {
      cleaned[email] = Object.fromEntries(validEntries);
    }
  });

  return cleaned;
};

const writeActiveCustomerSessions = (sessions: ActiveCustomerSessions) => {
  localStorage.setItem(ACTIVE_CUSTOMER_SESSIONS_KEY, JSON.stringify(sessions));
};

const markCustomerSessionActive = (email: string) => {
  if (!isClient || !email) {
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const tabId = getTabId();
  const sessions = readActiveCustomerSessions();
  const customerTabs = sessions[normalizedEmail] ?? {};
  customerTabs[tabId] = Date.now();
  sessions[normalizedEmail] = customerTabs;
  writeActiveCustomerSessions(sessions);
};

const markCustomerSessionInactive = (email: string) => {
  if (!isClient || !email) {
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const tabId = getTabId();
  const sessions = readActiveCustomerSessions();
  const customerTabs = sessions[normalizedEmail];
  if (!customerTabs) {
    return;
  }

  delete customerTabs[tabId];

  if (Object.keys(customerTabs).length === 0) {
    delete sessions[normalizedEmail];
  } else {
    sessions[normalizedEmail] = customerTabs;
  }

  writeActiveCustomerSessions(sessions);
};

const registerUnloadCleanup = () => {
  if (!isClient || hasRegisteredUnloadHandler) {
    return;
  }

  window.addEventListener("beforeunload", () => {
    const currentUser = parseJson<SessionUser | null>(
      sessionStorage.getItem(SESSION_USER_KEY),
      null
    );

    if (currentUser?.email) {
      markCustomerSessionInactive(currentUser.email);
    }
  });

  hasRegisteredUnloadHandler = true;
};

export const isCustomerActiveInAnotherTab = (email: string): boolean => {
  if (!isClient || !email.trim()) {
    return false;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const sessions = readActiveCustomerSessions();
  const customerTabs = sessions[normalizedEmail];
  if (!customerTabs) {
    return false;
  }

  const tabId = getTabId();
  return Object.keys(customerTabs).some((activeTabId) => activeTabId !== tabId);
};

export const setCurrentCustomerEmail = (email: string) => {
  if (!isClient) {
    return;
  }

  sessionStorage.setItem(CURRENT_CUSTOMER_KEY, email);
};

export const setSessionUser = (user: SessionUser) => {
  if (!isClient) {
    return;
  }

  const previousUser = parseJson<SessionUser | null>(
    sessionStorage.getItem(SESSION_USER_KEY),
    null
  );
  if (previousUser?.email && previousUser.email !== user.email) {
    markCustomerSessionInactive(previousUser.email);
  }

  sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
  markCustomerSessionActive(user.email);
  registerUnloadCleanup();
};

export const setAuthToken = (token: string) => {
  if (!isClient) {
    return;
  }

  sessionStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const getAuthToken = (): string | null => {
  if (!isClient) {
    return null;
  }

  return sessionStorage.getItem(AUTH_TOKEN_KEY);
};

export const clearCurrentCustomerEmail = () => {
  if (!isClient) {
    return;
  }

  const previousUser = parseJson<SessionUser | null>(
    sessionStorage.getItem(SESSION_USER_KEY),
    null
  );
  if (previousUser?.email) {
    markCustomerSessionInactive(previousUser.email);
  }

  sessionStorage.removeItem(CURRENT_CUSTOMER_KEY);
  sessionStorage.removeItem(SESSION_USER_KEY);
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
};

export const getSessionUser = (): SessionUser | null => {
  if (!isClient) {
    return null;
  }

  const user = parseJson<SessionUser | null>(sessionStorage.getItem(SESSION_USER_KEY), null);
  if (!user?.id || !user.email || !user.name) {
    return null;
  }

  markCustomerSessionActive(user.email);
  registerUnloadCleanup();

  return user;
};
