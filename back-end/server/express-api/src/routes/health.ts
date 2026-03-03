import { NextFunction, Router } from "express";
import { readFile } from "node:fs";
import path from "node:path";

const healthRouter = Router();

healthRouter.get("/error-test", (_req, _res, next: NextFunction) => {
  next(new Error("Demo error from /api/error-test"));
});

healthRouter.get("/read-package-callback", (_req, res) => {
  const packageJsonPath = path.resolve(process.cwd(), "package.json");

  readFile(packageJsonPath, "utf8", (error, data) => {
    if (error) {
      res.status(500).json({
        message: "Failed to read package.json",
        error: error.message
      });
      return;
    }

    res.json({
      message: "Read file successfully using fs.readFile callback",
      path: packageJsonPath,
      preview: data.slice(0, 180)
    });
  });
});

healthRouter.get("/read-package-promise", async (_req, res) => {
  const packageJsonPath = path.resolve(process.cwd(), "package.json");

  const readPackageJson = () =>
    new Promise<string>((resolve, reject) => {
      readFile(packageJsonPath, "utf8", (error, data) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(data);
      });
    });

  try {
    const fileContent = await readPackageJson();
    res.json({
      message: "Read file successfully using manual Promise",
      path: packageJsonPath,
      preview: fileContent.slice(0, 180)
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to read package.json",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

healthRouter.get("/", (_req, res) => {
  res.json({
    message: "SR Store API is running",
    time: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
  });
});

export default healthRouter;
