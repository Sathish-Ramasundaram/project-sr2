import { Router } from "express";
import { adminLoginHandler } from "../modules/adminAuth/adminAuthController";

const adminAuthRouter = Router();

adminAuthRouter.post("/login", adminLoginHandler);

export default adminAuthRouter;
