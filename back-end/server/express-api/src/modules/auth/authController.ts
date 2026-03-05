import { Request, Response } from "express";
import { loginCustomer, registerCustomer, resetCustomerPassword } from "./authService";

const serverError = (res: Response, error: unknown, fallback: string) => {
  res.status(500).json({
    message: error instanceof Error ? error.message : fallback
  });
};

const asString = (value: unknown): string => (typeof value === "string" ? value : "");

export async function registerHandler(req: Request, res: Response) {
  try {
    const name = asString((req.body as { name?: unknown } | undefined)?.name);
    const email = asString((req.body as { email?: unknown } | undefined)?.email);
    const password = asString((req.body as { password?: unknown } | undefined)?.password);

    if (!name || !email || !password) {
      res.status(400).json({ message: "Name, email and password are required" });
      return;
    }

    const result = await registerCustomer({ name, email, password });
    if (result.status === "exists") {
      res.status(409).json({ message: "Email already exists" });
      return;
    }

    res.status(201).json({
      token: result.token,
      user: result.user
    });
  } catch (error) {
    serverError(res, error, "Register failed");
  }
}

export async function loginHandler(req: Request, res: Response) {
  try {
    const email = asString((req.body as { email?: unknown } | undefined)?.email);
    const password = asString((req.body as { password?: unknown } | undefined)?.password);

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const result = await loginCustomer({ email, password });
    if (result.status === "invalid") {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    res.json({
      token: result.token,
      user: result.user
    });
  } catch (error) {
    serverError(res, error, "Login failed");
  }
}

export async function forgotPasswordHandler(req: Request, res: Response) {
  try {
    const email = asString((req.body as { email?: unknown } | undefined)?.email);
    const newPassword = asString((req.body as { newPassword?: unknown } | undefined)?.newPassword);
    const confirmNewPassword = asString(
      (req.body as { confirmNewPassword?: unknown } | undefined)?.confirmNewPassword
    );

    if (!email || !newPassword || !confirmNewPassword) {
      res.status(400).json({ message: "All fields are required." });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      res.status(400).json({ message: "New password and confirm password must match." });
      return;
    }

    const result = await resetCustomerPassword({ email, newPassword });
    if (result.status === "not_found") {
      res.status(404).json({ message: "No customer account found with this email." });
      return;
    }

    res.json({ message: "Password reset successful. You can log in now." });
  } catch (error) {
    serverError(res, error, "Forgot password failed");
  }
}
