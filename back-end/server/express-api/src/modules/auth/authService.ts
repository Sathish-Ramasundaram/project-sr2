import bcrypt from "bcryptjs";
import { hasuraAdminRequest } from "../../lib/hasuraClient";
import { signUserToken } from "../../lib/jwt";

type CustomerRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
};

type GetCustomerByEmailResponse = {
  customers: CustomerRow[];
};

type InsertCustomerResponse = {
  insert_customers_one: {
    id: string;
    name: string;
    email: string;
  };
};

type UpdateCustomerPasswordResponse = {
  update_customers: {
    affected_rows: number;
  };
};

const GET_CUSTOMER_BY_EMAIL = `
query GetCustomerByEmail($email: String!) {
  customers(where: { email: { _eq: $email } }, limit: 1) {
    id
    name
    email
    password_hash
  }
}
`;

const INSERT_CUSTOMER = `
mutation InsertCustomer($name: String!, $email: String!, $password_hash: String!) {
  insert_customers_one(object: {
    name: $name
    email: $email
    password_hash: $password_hash
  }) {
    id
    name
    email
  }
}
`;

const UPDATE_CUSTOMER_PASSWORD_BY_EMAIL = `
mutation UpdateCustomerPasswordByEmail($email: String!, $password_hash: String!) {
  update_customers(
    where: { email: { _eq: $email } }
    _set: { password_hash: $password_hash }
  ) {
    affected_rows
  }
}
`;

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export async function registerCustomer(input: {
  name: string;
  email: string;
  password: string;
}) {
  const normalizedEmail = input.email.trim().toLowerCase();
  const existing = await hasuraAdminRequest<GetCustomerByEmailResponse>(GET_CUSTOMER_BY_EMAIL, {
    email: normalizedEmail
  });

  if (existing.customers.length > 0) {
    return { status: "exists" as const };
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const created = await hasuraAdminRequest<InsertCustomerResponse>(INSERT_CUSTOMER, {
    name: input.name.trim(),
    email: normalizedEmail,
    password_hash: passwordHash
  });

  const user: AuthUser = {
    id: created.insert_customers_one.id,
    name: created.insert_customers_one.name,
    email: created.insert_customers_one.email
  };
  const token = signUserToken(user.id, user.email, "customer");
  return { status: "created" as const, token, user };
}

export async function loginCustomer(input: { email: string; password: string }) {
  const normalizedEmail = input.email.trim().toLowerCase();
  const result = await hasuraAdminRequest<GetCustomerByEmailResponse>(GET_CUSTOMER_BY_EMAIL, {
    email: normalizedEmail
  });

  const customer = result.customers[0];
  if (!customer) {
    return { status: "invalid" as const };
  }

  const isMatch = await bcrypt.compare(input.password, customer.password_hash);
  if (!isMatch) {
    return { status: "invalid" as const };
  }

  const user: AuthUser = {
    id: customer.id,
    name: customer.name,
    email: customer.email
  };
  const token = signUserToken(user.id, user.email, "customer");
  return { status: "ok" as const, token, user };
}

export async function resetCustomerPassword(input: { email: string; newPassword: string }) {
  const normalizedEmail = input.email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(input.newPassword, 10);

  const updated = await hasuraAdminRequest<UpdateCustomerPasswordResponse>(
    UPDATE_CUSTOMER_PASSWORD_BY_EMAIL,
    {
      email: normalizedEmail,
      password_hash: passwordHash
    }
  );

  if (updated.update_customers.affected_rows === 0) {
    return { status: "not_found" as const };
  }

  return { status: "ok" as const };
}
