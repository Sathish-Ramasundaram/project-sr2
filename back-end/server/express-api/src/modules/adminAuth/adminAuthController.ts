import type { Request, Response } from "express";
import { signUserToken } from "../../lib/jwt";

export async function adminLoginHandler(req: Request, res: Response) {
  try {
    const { email, password } = req.body ?? {};

    if (email === "admin@admin.com" && password === "1234") {
      const token = signUserToken("admin", email, "admin");
      return res.status(200).json({ message: "Login successful", token });
    }

    return res.status(401).json({ message: "Invalid email or password" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}
