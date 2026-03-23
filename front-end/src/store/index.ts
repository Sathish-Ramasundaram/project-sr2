import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import rootSaga from "@/store/rootSaga";
import authReducer from "@/store/auth/authSlice";
import cartReducer from "@/store/cart/cartSlice";
import inventoryReducer from "@/store/inventory/inventorySlice";
import { saveInventoryState } from "@/store/inventory/inventoryStorage";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    inventory: inventoryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(sagaMiddleware),
});

store.subscribe(() => {
  saveInventoryState(store.getState().inventory);
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
