import { Router } from "express";
import bcrypt from "bcryptjs";
import { hasuraAdminRequest } from "../lib/hasuraClient";
import { signUserToken } from "../lib/jwt";

const authRouter = Router();

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

authRouter.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body ?? {};

    if (!name || !email || !password) {
      res.status(400).json({ message: "Name, email and password are required" });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await hasuraAdminRequest<GetCustomerByEmailResponse>(
      GET_CUSTOMER_BY_EMAIL,
      { email: normalizedEmail }
    );

    if (existing.customers.length > 0) {
      res.status(409).json({ message: "Email already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const created = await hasuraAdminRequest<InsertCustomerResponse>(
      INSERT_CUSTOMER,
      {
        name: String(name).trim(),
        email: normalizedEmail,
        password_hash: passwordHash
      }
    );

    const token = signUserToken(
      created.insert_customers_one.id,
      created.insert_customers_one.email,
      "customer"
    );

    res.status(201).json({
      token,
      user: {
        id: created.insert_customers_one.id,
        name: created.insert_customers_one.name,
        email: created.insert_customers_one.email
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Register failed"
    });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const result = await hasuraAdminRequest<GetCustomerByEmailResponse>(
      GET_CUSTOMER_BY_EMAIL,
      { email: normalizedEmail }
    );

    const customer = result.customers[0];
    if (!customer) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isMatch = await bcrypt.compare(String(password), customer.password_hash);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = signUserToken(customer.id, customer.email, "customer");

    res.json({
      token,
      user: {
        id: customer.id,
        name: customer.name,
        email: customer.email
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Login failed"
    });
  }
});

authRouter.post("/forgot", async (req, res) => {
  try {
    const { email, newPassword, confirmNewPassword } = req.body ?? {};

    if (!email || !newPassword || !confirmNewPassword) {
      res.status(400).json({ message: "All fields are required." });
      return;
    }

    if (String(newPassword) !== String(confirmNewPassword)) {
      res.status(400).json({ message: "New password and confirm password must match." });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const passwordHash = await bcrypt.hash(String(newPassword), 10);

    const updated = await hasuraAdminRequest<UpdateCustomerPasswordResponse>(
      UPDATE_CUSTOMER_PASSWORD_BY_EMAIL,
      {
        email: normalizedEmail,
        password_hash: passwordHash
      }
    );

    if (updated.update_customers.affected_rows === 0) {
      res.status(404).json({ message: "No customer account found with this email." });
      return;
    }

    res.json({ message: "Password reset successful. You can log in now." });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Forgot password failed"
    });
  }
});

export default authRouter;
