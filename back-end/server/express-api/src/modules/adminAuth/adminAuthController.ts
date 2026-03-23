import type { Request, Response } from "express";

export async function adminLoginHandler(req: Request, res: Response) {
  try {
    const { email, password } = req.body ?? {};

    if (email === "admin@admin.com" && password === "1234") {
      return res.status(200).json({ message: "Login successful" });
    }

    return res.status(401).json({ message: "Invalid email or password" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}
