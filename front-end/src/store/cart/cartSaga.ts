import { call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import { graphqlRequest } from "../../api/graphqlClient";
import {
  GET_CART_COUNT_BY_CUSTOMER,
  GET_CART_ITEM_QUANTITY,
  UPSERT_CART_ITEM
} from "../../api/operations";
import { productAddedToCart } from "../inventory/inventorySlice";
import {
  addToCartFailure,
  addToCartRequest,
  addToCartSuccess,
  loadCartCountFailure,
  loadCartCountRequest,
  loadCartCountSuccess,
  type AddToCartPayload,
  type LoadCartCountPayload
} from "./cartSlice";

type CartCountResponse = {
  cart_items_aggregate: {
    aggregate: {
      sum: {
        quantity: number | null;
      } | null;
    } | null;
  };
};

type CartItemQuantityResponse = {
  cart_items: Array<{
    id: string;
    quantity: number;
  }>;
};

function* resolveCartCount(customerId: string) {
  const cartCountData: CartCountResponse = yield call(
    graphqlRequest<CartCountResponse>,
    GET_CART_COUNT_BY_CUSTOMER,
    { customerId }
  );

  return cartCountData.cart_items_aggregate.aggregate?.sum?.quantity ?? 0;
}

function* handleLoadCartCount(action: PayloadAction<LoadCartCountPayload>) {
  const { customerId } = action.payload;

  if (!customerId) {
    yield put(loadCartCountSuccess(0));
    return;
  }

  try {
    const quantitySum: number = yield call(resolveCartCount, customerId);
    yield put(loadCartCountSuccess(quantitySum));
  } catch (error) {
    yield put(
      loadCartCountFailure(
        error instanceof Error ? error.message : "Failed to load cart count."
      )
    );
  }
}

function* handleAddToCart(action: PayloadAction<AddToCartPayload>) {
  const { customerId, productId } = action.payload;

  if (!customerId || !productId) {
    yield put(addToCartFailure("Customer and product are required."));
    return;
  }

  try {
    const cartItemData: CartItemQuantityResponse = yield call(
      graphqlRequest<CartItemQuantityResponse>,
      GET_CART_ITEM_QUANTITY,
      {
        customerId,
        productId
      }
    );
    const currentQuantity = cartItemData.cart_items[0]?.quantity ?? 0;

    yield call(
      graphqlRequest,
      UPSERT_CART_ITEM,
      {
        customerId,
        productId,
        quantity: currentQuantity + 1
      }
    );

    const updatedCount: number = yield call(resolveCartCount, customerId);
    yield put(productAddedToCart(productId));
    yield put(addToCartSuccess(updatedCount));
  } catch (error) {
    yield put(
      addToCartFailure(
        error instanceof Error ? error.message : "Failed to add item to cart."
      )
    );
  }
}

export function* cartSaga() {
  yield takeLatest(loadCartCountRequest, handleLoadCartCount);
  yield takeLatest(addToCartRequest, handleAddToCart);
}
