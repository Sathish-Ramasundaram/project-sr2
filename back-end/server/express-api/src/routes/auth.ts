import { Router } from "express";
import {
  forgotPasswordHandler,
  loginHandler,
  registerHandler
} from "../modules/auth/authController";

const authRouter = Router();

authRouter.post("/register", registerHandler);
authRouter.post("/login", loginHandler);
authRouter.post("/forgot", forgotPasswordHandler);

export default authRouter;
