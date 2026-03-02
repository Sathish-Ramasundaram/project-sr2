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

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
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

export const { productAddedToCart } = inventorySlice.actions;
export default inventorySlice.reducer;