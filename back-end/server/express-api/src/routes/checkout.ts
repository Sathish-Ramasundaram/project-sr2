import { Router } from "express";
import {
  getCheckoutStatusHandler,
  placeOrderHandler
} from "../modules/checkout/checkoutController";

const checkoutRouter = Router();

checkoutRouter.post("/place-order", placeOrderHandler);
checkoutRouter.get("/status/:workflowId", getCheckoutStatusHandler);

export default checkoutRouter;
