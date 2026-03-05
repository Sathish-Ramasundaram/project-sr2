import { Router } from "express";
import { placeOrderHandler } from "../modules/checkout/checkoutController";

const checkoutRouter = Router();

checkoutRouter.post("/place-order", placeOrderHandler);

export default checkoutRouter;
