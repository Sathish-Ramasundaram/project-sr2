import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { loadInventoryState } from "./inventoryStorage";

type InventoryItem = {
  productId: string;
  stock: number;
  sold: number;
  salesHistory: number[];
};

type InventoryState = {
  items: InventoryItem[];
};

const initialState: InventoryState = loadInventoryState();
const getDefaultStock = (productId: string) => (productId === "egg" ? 120 : 200);

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    hydrateInventoryItems: (state, action: PayloadAction<InventoryItem[]>) => {
      state.items = action.payload.map((item) => ({
        productId: item.productId,
        stock: item.stock,
        sold: item.sold,
        salesHistory: Array.isArray(item.salesHistory) ? item.salesHistory : [],
      }));
    },
    syncInventoryProducts: (state, action: PayloadAction<string[]>) => {
      action.payload.forEach((productId) => {
        const existingItem = state.items.find((entry) => entry.productId === productId);
        if (existingItem) {
          if (!Array.isArray(existingItem.salesHistory)) {
            existingItem.salesHistory = [];
          }
          return;
        }

        const defaultStock = getDefaultStock(productId);
        state.items.push({
          productId,
          stock: defaultStock,
          sold: 0,
          salesHistory: [],
        });
      });
    },
    orderPaid: (
      state,
      action: PayloadAction<Array<{ productId: string; quantity: number }>>
    ) => {
      const paidAt = Date.now();
      action.payload.forEach(({ productId, quantity }) => {
        const item = state.items.find((entry) => entry.productId === productId);
        if (!item || quantity <= 0) {
          return;
        }

        item.stock = Math.max(0, item.stock - quantity);
        item.sold += quantity;
        for (let index = 0; index < quantity; index += 1) {
          item.salesHistory.push(paidAt);
        }
      });
    },
  },
});

export const { hydrateInventoryItems, syncInventoryProducts, orderPaid } = inventorySlice.actions;
export default inventorySlice.reducer;
