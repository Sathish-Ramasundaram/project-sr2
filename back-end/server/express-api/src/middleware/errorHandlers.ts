import { NextFunction, Request, Response } from "express";

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({ message: "Route not found" });
};

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error("Unhandled error:", error.message);
  res.status(500).json({ message: "Internal server error" });
};
