import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { loadInventoryState } from "./inventoryStorage";

type InventoryItem = {
  productId: string;
  stock: number;
  sold: number;
  initialStock: number;
};

type InventoryState = {
  items: InventoryItem[];
};

const initialState: InventoryState = loadInventoryState();
const getDefaultInitialStock = (productId: string) => (productId === "egg" ? 120 : 200);

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    syncInventoryProducts: (state, action: PayloadAction<string[]>) => {
      action.payload.forEach((productId) => {
        const existingItem = state.items.find((entry) => entry.productId === productId);
        if (existingItem) {
          return;
        }

        const initialStock = getDefaultInitialStock(productId);
        state.items.push({
          productId,
          stock: initialStock,
          sold: 0,
          initialStock,
        });
      });
    },
    productAddedToCart: (state, action: PayloadAction<string>) => {
      const item = state.items.find((entry) => entry.productId === action.payload);
      if (!item || item.stock <= 0) {
        return;
      }

      item.stock -= 1;
      item.sold += 1;
    },
  },
});

export const { syncInventoryProducts, productAddedToCart } = inventorySlice.actions;
export default inventorySlice.reducer;
