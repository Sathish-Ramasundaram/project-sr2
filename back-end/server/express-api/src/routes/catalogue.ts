import { Router } from "express";
import { studentItems } from "../data/catalogue";

const catalogueRouter = Router();

catalogueRouter.get("/students", (_req, res) => {
  res.json(studentItems);
});

export default catalogueRouter;
