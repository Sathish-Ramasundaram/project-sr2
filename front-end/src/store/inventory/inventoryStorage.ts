type InventoryItem = {
  productId: string;
  stock: number;
  sold: number;
  salesHistory: number[];
};

type InventoryState = {
  items: InventoryItem[];
};

const INVENTORY_STORAGE_KEY = "sr_store_inventory";

export const createDefaultInventoryState = (): InventoryState => ({
  items: [],
});

const isInventoryState = (value: unknown): value is InventoryState => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as { items?: unknown };
  return Array.isArray(candidate.items);
};

const sanitizeInventoryState = (state: InventoryState): InventoryState => ({
  items: state.items.map((item) => ({
    ...item,
    salesHistory: Array.isArray((item as { salesHistory?: unknown }).salesHistory)
      ? ((item as { salesHistory: unknown[] }).salesHistory.filter(
          (entry): entry is number => typeof entry === "number"
        ))
      : [],
  })),
});

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
    return sanitizeInventoryState(parsed);
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
