export type StoredCustomer = {
  name: string;
  email: string;
  password: string;
};

export type SessionUser = {
  name: string;
  email: string;
};

const CUSTOMERS_KEY = "sr-store-customers";
const CURRENT_CUSTOMER_KEY = "sr-store-current-customer";

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

export const getStoredCustomers = (): StoredCustomer[] => {
  if (!isClient) {
    return [];
  }

  return parseJson<StoredCustomer[]>(localStorage.getItem(CUSTOMERS_KEY), []);
};

export const saveStoredCustomers = (customers: StoredCustomer[]) => {
  if (!isClient) {
    return;
  }

  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
};

export const setCurrentCustomerEmail = (email: string) => {
  if (!isClient) {
    return;
  }

  localStorage.setItem(CURRENT_CUSTOMER_KEY, email);
};

export const clearCurrentCustomerEmail = () => {
  if (!isClient) {
    return;
  }

  localStorage.removeItem(CURRENT_CUSTOMER_KEY);
};

export const getSessionUser = (): SessionUser | null => {
  if (!isClient) {
    return null;
  }

  const currentEmail = localStorage.getItem(CURRENT_CUSTOMER_KEY);
  if (!currentEmail) {
    return null;
  }

  const customer = getStoredCustomers().find((entry) => entry.email === currentEmail);
  if (!customer) {
    return null;
  }

  return { name: customer.name, email: customer.email };
};

