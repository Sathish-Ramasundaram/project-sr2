import { Request, Response } from "express";
import {
  createProduct,
  getAdminProducts,
  getSalesSummary,
  updateCategory,
  updateDisplayOrder,
  updatePrice,
  updateReorderThreshold,
  updateStock,
  updateUnit
} from "./adminProductsService";
import {
  isValidCategory,
  parseDateInput,
  toNonNegativeInteger,
  toNonNegativeNumber,
  toTrimmedString
} from "./adminProductsValidation";

const respondServerError = (res: Response, error: unknown, fallbackMessage: string) => {
  res.status(500).json({
    message: error instanceof Error ? error.message : fallbackMessage
  });
};

const readProductIdParam = (req: Request): string => {
  const raw = req.params.productId;
  if (Array.isArray(raw)) {
    return raw[0] ?? "";
  }
  return raw ?? "";
};

export async function getAdminProductsHandler(_req: Request, res: Response) {
  try {
    const products = await getAdminProducts();
    res.json(products);
  } catch (error) {
    respondServerError(res, error, "Failed to load admin products");
  }
}

export async function getSalesSummaryHandler(req: Request, res: Response) {
  const now = new Date();
  const defaultFrom = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
  defaultFrom.setHours(0, 0, 0, 0);
  const defaultTo = new Date(now);
  defaultTo.setHours(23, 59, 59, 999);

  const fromInput = typeof req.query.from === "string" ? req.query.from : undefined;
  const toInput = typeof req.query.to === "string" ? req.query.to : undefined;

  const fromDate = parseDateInput(fromInput, defaultFrom);
  const toDate = parseDateInput(toInput, defaultTo);

  if (fromDate.getTime() > toDate.getTime()) {
    res.status(400).json({ message: "'from' date cannot be greater than 'to' date." });
    return;
  }

  try {
    const summary = await getSalesSummary(fromDate.toISOString(), toDate.toISOString());
    res.json({
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
      totalRevenue: summary.totalRevenue,
      items: summary.items
    });
  } catch (error) {
    respondServerError(res, error, "Failed to load sales summary.");
  }
}

export async function createProductHandler(req: Request, res: Response) {
  const name = toTrimmedString((req.body as { name?: unknown } | undefined)?.name);
  const description = toTrimmedString((req.body as { description?: unknown } | undefined)?.description);
  const imageUrl = toTrimmedString((req.body as { imageUrl?: unknown } | undefined)?.imageUrl);

  if (!name) {
    res.status(400).json({ message: "name is required." });
    return;
  }

  try {
    await createProduct({
      name,
      description,
      imageUrl
    });
    res.status(201).json({ message: "Product created successfully." });
  } catch (error) {
    respondServerError(res, error, "Failed to create product.");
  }
}

export async function updateReorderThresholdHandler(req: Request, res: Response) {
  const productId = readProductIdParam(req);
  if (!productId) {
    res.status(400).json({ message: "productId is required." });
    return;
  }
  const reorderThreshold = toNonNegativeInteger((req.body as { reorderThreshold?: unknown } | undefined)?.reorderThreshold);

  if (reorderThreshold === null) {
    res.status(400).json({ message: "reorderThreshold must be zero or positive." });
    return;
  }

  try {
    const updated = await updateReorderThreshold(productId, reorderThreshold);
    if (updated === null) {
      res.status(404).json({ message: "Inventory record not found for this product." });
      return;
    }

    res.json({
      message: "Reorder threshold updated successfully.",
      reorderThreshold: updated
    });
  } catch (error) {
    respondServerError(res, error, "Failed to update reorder threshold.");
  }
}

export async function updateUnitHandler(req: Request, res: Response) {
  const productId = readProductIdParam(req);
  if (!productId) {
    res.status(400).json({ message: "productId is required." });
    return;
  }
  const unit = toTrimmedString((req.body as { unit?: unknown } | undefined)?.unit);

  if (!unit) {
    res.status(400).json({ message: "unit is required." });
    return;
  }

  try {
    const updated = await updateUnit(productId, unit);
    if (updated === null) {
      res.status(404).json({ message: "Product not found." });
      return;
    }

    res.json({
      message: "Product unit updated successfully.",
      unit: updated
    });
  } catch (error) {
    respondServerError(res, error, "Failed to update unit.");
  }
}

export async function updatePriceHandler(req: Request, res: Response) {
  const productId = readProductIdParam(req);
  if (!productId) {
    res.status(400).json({ message: "productId is required." });
    return;
  }
  const price = toNonNegativeNumber((req.body as { price?: unknown } | undefined)?.price);

  if (price === null) {
    res.status(400).json({ message: "price must be zero or positive." });
    return;
  }

  try {
    const updated = await updatePrice(productId, price);
    if (updated === null) {
      res.status(404).json({ message: "Product not found." });
      return;
    }

    res.json({
      message: "Product price updated successfully.",
      price: updated
    });
  } catch (error) {
    respondServerError(res, error, "Failed to update price.");
  }
}

export async function updateDisplayOrderHandler(req: Request, res: Response) {
  const productId = readProductIdParam(req);
  if (!productId) {
    res.status(400).json({ message: "productId is required." });
    return;
  }
  const displayOrder = toNonNegativeInteger((req.body as { displayOrder?: unknown } | undefined)?.displayOrder);

  if (displayOrder === null) {
    res.status(400).json({ message: "displayOrder must be zero or positive." });
    return;
  }

  try {
    const updated = await updateDisplayOrder(productId, displayOrder);
    if (updated === null) {
      res.status(404).json({ message: "Product not found." });
      return;
    }

    res.json({
      message: "Display order updated successfully.",
      displayOrder: updated
    });
  } catch (error) {
    respondServerError(res, error, "Failed to update display order.");
  }
}

export async function updateStockHandler(req: Request, res: Response) {
  const productId = readProductIdParam(req);
  if (!productId) {
    res.status(400).json({ message: "productId is required." });
    return;
  }
  const stock = toNonNegativeInteger((req.body as { stock?: unknown } | undefined)?.stock);

  if (stock === null) {
    res.status(400).json({ message: "stock must be zero or positive." });
    return;
  }

  try {
    const updated = await updateStock(productId, stock);
    if (updated === null) {
      res.status(404).json({ message: "Inventory record not found for this product." });
      return;
    }

    res.json({
      message: "Stock updated successfully.",
      stock: updated
    });
  } catch (error) {
    respondServerError(res, error, "Failed to update stock.");
  }
}

export async function updateCategoryHandler(req: Request, res: Response) {
  const productId = readProductIdParam(req);
  if (!productId) {
    res.status(400).json({ message: "productId is required." });
    return;
  }
  const category = toTrimmedString((req.body as { category?: unknown } | undefined)?.category);

  if (!isValidCategory(category)) {
    res.status(400).json({ message: "Invalid category value." });
    return;
  }

  try {
    const updated = await updateCategory(productId, category);
    if (updated === null) {
      res.status(404).json({ message: "Product not found." });
      return;
    }

    res.json({
      message: "Product category updated successfully.",
      category: updated
    });
  } catch (error) {
    respondServerError(res, error, "Failed to update category.");
  }
}
