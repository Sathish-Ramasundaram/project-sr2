import { Router } from "express";
import { hasuraAdminRequest } from "../lib/hasuraClient";

const adminProductsRouter = Router();

type AdminProductsResponse = {
  products: Array<{
    id: string;
    name: string;
    display_order: number | null;
    category: string | null;
    image_url: string;
    unit: string;
    price: number;
    description: string | null;
    is_active: boolean;
    inventory: {
      stock: number;
      reorder_threshold: number;
    } | null;
  }>;
};

type InsertProductResponse = {
  insert_products_one: {
    id: string;
  } | null;
};

type MaxDisplayOrderResponse = {
  products_aggregate: {
    aggregate: {
      max: {
        display_order: number | null;
      } | null;
    } | null;
  };
};

const GET_ACTIVE_PRODUCTS = `
query GetActiveProductsForAdmin {
  products(
    where: { is_active: { _eq: true } }
    order_by: [{ display_order: asc_nulls_last }, { name: asc }]
  ) {
    id
    name
    display_order
    category
    image_url
    unit
    price
    description
    is_active
    inventory {
      stock
      reorder_threshold
    }
  }
}
`;

const GET_MAX_DISPLAY_ORDER = `
query GetMaxDisplayOrder {
  products_aggregate(where: { is_active: { _eq: true } }) {
    aggregate {
      max {
        display_order
      }
    }
  }
}
`;

const INSERT_PRODUCT = `
mutation InsertProduct(
  $name: String!
  $displayOrder: Int!
  $category: String!
  $sku: String!
  $unit: String!
  $price: numeric!
  $description: String
  $imageUrl: String
) {
  insert_products_one(
    object: {
      name: $name
      display_order: $displayOrder
      category: $category
      sku: $sku
      unit: $unit
      price: $price
      description: $description
      image_url: $imageUrl
      is_active: true
    }
  ) {
    id
  }
}
`;

const INSERT_INVENTORY = `
mutation InsertInventory(
  $productId: uuid!
  $stock: Int!
  $reorderThreshold: Int!
) {
  insert_inventory_one(
    object: {
      product_id: $productId
      stock: $stock
      reorder_threshold: $reorderThreshold
    }
  ) {
    id
  }
}
`;

const SET_REORDER_THRESHOLD = `
mutation SetReorderThreshold($productId: uuid!, $reorderThreshold: Int!) {
  update_inventory(
    where: { product_id: { _eq: $productId } }
    _set: { reorder_threshold: $reorderThreshold }
  ) {
    affected_rows
    returning {
      reorder_threshold
    }
  }
}
`;

const UPDATE_PRODUCT_CATEGORY = `
mutation UpdateProductCategory($productId: uuid!, $category: String!) {
  update_products(
    where: { id: { _eq: $productId } }
    _set: { category: $category }
  ) {
    affected_rows
    returning {
      id
      category
    }
  }
}
`;

const UPDATE_PRODUCT_UNIT = `
mutation UpdateProductUnit($productId: uuid!, $unit: String!) {
  update_products(
    where: { id: { _eq: $productId } }
    _set: { unit: $unit }
  ) {
    affected_rows
    returning {
      id
      unit
    }
  }
}
`;

const UPDATE_PRODUCT_PRICE = `
mutation UpdateProductPrice($productId: uuid!, $price: numeric!) {
  update_products(
    where: { id: { _eq: $productId } }
    _set: { price: $price }
  ) {
    affected_rows
    returning {
      id
      price
    }
  }
}
`;

const UPDATE_PRODUCT_DISPLAY_ORDER = `
mutation UpdateProductDisplayOrder($productId: uuid!, $displayOrder: Int!) {
  update_products(
    where: { id: { _eq: $productId } }
    _set: { display_order: $displayOrder }
  ) {
    affected_rows
    returning {
      id
      display_order
    }
  }
}
`;

const SET_STOCK = `
mutation SetStock($productId: uuid!, $stock: Int!) {
  update_inventory(
    where: { product_id: { _eq: $productId } }
    _set: { stock: $stock }
  ) {
    affected_rows
    returning {
      stock
    }
  }
}
`;

const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const allowedCategories = new Set([
  "Grains",
  "Vegetables",
  "Dairy",
  "Pulses",
  "Fruits",
  "Essentials"
]);

adminProductsRouter.get("/", async (_req, res) => {
  try {
    const data = await hasuraAdminRequest<AdminProductsResponse>(GET_ACTIVE_PRODUCTS);

    res.json(
      data.products.map((product) => ({
        id: product.id,
        name: product.name,
        displayOrder: product.display_order ?? 1,
        category: product.category ?? "Essentials",
        imageUrl: product.image_url ?? "",
        quantity: product.unit,
        price: Number(product.price),
        description: product.description ?? "",
        stock: product.inventory?.stock ?? 0,
        reorderThreshold: product.inventory?.reorder_threshold ?? 0
      }))
    );
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to load admin products"
    });
  }
});

adminProductsRouter.post("/", async (req, res) => {
  const {
    name,
    description,
    imageUrl
  } = req.body as {
    name?: string;
    description?: string;
    imageUrl?: string;
  };

  if (!name?.trim()) {
    res.status(400).json({ message: "name is required." });
    return;
  }

  try {
    const maxOrderResult = await hasuraAdminRequest<MaxDisplayOrderResponse>(GET_MAX_DISPLAY_ORDER);
    const nextDisplayOrder =
      (maxOrderResult.products_aggregate.aggregate?.max?.display_order ?? 0) + 1;

    const sku = `${slugify(name)}-${Date.now()}`;
    const productResult = await hasuraAdminRequest<InsertProductResponse>(INSERT_PRODUCT, {
      name: name.trim(),
      displayOrder: nextDisplayOrder,
      category: "Essentials",
      sku,
      unit: "1 unit",
      price: 0,
      description: description?.trim() || null,
      imageUrl: imageUrl?.trim() || null
    });

    const createdId = productResult.insert_products_one?.id;
    if (!createdId) {
      throw new Error("Product creation failed.");
    }

    await hasuraAdminRequest(INSERT_INVENTORY, {
      productId: createdId,
      stock: 0,
      reorderThreshold: 100
    });

    res.status(201).json({ message: "Product created successfully." });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to create product."
    });
  }
});

adminProductsRouter.patch("/:productId/reorder-threshold", async (req, res) => {
  const { productId } = req.params;
  const { reorderThreshold } = req.body as { reorderThreshold?: number };

  const parsedThreshold = Number(reorderThreshold);
  if (!Number.isFinite(parsedThreshold) || parsedThreshold < 0) {
    res.status(400).json({ message: "reorderThreshold must be zero or positive." });
    return;
  }

  try {
    const result = await hasuraAdminRequest<{
      update_inventory: {
        affected_rows: number;
        returning: Array<{ reorder_threshold: number }>;
      };
    }>(SET_REORDER_THRESHOLD, {
      productId,
      reorderThreshold: Math.floor(parsedThreshold)
    });

    if (result.update_inventory.affected_rows === 0) {
      res.status(404).json({ message: "Inventory record not found for this product." });
      return;
    }

    res.json({
      message: "Reorder threshold updated successfully.",
      reorderThreshold: result.update_inventory.returning[0]?.reorder_threshold ?? null
    });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to update reorder threshold."
    });
  }
});

adminProductsRouter.patch("/:productId/unit", async (req, res) => {
  const { productId } = req.params;
  const { unit } = req.body as { unit?: string };
  const normalizedUnit = unit?.trim() ?? "";

  if (!normalizedUnit) {
    res.status(400).json({ message: "unit is required." });
    return;
  }

  try {
    const result = await hasuraAdminRequest<{
      update_products: {
        affected_rows: number;
        returning: Array<{ id: string; unit: string | null }>;
      };
    }>(UPDATE_PRODUCT_UNIT, {
      productId,
      unit: normalizedUnit
    });

    if (result.update_products.affected_rows === 0) {
      res.status(404).json({ message: "Product not found." });
      return;
    }

    res.json({
      message: "Product unit updated successfully.",
      unit: result.update_products.returning[0]?.unit ?? null
    });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to update unit."
    });
  }
});

adminProductsRouter.patch("/:productId/price", async (req, res) => {
  const { productId } = req.params;
  const { price } = req.body as { price?: number };
  const parsedPrice = Number(price);

  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    res.status(400).json({ message: "price must be zero or positive." });
    return;
  }

  try {
    const result = await hasuraAdminRequest<{
      update_products: {
        affected_rows: number;
        returning: Array<{ id: string; price: number | null }>;
      };
    }>(UPDATE_PRODUCT_PRICE, {
      productId,
      price: parsedPrice
    });

    if (result.update_products.affected_rows === 0) {
      res.status(404).json({ message: "Product not found." });
      return;
    }

    res.json({
      message: "Product price updated successfully.",
      price: result.update_products.returning[0]?.price ?? null
    });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to update price."
    });
  }
});

adminProductsRouter.patch("/:productId/display-order", async (req, res) => {
  const { productId } = req.params;
  const { displayOrder } = req.body as { displayOrder?: number };
  const parsedDisplayOrder = Number(displayOrder);

  if (!Number.isFinite(parsedDisplayOrder) || parsedDisplayOrder < 0) {
    res.status(400).json({ message: "displayOrder must be zero or positive." });
    return;
  }

  try {
    const result = await hasuraAdminRequest<{
      update_products: {
        affected_rows: number;
        returning: Array<{ id: string; display_order: number | null }>;
      };
    }>(UPDATE_PRODUCT_DISPLAY_ORDER, {
      productId,
      displayOrder: Math.floor(parsedDisplayOrder)
    });

    if (result.update_products.affected_rows === 0) {
      res.status(404).json({ message: "Product not found." });
      return;
    }

    res.json({
      message: "Display order updated successfully.",
      displayOrder: result.update_products.returning[0]?.display_order ?? null
    });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to update display order."
    });
  }
});

adminProductsRouter.patch("/:productId/stock", async (req, res) => {
  const { productId } = req.params;
  const { stock } = req.body as { stock?: number };
  const parsedStock = Number(stock);

  if (!Number.isFinite(parsedStock) || parsedStock < 0) {
    res.status(400).json({ message: "stock must be zero or positive." });
    return;
  }

  try {
    const result = await hasuraAdminRequest<{
      update_inventory: {
        affected_rows: number;
        returning: Array<{ stock: number }>;
      };
    }>(SET_STOCK, {
      productId,
      stock: Math.floor(parsedStock)
    });

    if (result.update_inventory.affected_rows === 0) {
      res.status(404).json({ message: "Inventory record not found for this product." });
      return;
    }

    res.json({
      message: "Stock updated successfully.",
      stock: result.update_inventory.returning[0]?.stock ?? null
    });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to update stock."
    });
  }
});

adminProductsRouter.patch("/:productId/category", async (req, res) => {
  const { productId } = req.params;
  const { category } = req.body as { category?: string };
  const normalizedCategory = category?.trim() ?? "";

  if (!allowedCategories.has(normalizedCategory)) {
    res.status(400).json({ message: "Invalid category value." });
    return;
  }

  try {
    const result = await hasuraAdminRequest<{
      update_products: {
        affected_rows: number;
        returning: Array<{ id: string; category: string | null }>;
      };
    }>(UPDATE_PRODUCT_CATEGORY, {
      productId,
      category: normalizedCategory
    });

    if (result.update_products.affected_rows === 0) {
      res.status(404).json({ message: "Product not found." });
      return;
    }

    res.json({
      message: "Product category updated successfully.",
      category: result.update_products.returning[0]?.category ?? null
    });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to update category."
    });
  }
});

export default adminProductsRouter;
