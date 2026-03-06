import { Router } from "express";
import {
  createProductHandler,
  getAdminProductsHandler,
  getSalesSummaryHandler,
  updateCategoryHandler,
  updateDisplayOrderHandler,
  updatePriceHandler,
  updateProductActiveHandler,
  updateReorderThresholdHandler,
  updateStockHandler,
  updateUnitHandler
} from "../modules/adminProducts/adminProductsController";

const adminProductsRouter = Router();

adminProductsRouter.get("/", getAdminProductsHandler);
adminProductsRouter.get("/sales-summary", getSalesSummaryHandler);
adminProductsRouter.post("/", createProductHandler);
adminProductsRouter.patch("/:productId/reorder-threshold", updateReorderThresholdHandler);
adminProductsRouter.patch("/:productId/unit", updateUnitHandler);
adminProductsRouter.patch("/:productId/price", updatePriceHandler);
adminProductsRouter.patch("/:productId/display-order", updateDisplayOrderHandler);
adminProductsRouter.patch("/:productId/stock", updateStockHandler);
adminProductsRouter.patch("/:productId/category", updateCategoryHandler);
adminProductsRouter.patch("/:productId/active", updateProductActiveHandler);

export default adminProductsRouter;
