import { products } from "../../data/products";

type InventoryItem = {
  productId: string;
  stock: number;
  sold: number;
  initialStock: number;
};

type InventoryState = {
  items: InventoryItem[];
};

const INVENTORY_STORAGE_KEY = "sr_store_inventory";

const getDefaultInitialStock = (productId: string) => (productId === "egg" ? 120 : 200);

export const createDefaultInventoryState = (): InventoryState => ({
  items: products.map((product) => {
    const initialStock = getDefaultInitialStock(product.id);
    return {
      productId: product.id,
      stock: initialStock,
      sold: 0,
      initialStock,
    };
  }),
});

const normalizeItem = (
  productId: string,
  existing: Partial<InventoryItem> | undefined,
): InventoryItem => {
  const initialStock =
    typeof existing?.initialStock === "number" && existing.initialStock > 0
      ? existing.initialStock
      : getDefaultInitialStock(productId);

  const stock =
    typeof existing?.stock === "number" && existing.stock >= 0 ? existing.stock : initialStock;

  const sold = typeof existing?.sold === "number" && existing.sold >= 0 ? existing.sold : 0;

  return {
    productId,
    stock,
    sold,
    initialStock,
  };
};

const isInventoryState = (value: unknown): value is InventoryState => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as { items?: unknown };
  return Array.isArray(candidate.items);
};

export const loadInventoryState = (): InventoryState => {
  const defaults = createDefaultInventoryState();

  try {
    const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (!raw) {
      return defaults;
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!isInventoryState(parsed)) {
      return defaults;
    }

    const byId = new Map(parsed.items.map((item) => [item.productId, item]));

    return {
      items: products.map((product) => normalizeItem(product.id, byId.get(product.id))),
    };
  } catch {
    return defaults;
  }
};

export const saveInventoryState = (state: InventoryState): void => {
  try {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage write failures in restricted environments.
  }
};