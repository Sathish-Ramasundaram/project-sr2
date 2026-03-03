import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type LoadCartCountPayload = {
  customerId: string;
};

export type AddToCartPayload = {
  customerId: string;
  productId: string;
};

type CartState = {
  count: number;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  info: string | null;
};

const initialState: CartState = {
  count: 0,
  status: "idle",
  error: null,
  info: null
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    loadCartCountRequest: (state, _action: PayloadAction<LoadCartCountPayload>) => {
      state.status = "loading";
      state.error = null;
    },
    loadCartCountSuccess: (state, action: PayloadAction<number>) => {
      state.status = "succeeded";
      state.count = action.payload;
      state.error = null;
    },
    loadCartCountFailure: (state, action: PayloadAction<string>) => {
      state.status = "failed";
      state.error = action.payload;
    },
    addToCartRequest: (state, _action: PayloadAction<AddToCartPayload>) => {
      state.status = "loading";
      state.error = null;
      state.info = null;
    },
    addToCartSuccess: (state, action: PayloadAction<number>) => {
      state.status = "succeeded";
      state.count = action.payload;
      state.error = null;
      state.info = "Item added to cart.";
    },
    addToCartFailure: (state, action: PayloadAction<string>) => {
      state.status = "failed";
      state.error = action.payload;
      state.info = null;
    },
    clearCartFeedback: (state) => {
      state.error = null;
      state.info = null;
      if (state.status !== "loading") {
        state.status = "idle";
      }
    }
  }
});

export const {
  loadCartCountRequest,
  loadCartCountSuccess,
  loadCartCountFailure,
  addToCartRequest,
  addToCartSuccess,
  addToCartFailure,
  clearCartFeedback
} = cartSlice.actions;

export default cartSlice.reducer;
